This repository contains reusable GitHub Actions workflows used by
multiple C++ projects in this organization. The workflows provide a
consistent, centralized CI setup for building projects with CMake and
the Conan package manager across Linux, macOS, and Windows.

## Versioning

Callers pin the latest release tag:
`uses: tnt-coders/ci-workflows/.github/workflows/cpp-cmake-conan-build.yml@v<version>`.
Release tags are lightweight (`git tag v<version>`, without `-a`): the workflows call
`./.github/workflows/pre-commit.yml`, and GitHub cannot find that nested workflow when the caller
names an annotated tag ("workflow was not found"). The annotated `v1.0.1` and `v1.0.4` are unusable
for that reason.
