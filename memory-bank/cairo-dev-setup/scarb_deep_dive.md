# Scarb Deep Dive: Cairo Package Manager & Build Tool

Scarb is the official package manager and build tool for Cairo and Starknet projects. It simplifies dependency management, standardizes project structure, and orchestrates the compilation of Cairo code into Sierra and CASM, which are necessary for deployment on Starknet. This document provides a deeper look into Scarb's functionalities, particularly relevant for projects using Cairo 1.1+ and Scarb 2+.

## 1. Overview of Scarb

*   **Purpose:** To manage Cairo project dependencies, compile source code, and assist in various development tasks through an extensible platform.
*   **Core Ideas:**
    *   **Packages:** A Cairo project managed by Scarb is called a package. It includes Cairo source files and a `Scarb.toml` manifest file.
    *   **Manifest File (`Scarb.toml`):** Contains metadata about the package, such as its name, version, dependencies, and compilation targets.
    *   **Compilation:** Scarb compiles Cairo code into Sierra (Safe Intermediate Representation) and can further compile Sierra into CASM (Cairo Assembly Language) if specified.
    *   **Extensibility:** Scarb can be extended with custom commands and plugins.

## 2. The `Scarb.toml` Manifest File

This TOML file is the heart of a Scarb package, defining its properties and dependencies.

### Key Sections:

*   **`[package]`**: Defines core metadata for your package.
    *   `name`: The name of the package (e.g., `"my_starknet_project"`).
    *   `version`: The version of the package (e.g., `"0.1.0"`).
    *   `authors`: A list of authors (e.g., `["Your Name <you@example.com>"]`).
    *   `description`: A short description of the package.
    *   `edition`: Specifies the Cairo edition to use (e.g., `"2023_01"` or `"2023_10"` for newer features). This influences language features and compiler behavior. For Cairo 1.1 and later, you'd use a relevant edition.
    *   `license`: SPDX license identifier (e.g., `"MIT"`).
    *   `readme`: Path to the README file.
    *   `repository`: URL of the package's repository.
    *   `homepage`: URL of the package's homepage.
    *   `keywords`: Keywords describing the package.

    ```toml
    [package]
    name = "my_marketplace_contracts"
    version = "0.1.0"
    edition = "2023_10" # Or a newer edition suitable for Cairo 1.1+ features
    authors = ["Your Name <you@example.com>"]
    description = "Smart contracts for the Starknet Dev-Components Marketplace."
    ```

*   **`[dependencies]`**: Lists the packages that your project depends on.
    *   Scarb can fetch dependencies from various sources, including Git repositories and path dependencies (local sub-modules). Registries are becoming the primary way.
    *   For Starknet contracts, `starknet` is a crucial dependency.

    ```toml
    [dependencies]
    starknet = ">=2.6.3" # Or a specific version compatible with Cairo 1.1 and Scarb 2+
    # Example of a Git dependency (less common now with registries)
    # another_lib = { git = "https://github.com/example/another_lib.git", tag = "v1.2.3" }
    # Example of a path dependency
    # local_utils = { path = "crates/local_utils" }
    ```

*   **`[[target.starknet-contract]]`**: Defines a target for compiling a Starknet smart contract.
    *   This section tells Scarb to build the package as a Starknet contract.
    *   `sierra = true` (Optional, true by default): Ensures Sierra code is generated.
    *   `casm = true` (Optional, false by default since Scarb v2.7): If set to true, Scarb will also compile Sierra to CASM. CASM is needed for deployment but Sierra is the primary artifact for declaration. Often, deployment tools handle the Sierra-to-CASM step.
    *   `allowed-libfuncs-list.name = "experimental_v0.1.0"` (or other lists): Specifies a list of allowed Sierra libfuncs, crucial for compatibility with Starknet versions.

    ```toml
    [[target.starknet-contract]]
    # sierra = true # Default
    casm = true # Set to true if you want Scarb to output CASM directly for all contracts
    # For Starknet Sepolia and Mainnet, specific allowlists might be needed
    # or determined by the starknet dependency version.
    # Check current Starknet documentation for the appropriate allowlist if issues arise.
    # Example for a specific list if needed:
    # allowed-libfuncs-list.name = "experimental_v0.1.0"
    ```
    For multiple contracts in a single Scarb package, you can define multiple `[[target.starknet-contract]]` sections, each with a `name` field to distinguish them, and point them to their respective source files if not the default `src/lib.cairo`.

*   **`[cairo]`** (Optional): Cairo language specific configurations.
    *   `sierra-replace-ids = true`: Replaces all Sierra IDs with human-readable ones. Useful for debugging Sierra output but should generally be disabled for production builds.
    *   `unstable-features`: Enables specific unstable compiler features.

*   **`[profile.*]`** (Optional): Defines build profiles (e.g., `dev`, `release`) to control compiler optimizations and other settings.

## 3. Dependency Management

Scarb supports various ways to specify dependencies:

*   **From a Registry (Default):** If only a version is specified (e.g., `starknet = "2.6.3"`), Scarb will attempt to fetch it from the default Starknet Packages Registry.
*   **Git Dependencies:**
    ```toml
    my_lib = { git = "https://github.com/user/repo.git", rev = "SHA_OR_BRANCH_OR_TAG" }
    ```
    Scarb requires Git to be installed and in PATH for Git dependencies.
*   **Path Dependencies:** Useful for monorepos or local libraries.
    ```toml
    my_local_lib = { path = "path/to/local_lib" }
    ```
*   **Starknet Dependency:**
    ```toml
    [dependencies]
    starknet = ">=2.6.3" # Specifies the version of the Starknet library
    ```
    The version of `starknet` is critical as it provides the core Starknet functionalities, types (`ContractAddress`, etc.), and attributes (`#[starknet::contract]`, `#[storage]`, `#[event]`, etc.). The chosen version must be compatible with your target Starknet network (e.g., Sepolia, Mainnet) and the Cairo compiler version bundled with your Scarb version. Scarb 2+ versions are generally aligned with recent Cairo and Starknet features.

## 4. Build Process

*   **Command:** `scarb build`
*   **Process:**
    1.  Reads `Scarb.toml`.
    2.  Resolves and fetches dependencies.
    3.  Compiles Cairo source code (`.cairo` files) into Sierra.
    4.  If `casm = true` is set in `[[target.starknet-contract]]`, it further compiles Sierra to CASM.
*   **Output Artifacts:**
    *   Stored in the `target/` directory (e.g., `target/dev/` for default development builds).
    *   **Sierra JSON:** The primary artifact for Starknet contract declaration (e.g., `target/dev/my_project_MyContract.contract_class.json`). This file contains the compiled Sierra code and ABI.
    *   **CASM JSON (Optional):** If `casm = true`, a CASM file will also be generated (e.g., `target/dev/my_project_MyContract.compiled_contract_class.json`). This is the executable bytecode for the Starknet OS.
    *   **ABI (Embedded):** The ABI is typically embedded within the Sierra JSON file.

## 5. Standard Project Layout

Scarb encourages a standard project layout:

```
my_cairo_project/
├── Scarb.toml         # Manifest file
├── src/               # Source directory
│   └── lib.cairo      # Default library entry point / main contract file
├── tests/             # Directory for integration tests (often used with snforge)
│   └── my_test.cairo
└── target/            # Directory for build artifacts (created by Scarb)
    ├── dev/
    └── release/
```

*   `src/lib.cairo`: By default, this is the main file for a library or a single Starknet contract package.
*   If you have multiple contracts or a more complex structure, you can organize your code within `src/` using Cairo modules.

## 6. Key Scarb Commands

*   **`scarb new <project_name>`**: Creates a new Cairo library package with a default structure and `Scarb.toml`.
    *   To create a project with a Starknet contract target from the start, you might need to manually adjust the `Scarb.toml` or use a more specific template if available.
*   **`scarb build`**: Compiles the current package.
    *   `--release`: Compiles with optimizations for a release build (output in `target/release/`).
*   **`scarb test`**: Runs tests. Scarb itself can run basic unit tests defined with `#[test]`. For Starknet contract testing, it integrates with tools like `snforge`. `snforge` is typically run as a standalone command within a Scarb project.
*   **`scarb cairo-run`**: A Scarb extension to compile and run a Cairo program that has a `main` function (not for Starknet contracts directly, but for general Cairo programs).
    *   `--path <path_to_cairo_file>`
*   **`scarb clean`**: Removes the `target` directory.
*   **`scarb fmt`**: Formats the Cairo code in the project.
*   **`scarb metadata`**: Outputs package metadata in JSON format.

## 7. Scarb 2+ and Cairo 1.1+ Considerations

*   **Edition:** Ensure your `Scarb.toml` specifies an `edition` (e.g., `2023_10` or newer) that supports the Cairo 1.1 language features you intend to use.
*   **Starknet Dependency Version:** The `starknet` dependency version in `Scarb.toml` must be compatible with Cairo 1.1 and the target Starknet network features. Scarb versions (e.g., v2.6.3) often bundle compatible Cairo compiler versions.
*   **`[[target.starknet-contract]]`:** This section is essential for defining how your contracts are compiled. The project specifications require `#[abi(embed_v0)]`, which is standard for Sierra output generated by Scarb for Starknet contracts.
*   **Compilation Artifacts:** Scarb 2+ primarily focuses on producing Sierra as the main artifact for declaration. CASM generation is often an optional step or handled by deployment tools. The provided project specification to "compile with scarb 2+" and "expose ABI with #[abi(embed_v0)]" aligns well with Scarb's standard behavior for Starknet contracts.

Scarb is a fundamental tool for modern Cairo development, providing a robust and standardized way to manage and build projects for Starknet. Its close integration with the Cairo compiler and Starknet ecosystem makes it indispensable. 