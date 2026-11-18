"""Regression checks for storage cleanup scope and image retention."""
import unittest
from retention import cleanup, require_free_space


class DockerStub:
    def __init__(self):
        self.mutations = []
        self.containers = [
            {"Id": "temporary", "ImageID": "used", "Names": ["/communityos-test-stand-help-web"],
             "Labels": {"org.communityos.stand": "communityos-test-stand-help"}, "State": "exited"},
            {"Id": "db", "ImageID": "postgres", "Names": ["/communityos-test-stand-postgres"],
             "Labels": {"org.communityos.stand": "communityos-test-stand"}, "State": "exited"},
            {"Id": "active", "ImageID": "active-image", "Names": ["/communityos-test-stand-live-web"],
             "Labels": {"org.communityos.stand": "communityos-test-stand-live"}, "State": "running"},
            {"Id": "foreign", "ImageID": "foreign-image", "Names": ["/other"],
             "Labels": {}, "State": "exited"}]
        self.images = [
            {"Id": str(n), "RepoTags": ["communityos-test-stand:" + str(n)], "Created": n}
            for n in range(5)]
        self.images += [{"Id": "active-image", "RepoTags": ["communityos-test-stand:active"], "Created": -1},
                        {"Id": "foreign-image", "RepoTags": ["other:old"], "Created": -2}]

    def call(self, method, path):
        if method == "GET":
            return self.containers if path.startswith("/containers") else self.images
        self.mutations.append((method, path))
        if path == "/containers/temporary":
            self.containers = [c for c in self.containers if c["Id"] != "temporary"]
        return {"SpaceReclaimed": 0}

    def run(self, container, argv):
        return "Filesystem 1024-blocks Used Available Capacity Mounted\nfs 9000000 8000000 1000000 89% /"


class RetentionTests(unittest.TestCase):
    def test_preview_never_mutates(self):
        docker = DockerStub()
        cleanup(docker)
        self.assertEqual([], docker.mutations)

    def test_cleanup_preserves_active_foreign_and_database_resources(self):
        docker = DockerStub()
        cleanup(docker, apply=True)
        removed = [path for method, path in docker.mutations if method == "DELETE"]
        self.assertEqual(["/containers/temporary", "/images/communityos-test-stand%3A0",
                          "/images/communityos-test-stand%3A1"], removed)
        self.assertTrue(docker.mutations[-1][1].startswith("/images/prune?filters="))
        self.assertIn("org.communityos.stand.build", docker.mutations[-1][1])

    def test_legacy_cleanup_requires_project_history(self):
        docker = DockerStub()
        docker.images += [{"Id": "legacy"}, {"Id": "unrelated"}, {"Id": "pulled", "RepoDigests": ["other@sha256:1"]}]
        original = docker.call

        def call(method, path, **kwargs):
            if path == "/images/legacy/history":
                return [{"CreatedBy": "RUN dotnet restore src/CommunityOS.Web"}]
            if path == "/images/unrelated/history":
                return [{"CreatedBy": "RUN apt-get update"}]
            return original(method, path)

        docker.call = call
        cleanup(docker, apply=True)
        deleted = [path for method, path in docker.mutations if method == "DELETE"]
        self.assertIn("/images/legacy", deleted)
        self.assertNotIn("/images/unrelated", deleted)
        self.assertNotIn("/images/pulled", deleted)

    def test_small_free_space_blocks_work(self):
        with self.assertRaisesRegex(RuntimeError, "2 GiB"):
            require_free_space(DockerStub())

    def test_cannot_drop_rollback_retention(self):
        with self.assertRaises(ValueError):
            cleanup(DockerStub(), keep_images=1)


if __name__ == "__main__":
    unittest.main()
