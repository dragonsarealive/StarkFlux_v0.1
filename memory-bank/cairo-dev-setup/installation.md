# Installation Guide for Cairo & Starknet Development Tools

This guide provides installation instructions for the essential tools required for Cairo and Starknet development. The recommended approach for Scarb, Starknet Foundry, Katana, and Starkli on Linux and macOS is using a version manager like `asdf` or by using their dedicated installation scripts (`[tool]up`). For Windows, WSL (Windows Subsystem for Linux) is the standard environment.

## Prerequisites

*   **Rust and Cargo:** Many Cairo tools are written in Rust. Install Rust via [rustup.rs](https://rustup.rs/).
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    ```
*   **Git:** For version control and fetching repositories.
*   **Curl, Wget:** Common command-line utilities for downloading files.
*   **(For asdf users) asdf-vm:** Install from [asdf-vm.com](https://asdf-vm.com/guide/getting-started.html).

## 1. Scarb (Cairo Package Manager)

Scarb manages Cairo compilations and project dependencies.

### Using `asdf` (Recommended for Linux/macOS)

1.  **Add Scarb plugin for asdf:**
    ```bash
    asdf plugin-add scarb
    ```
2.  **Install the latest Scarb version:**
    ```bash
    asdf install scarb latest
    asdf global scarb latest
    ```
3.  **Verify installation:**
    ```bash
    scarb --version
    ```

### Direct Installation (Linux/macOS)

Refer to the [official Scarb documentation](https://docs.swmansion.com/scarb/download.html) for the latest direct installation script or precompiled binaries.
Typically, it involves a curl command:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```
Then, ensure Scarb is in your PATH.

### Windows (WSL)

Inside your WSL environment (e.g., Ubuntu):
1.  Ensure Rust is installed in WSL.
2.  Follow either the `asdf` or Direct Installation steps for Linux.

## 2. Starknet Foundry (snfoundryup)

Starknet Foundry provides `snforge` (testing) and `sncast` (CLI interaction).

### Using `snfoundryup` (Recommended for Linux/macOS)

`snfoundryup` is an installation manager for Starknet Foundry.

1.  **Install `snfoundryup`:**
    ```bash
    curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
    ```
2.  This script will install `snfoundryup`. Then, install Starknet Foundry:
    ```bash
    snfoundryup
    ```
3.  Add Starknet Foundry to your PATH (the installer usually provides instructions, typically `source $HOME/.starknet-foundry/env`).
4.  **Verify installation:**
    ```bash
    snforge --version
    sncast --version
    ```

### Windows (WSL)

Inside your WSL environment:
1.  Ensure Rust is installed in WSL.
2.  Follow the `snfoundryup` installation steps for Linux.

## 3. Katana (Local Devnet)

Katana is a fast local Starknet node.

### Using `dojoup` (Recommended, installs Katana as part of Dojo toolchain)

`dojoup` is the installer for the Dojo toolchain, which includes Katana.

1.  **Install `dojoup`:**
    ```bash
    curl -L https://install.dojoengine.org | bash
    ```
2.  **Install Katana (and other Dojo tools):**
    ```bash
    dojoup
    ```
3.  Add Dojo to your PATH (the installer usually provides instructions, typically `source $HOME/.dojo/env`).
4.  **Verify Katana installation:**
    ```bash
    katana --version
    ```

### Direct Installation / From Source (Alternative)

You can also install Katana directly using `cargo` if you have Rust installed, or download precompiled binaries if available from the [Katana releases page](https://github.com/dojoengine/dojo/releases) (look for Katana assets).

```bash
cargo install katana-cli --locked # May require specific Rust versions or dependencies
```

### Windows (WSL)

Inside your WSL environment:
1.  Ensure Rust is installed in WSL.
2.  Follow the `dojoup` installation steps for Linux.

## 4. Starkli (CLI Tool)

Starkli is a CLI for interacting with Starknet.

### Using `starkliup` (Recommended for Linux/macOS)

`starkliup` is an installation manager for Starkli.

1.  **Install `starkliup`:**
    ```bash
    curl -L https://raw.githubusercontent.com/xJonathanLEI/starkli/master/scripts/install.sh | sh
    ```
2.  This script will install `starkliup`. Then, install Starkli:
    ```bash
    starkliup
    ```
3.  Add Starkli to your PATH (the installer usually provides instructions, typically `source $HOME/.starkli/env`).
4.  **Verify installation:**
    ```bash
    starkli --version
    ```

### Windows (WSL)

Inside your WSL environment:
1.  Ensure Rust is installed in WSL.
2.  Follow the `starkliup` installation steps for Linux.

## 5. SDKs

### starknet.js (Node.js / JavaScript / TypeScript)

1.  **Ensure you have Node.js and npm (or yarn/pnpm) installed.**
2.  **Install in your project:**
    ```bash
    npm install starknet
    # or
    yarn add starknet
    # or
    pnpm add starknet
    ```

### starknet.py (Python)

1.  **Ensure you have Python and pip installed.**
2.  **Install using pip:**
    ```bash
    pip install starknet-py
    ```
    It's highly recommended to use a Python virtual environment (`venv` or `conda`).

## 6. VS Code Extension for Cairo

1.  Open Visual Studio Code.
2.  Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
3.  Search for "Cairo 1" by StarkWare.
4.  Click "Install".
5.  After installation, you might need to configure it. Open VS Code settings (Ctrl+, or Cmd+,), search for "Cairo", and ensure "Enable Language Server" and "Enable Scarb" (or similar options) are checked. Point it to your Scarb executable if necessary.

## Post-Installation Checks

After installing each tool, always run its version command (`tool_name --version` or `tool_name -V`) to ensure it's correctly installed and accessible in your PATH.

Make sure your shell configuration file (e.g., `.bashrc`, `.zshrc`) is sourced correctly after installers make changes, or open a new terminal session. 