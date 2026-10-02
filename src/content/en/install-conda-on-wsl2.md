---
original: 1c7b2f538c8f
title: Installing conda on WSL2
description: >-
  Enjoy Linux Python on Windows. How to install conda on WSL2, the commands
  you'll use most, and how to fix conda not being found in zsh.
tags:
  - wsl-2
  - conda
  - installation
  - performance
sourceHash: 'ef8f69be5123'
---

![](/assets/1c7b2f538c8f/1*q7FnsGmGbiUfrpWk6GXhTw.png)

### Introduction

In today's varied development environments, the Windows Subsystem for Linux (WSL) is a great way to run a Linux environment on Windows. Conda is a popular package and environment management system that supports multiple languages and is especially well suited to data science and machine learning. Installing Conda on WSL lets developers easily manage packages and dependencies in a Linux environment on a Windows machine.
### Preparation

Before installing Conda, you need to enable and install WSL on Windows 10 or later. That usually means choosing a Linux distribution (like Ubuntu) from the Microsoft Store and completing the installation. Once it's installed, you can use the Linux version of Python and conda directly in WSL.
### Installation steps
1. Open WSL: start your Linux distribution.
2. Go to the [Anaconda repo](https://repo.anaconda.com/archive/) and find the release that suits you



> Choose the version you want. I have a 64-bit computer, so I chose the latest version ending in x86_64.sh. If I had a 32-bit computer, I'd choose the x86.sh version. If you accidentally try to install the wrong version, you'll get a warning in the terminal. I chose Anaconda3-2023.09-0-Linux-x86_64.sh.





3. You can click to download it directly, or download it with wget in the terminal.
```bash
wget https://repo.continuum.io/archive/Anaconda3-2023.09-0-Linux-x86_64.sh
```

4. Then run the install script in the terminal with this command:
```bash
bash Anaconda3-2023.09-0-Linux-x86_64.sh
```

5. Reload your environment:
```bash
source ~/.bashrc
```
### Configuring environments

Once installation is done, you can start configuring Conda environments. Create a new environment with `conda create`, and activate it with `conda activate`. You can also install the packages you need with `conda install`. Here are some commonly used commands.
### 1. `create`
- What it does: creates a new Conda environment. In this environment you can install specific versions of packages without affecting other environments.
- Example: `conda create --name myenv python=3.8`. This creates a new environment called `myenv` and installs Python 3.8 in it.

### 2. `activate`
- What it does: activates a specific Conda environment, making it the one currently in use.
- Example: `conda activate myenv`. This activates the environment called `myenv`.

### 3. `deactivate`
- What it does: deactivates the currently active Conda environment and returns to the base environment or the previous one.
- Example: `conda deactivate`. This exits the currently active environment.

### 4. `install`
- What it does: installs packages into the currently active Conda environment.
- Example: `conda install numpy`. If you're in the `myenv` environment, this installs NumPy into it.
- To install the packages in a requirements.txt like pip does, use:

```bash
conda install - yes - file requirements.txt
```
### 5. `remove`
- What it does: removes a Conda environment.
- Example: `conda remove -n myenv --all`. This removes the `myenv` environment and every package installed in it.

### Common problems and troubleshooting

If you use zsh, typing `conda` after installation may give an error:
```bash
zsh: command not found: conda
```

In that case, edit ~/.zshrc and add the path to anaconda or miniconda:
```bash
vim ~/.zshrc

# added by conda nstaller
export PATH="/Users/username/miniconda3/bin:$PATH"
```

After reloading, you can use `conda` in zsh, but features like `create` still won't work. So next we set it up with `conda init zsh`; see [Stack Overflow](https://stackoverflow.com/questions/53995171/anaconda-conda-error-argument-command-invalid-choice-when-trying-to-update-pa). With that, conda works in zsh.
```bash
source ~/.zshrc
conda init zsh 
```
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/1c7b2f538c8f/1*QCQqlZr6doDP-cszzpaSpw.png)
