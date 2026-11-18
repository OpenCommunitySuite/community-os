"""Bound storage used by the synthetic Community OS Docker stand."""
import argparse
import json
from urllib.parse import quote, urlencode

PREFIX = "communityos-test-stand"
LABEL = "org.communityos.stand"
BUILD_LABEL = "org.communityos.stand.build"


def owned_container(container):
    names = [name.lstrip("/") for name in container.get("Names", [])]
    label = (container.get("Labels") or {}).get(LABEL, "")
    return label.startswith(PREFIX) and any(name.startswith(PREFIX + "-") for name in names)


def cleanup(docker, *, apply=False, keep_images=3):
    if keep_images < 2:
        raise ValueError("Keep at least the current and previous stand image")
    containers = docker.call("GET", "/containers/json?all=true")
    for container in containers:
        names = [name.lstrip("/") for name in container.get("Names", [])]
        protected = any(name in (PREFIX + "-web", PREFIX + "-worker") or name.endswith("-postgres")
                        for name in names)
        if owned_container(container) and container["State"] == "exited" and not protected:
            print("Expired stand container:", container["Id"][:12])
            if apply:
                # No force and no volume deletion. Docker rejects a concurrently restarted container.
                docker.call("DELETE", "/containers/" + container["Id"])

    containers = docker.call("GET", "/containers/json?all=true")
    referenced = {container["ImageID"] for container in containers}
    images = docker.call("GET", "/images/json?all=true")
    owned = [image for image in images if image.get("RepoTags")
             and all(tag.startswith(PREFIX + ":") for tag in image["RepoTags"])]
    keep = referenced | {image["Id"] for image in sorted(owned, key=lambda image: image["Created"],
                                                        reverse=True)[:keep_images]}
    for image in owned:
        if image["Id"] not in keep:
            for tag in image["RepoTags"]:
                print("Expired stand image:", tag)
                if apply:
                    docker.call("DELETE", "/images/" + quote(tag, safe=""))

    # Older builds predate BUILD_LABEL. Match their project-specific build commands,
    # and only consider untagged images with no digest or container reference.
    for image in images:
        if image.get("RepoTags") or image.get("RepoDigests") or image["Id"] in referenced:
            continue
        history = docker.call("GET", "/images/" + image["Id"] + "/history", missing=True)
        if history and any("src/CommunityOS." in layer.get("CreatedBy", "") for layer in history):
            print("Expired legacy stand build:", image["Id"][:19])
            if apply:
                try:
                    docker.call("DELETE", "/images/" + image["Id"], missing=True)
                except RuntimeError as error:
                    if not str(error).endswith("HTTP 409"):
                        raise
                    # A retained descendant or a concurrently created container still needs this image.
    if apply:
        filters = {"label": [BUILD_LABEL + "=true"]}
        result = docker.call("POST", "/images/prune?" + urlencode({"filters": json.dumps(filters)}))
        print("Reclaimed labelled build bytes:", result.get("SpaceReclaimed", 0))


def require_free_space(docker, minimum_bytes=2 * 1024**3):
    # PostgreSQL is the stable stand container; this checks its host-backed filesystem.
    output = docker.run(PREFIX + "-postgres", ["df", "-Pk", "/"])
    available = int(output.splitlines()[-1].split()[3]) * 1024
    print("Available stand bytes:", available)
    if available < minimum_bytes:
        raise RuntimeError("Stand needs at least 2 GiB free before starting a build or rehearsal")
    return available


def main():
    from stand import Docker
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docker-port", type=int, default=23750)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--keep-images", type=int, default=3)
    parser.add_argument("--check-space", action="store_true")
    args = parser.parse_args()
    docker = Docker(args.docker_port)
    cleanup(docker, apply=args.apply, keep_images=args.keep_images)
    if args.check_space:
        require_free_space(docker)


if __name__ == "__main__":
    main()
