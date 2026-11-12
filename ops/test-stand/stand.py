"""Isolated Community OS stand, accessed through a loopback Docker SSH forward."""

import argparse
import hashlib
import http.client
import io
import json
import re
import socket
import socketserver
import struct
import subprocess
import sys
import tarfile
import tempfile
import threading
import time
from pathlib import Path
from urllib.parse import quote, urlencode

ROOT = Path(__file__).resolve().parents[2]
PREFIX = "communityos-test-stand"
LABEL = "org.communityos.stand"
LABELS = {LABEL: PREFIX}
POSTGRES = "postgres:18.6@sha256:7341002d2b8c7c5bdd7542a671a95b36196c0b5b888daf454ae4fc33ba5346d7"
PLATFORM = "communityos_platform"
REGISTER = "communityos_register"
MIGRATOR = "stand_migrator"
WEB_ROLE = "stand_web"


class Docker:
    def __init__(self, port):
        self.port = port

    def call(self, method, path, body=None, *, missing=False, headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=900)
        try:
            if isinstance(body, dict):
                body = json.dumps(body).encode()
                headers = {"Content-Type": "application/json"}
            connection.request(method, path, body, headers or {})
            response = connection.getresponse()
            data = response.read()
            if missing and response.status == 404:
                return None
            if response.status >= 300 and response.status != 304:
                raise RuntimeError(f"Docker {method} {path.split('?')[0]} returned HTTP {response.status}")
            return json.loads(data) if "application/json" in response.getheader("Content-Type", "") else data
        finally:
            connection.close()

    def exec_id(self, container, argv, *, stdin=False, environment=None):
        return self.call("POST", f"/containers/{container}/exec", {
            "Cmd": argv, "AttachStdin": stdin, "AttachStdout": True, "AttachStderr": True,
            "Env": environment or [], "Tty": False,
        })["Id"]

    def hijack(self, exec_id):
        sock = socket.create_connection(("127.0.0.1", self.port), timeout=15)
        try:
            body = b'{"Detach":false,"Tty":false}'
            sock.sendall(
                f"POST /exec/{exec_id}/start HTTP/1.1\r\nHost: localhost\r\n"
                f"Connection: Upgrade\r\nUpgrade: tcp\r\nContent-Type: application/json\r\n"
                f"Content-Length: {len(body)}\r\n\r\n".encode() + body
            )
            stream = sock.makefile("rb")
            status = stream.readline().split()
            if len(status) < 2 or status[1] != b"101":
                stream.close()
                raise RuntimeError("Docker did not upgrade the private exec stream")
            while stream.readline() not in (b"\r\n", b""):
                pass
            sock.settimeout(None)
            return sock, stream
        except BaseException:
            sock.close()
            raise

    def run(self, container, argv, *, data=None, environment=None):
        exec_id = self.exec_id(container, argv, stdin=data is not None, environment=environment)
        if data is None:
            raw = self.call("POST", f"/exec/{exec_id}/start", {"Detach": False, "Tty": False})
            output = b"".join(payload for channel, payload in frames(io.BytesIO(raw)) if channel == 1)
        else:
            sock, stream = self.hijack(exec_id)
            with sock, stream:
                sock.sendall(data)
                sock.shutdown(socket.SHUT_WR)
                output = b"".join(payload for channel, payload in frames(stream) if channel == 1)

        if self.call("GET", f"/exec/{exec_id}/json")["ExitCode"] != 0:
            raise RuntimeError(f"Stand command failed in {container}: {argv[0]}")
        return output.decode("utf-8").strip()

    def container(self, part):
        name = f"{PREFIX}-{part}"
        info = self.call("GET", f"/containers/{name}/json", missing=True)
        if info and info["Config"].get("Labels", {}).get(LABEL) != PREFIX:
            raise RuntimeError(f"Refusing to use unowned container {name}")
        return name, info

    def ensure_network(self):
        existing = self.call("GET", f"/networks/{PREFIX}", missing=True)
        if existing:
            if existing.get("Labels", {}).get(LABEL) != PREFIX or not existing["Internal"]:
                raise RuntimeError("Refusing to use an unowned or non-internal network")
            return
        self.call("POST", "/networks/create", {"Name": PREFIX, "Internal": True, "Labels": LABELS})

    def ensure_volume(self, part):
        name = f"{PREFIX}-{part}"
        existing = self.call("GET", f"/volumes/{name}", missing=True)
        if existing and (existing.get("Labels") or {}).get(LABEL) != PREFIX:
            raise RuntimeError(f"Refusing to use unowned volume {name}")
        if not existing:
            self.call("POST", "/volumes/create", {"Name": name, "Labels": LABELS})
        return name

    def ensure_container(self, part, *, image, env, command=None, mounts=None, start=True):
        name, existing = self.container(part)
        desired = self.call("GET", f"/images/{quote(image, safe='')}/json")["Id"]
        if existing and (existing["Image"] != desired or
                         not set(env).issubset(existing["Config"]["Env"]) or
                         existing["HostConfig"]["NetworkMode"] != PREFIX or
                         existing["HostConfig"].get("PortBindings")):
            raise RuntimeError(f"{name} differs from the private stand configuration.")
        if not existing:
            body = {
                "Image": desired, "Env": env, "Labels": LABELS,
                "HostConfig": {"NetworkMode": PREFIX, "Mounts": mounts or []},
            }
            if command:
                body["Cmd"] = command
            self.call("POST", "/containers/create?" + urlencode({"name": name}), body)
        if start and (not existing or not existing["State"]["Running"]):
            self.call("POST", f"/containers/{name}/start")
        return name

    def wait_postgres(self, name):
        for _ in range(30):
            try:
                self.run(name, ["pg_isready", "-h", "127.0.0.1", "-U", MIGRATOR, "-d", PLATFORM])
                return
            except RuntimeError:
                time.sleep(1)
        raise RuntimeError("Stand PostgreSQL did not become ready")

    def build(self, tag):
        files = subprocess.check_output(["git", "ls-files", "-z", "--", "src"], cwd=ROOT).decode().split("\0")
        files += [".dockerignore", "global.json", "Directory.Build.props", "Directory.Packages.props",
                  "ops/test-stand/Dockerfile"]
        with tempfile.TemporaryFile() as archive:
            with tarfile.open(fileobj=archive, mode="w") as tar:
                for item in sorted(set(filter(None, files))):
                    tar.add(ROOT / item, arcname=item, recursive=False)
            size = archive.tell()
            archive.seek(0)
            connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=900)
            try:
                query = urlencode({"dockerfile": "ops/test-stand/Dockerfile", "t": tag, "version": "1", "rm": "true"})
                connection.request("POST", "/build?" + query, archive, {
                    "Content-Type": "application/x-tar", "Content-Length": str(size),
                })
                response = connection.getresponse()
                if response.status != 200:
                    raise RuntimeError(f"Docker build returned HTTP {response.status}")
                for line in response:
                    event = json.loads(line)
                    if "error" in event:
                        raise RuntimeError(event["error"])
                    if "stream" in event:
                        print(event["stream"], end="", flush=True)
            finally:
                connection.close()

    def put_cert(self, name, path):
        with io.BytesIO() as archive:
            with tarfile.open(fileobj=archive, mode="w") as tar:
                payload = path.read_bytes()
                entry = tarfile.TarInfo("https.pfx")
                entry.size = len(payload)
                entry.mode = 0o440
                entry.uid = entry.gid = 1654
                tar.addfile(entry, io.BytesIO(payload))
            self.call("PUT", f"/containers/{name}/archive?path=/run/stand",
                      archive.getvalue(), headers={"Content-Type": "application/x-tar"})


def frames(stream):
    while header := stream.read(8):
        if len(header) != 8:
            raise RuntimeError("Incomplete Docker stream header")
        length = struct.unpack(">I", header[4:])[0]
        payload = stream.read(length)
        if len(payload) != length:
            raise RuntimeError("Incomplete Docker stream payload")
        yield header[0], payload


def read_config(path):
    path = path.resolve()
    if path.is_relative_to(ROOT):
        raise RuntimeError("Keep the stand configuration and secrets outside the repository")
    config = json.loads(path.read_text(encoding="utf-8-sig"))
    for key in ("postgres_password", "web_password", "pfx_password", "creator_password", "administrator_password"):
        if not re.fullmatch(r"[0-9a-fA-F]{48,128}", config[key]):
            raise RuntimeError(f"Invalid generated secret format: {key}")
    if not re.fullmatch(r"communityos-test-stand:[a-zA-Z0-9_.-]+", config["image"]):
        raise RuntimeError("The image tag must belong to communityos-test-stand")
    return config


def psql(docker, container, database, sql, *, private=False):
    argv = ["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", MIGRATOR, "-d", database]
    if private:
        return docker.run(container, argv, data=(sql + "\n").encode())
    return docker.run(container, argv + ["-c", sql])


def migrate(docker, postgres, database, module):
    psql(docker, postgres, database, """
        CREATE SCHEMA IF NOT EXISTS stand_migration;
        CREATE TABLE IF NOT EXISTS stand_migration.applied (
            name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
        );
    """)
    directory = ROOT / "src" / f"CommunityOS.Modules.{module}" / "Infrastructure" / "Migrations"
    for migration in sorted(directory.glob("*.sql")):
        payload = migration.read_bytes()
        sql = payload.decode("utf-8-sig").strip()
        if not re.fullmatch(r"[0-9]{3}_[a-z_]+\.sql", migration.name) or not sql.startswith("BEGIN;") or not sql.endswith("COMMIT;"):
            raise RuntimeError(f"Unsupported migration format: {migration.name}")
        digest = hashlib.sha256(sql.replace("\r\n", "\n").encode()).hexdigest()
        old = psql(docker, postgres, database,
                   f"SELECT sha256 FROM stand_migration.applied WHERE name = '{migration.name}';")
        if old:
            if old != digest:
                raise RuntimeError(f"Applied migration changed: {migration.name}")
            continue
        psql(docker, postgres, database, f"""BEGIN;
            SELECT pg_advisory_xact_lock(714231);
            INSERT INTO stand_migration.applied (name, sha256) VALUES ('{migration.name}', '{digest}');
            {sql[len('BEGIN;'):-len('COMMIT;')]}
            COMMIT;
        """)
        print(f"Applied {module}/{migration.name}", flush=True)


def web_connection(config, *, migrator=False, database=PLATFORM):
    role = MIGRATOR if migrator else WEB_ROLE
    password = config["postgres_password" if migrator else "web_password"]
    return f"Host={PREFIX}-postgres;Database={database};Username={role};Password={password};Timeout=5"


def migrate_stand(docker):
    postgres, info = docker.container("postgres")
    if not info or not info["State"]["Running"]:
        raise RuntimeError("Start the stand database first")
    if not psql(docker, postgres, PLATFORM, f"SELECT 1 FROM pg_database WHERE datname='{REGISTER}';"):
        psql(docker, postgres, PLATFORM, f"CREATE DATABASE {REGISTER};")
    migrate(docker, postgres, PLATFORM, "Platform")
    migrate(docker, postgres, REGISTER, "Community")


def start_database(docker, config):
    docker.ensure_network()
    data = docker.ensure_volume("postgres-data")
    postgres = docker.ensure_container("postgres", image=POSTGRES, env=[
        f"POSTGRES_USER={MIGRATOR}", f"POSTGRES_DB={PLATFORM}",
        f"POSTGRES_PASSWORD={config['postgres_password']}",
    ], mounts=[{"Type": "volume", "Source": data, "Target": "/var/lib/postgresql"}])
    docker.wait_postgres(postgres)
    print(f"{postgres}: ready", flush=True)


def up(docker, config, config_dir):
    postgres, database = docker.container("postgres")
    if not database or not database["State"]["Running"]:
        raise RuntimeError("Start the database and run migrate before up")
    state = docker.ensure_volume("web-state")
    psql(docker, postgres, PLATFORM, f"""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '{WEB_ROLE}') THEN
                CREATE ROLE {WEB_ROLE} LOGIN PASSWORD '{config['web_password']}';
            END IF;
        END $$;
        GRANT USAGE ON SCHEMA platform_provisioning TO {WEB_ROLE};
        GRANT SELECT ON platform_provisioning.platform_account, platform_provisioning.platform_session,
            platform_provisioning.community_reservation, platform_provisioning.bootstrap_administrator,
            platform_provisioning.bootstrap_security_event TO {WEB_ROLE};
        GRANT UPDATE (login) ON platform_provisioning.platform_account TO {WEB_ROLE};
        GRANT INSERT, UPDATE ON platform_provisioning.platform_session TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.community_reservation, platform_provisioning.bootstrap_administrator,
            platform_provisioning.bootstrap_security_event, platform_provisioning.platform_auth_security_event TO {WEB_ROLE};
        GRANT UPDATE (revoked_at, revoked_by_account_id) ON platform_provisioning.bootstrap_administrator TO {WEB_ROLE};
        GRANT EXECUTE ON FUNCTION platform_provisioning.consume_password_recovery(text, bytea, text, text) TO {WEB_ROLE};
        GRANT SELECT ON platform_provisioning.register_availability, platform_provisioning.register_operator TO {WEB_ROLE};
        GRANT UPDATE (lock_marker) ON platform_provisioning.register_availability,
            platform_provisioning.register_operator TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.register_addition_admission TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.register_import_draft_admission TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.register_import_admission TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.ownership_correction_admission TO {WEB_ROLE};
        GRANT INSERT ON platform_provisioning.electricity_admission TO {WEB_ROLE};
    """, private=True)
    psql(docker, postgres, REGISTER, f"""
        GRANT USAGE ON SCHEMA community_register TO {WEB_ROLE};
        GRANT SELECT ON community_register.subject, community_register.plot, community_register.ownership,
            community_register.personal_account TO {WEB_ROLE};
        GRANT INSERT ON community_register.subject, community_register.plot, community_register.ownership,
            community_register.personal_account, community_register.manual_addition TO {WEB_ROLE};
        GRANT SELECT, INSERT ON community_register.import_draft TO {WEB_ROLE};
        GRANT UPDATE (decisions, revision, updated_at) ON community_register.import_draft TO {WEB_ROLE};
        GRANT SELECT, INSERT ON community_register.register_import, community_register.register_import_item,
            community_register.import_submission TO {WEB_ROLE};
        GRANT UPDATE (applied_plan_id) ON community_register.import_submission TO {WEB_ROLE};
        GRANT INSERT ON community_register.import_approval_event TO {WEB_ROLE};
        GRANT UPDATE (subject_id, revision) ON community_register.ownership TO {WEB_ROLE};
        GRANT SELECT, INSERT ON community_register.ownership_correction,
            community_register.ownership_correction_event TO {WEB_ROLE};
        GRANT USAGE ON SCHEMA community_electricity TO {WEB_ROLE};
        GRANT SELECT, INSERT ON community_electricity.accounting_point, community_electricity.meter,
            community_electricity.installation, community_electricity.reading TO {WEB_ROLE};
        GRANT UPDATE (lock_marker) ON community_electricity.installation TO {WEB_ROLE};
    """)
    web = docker.ensure_container("web", image=config["image"], env=[
        "ASPNETCORE_ENVIRONMENT=Production", "ASPNETCORE_URLS=https://127.0.0.1:8443",
        "ASPNETCORE_Kestrel__Certificates__Default__Path=/run/stand/https.pfx",
        f"ASPNETCORE_Kestrel__Certificates__Default__Password={config['pfx_password']}",
        f"Platform__Database={web_connection(config)}",
        "CommunityRegister__SyntheticStandEnabled=true",
        f"CommunityRegister__Database={web_connection(config, database=REGISTER)}",
    ], mounts=[{"Type": "volume", "Source": state, "Target": "/state"}], start=False)
    _, existing_web = docker.container("web")
    if not existing_web["State"]["Running"]:
        docker.put_cert(web, config_dir / "https.pfx")
        docker.call("POST", f"/containers/{web}/start")
    docker.ensure_container("worker", image=config["image"], env=["DOTNET_ENVIRONMENT=Production"],
                            command=["/app/worker/CommunityOS.Worker.dll"])

    for login, kind, secret in (
        ("stand-creator", "creator", "creator_password"), ("stand-administrator", "user", "administrator_password")
    ):
        account = psql(docker, postgres, PLATFORM,
                       f"SELECT id FROM platform_provisioning.platform_account WHERE login='{login}';")
        if not account:
            account = docker.run(web, ["dotnet", "/app/web/CommunityOS.Web.dll", "platform-account", "add", login, kind],
                                 data=(config[secret] + "\n").encode(),
                                 environment=[f"Platform__Database={web_connection(config, migrator=True)}"])
        print(f"{login}: {account}", flush=True)


class PrivateRelay(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, port, docker):
        self.docker = docker
        super().__init__(("127.0.0.1", port), RelayConnection)


class RelayConnection(socketserver.BaseRequestHandler):
    def handle(self):
        docker = self.server.docker
        try:
            container, info = docker.container("web")
            if not info or not info["State"]["Running"]:
                return
            relay = 'exec 3<>/dev/tcp/127.0.0.1/8443; cat <&3 & reader=$!; trap "kill $reader 2>/dev/null || true" EXIT; cat >&3'
            exec_id = docker.exec_id(container, ["bash", "-c", relay], stdin=True)
            upstream, stream = docker.hijack(exec_id)
            with upstream, stream:
                def write_upstream():
                    try:
                        while data := self.request.recv(65536):
                            upstream.sendall(data)
                    except OSError:
                        pass
                    finally:
                        try:
                            upstream.shutdown(socket.SHUT_WR)
                        except OSError:
                            pass

                threading.Thread(target=write_upstream, daemon=True).start()
                for channel, payload in frames(stream):
                    if channel == 1:
                        self.request.sendall(payload)
        except (OSError, RuntimeError):
            return


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docker-port", type=int, default=23750)
    commands = parser.add_subparsers(dest="command", required=True)
    build = commands.add_parser("build")
    build.add_argument("tag")
    database = commands.add_parser("database")
    database.add_argument("config", type=Path)
    start = commands.add_parser("up")
    start.add_argument("config", type=Path)
    commands.add_parser("migrate")
    commands.add_parser("status")
    commands.add_parser("stop")
    relay = commands.add_parser("relay")
    relay.add_argument("--port", type=int, default=5443)
    args = parser.parse_args()
    docker = Docker(args.docker_port)
    if args.command == "build":
        if not re.fullmatch(r"communityos-test-stand:[a-zA-Z0-9_.-]+", args.tag):
            parser.error("Use a communityos-test-stand tag")
        docker.build(args.tag)
    elif args.command == "database":
        start_database(docker, read_config(args.config))
    elif args.command == "up":
        up(docker, read_config(args.config), args.config.resolve().parent)
    elif args.command == "migrate":
        migrate_stand(docker)
    elif args.command == "relay":
        with PrivateRelay(args.port, docker) as server:
            print(f"Private HTTPS: https://127.0.0.1:{args.port}/platform/", flush=True)
            server.serve_forever()
    else:
        for part in ("worker", "web", "postgres"):
            name, info = docker.container(part)
            if args.command == "stop" and info and info["State"]["Running"]:
                docker.call("POST", f"/containers/{name}/stop?t=15")
            print(f"{name}: {info['State']['Status'] if info and args.command == 'status' else 'stopped' if info else 'missing'}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except (OSError, RuntimeError, ValueError, KeyError) as error:
        sys.exit(str(error))
