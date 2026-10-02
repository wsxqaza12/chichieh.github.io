---
original: 8eabac894a59
title: 'Faster Pandas: Installing cuDF on WSL2'
description: >-
  Pandas hits performance bottlenecks on large datasets. A step-by-step guide to
  installing cuDF, which accelerates dataframes with the GPU, on WSL2.
tags:
  - pandas
  - cudf
  - wsl
  - conda
  - installation
  - performance
sourceHash: '108687241173'
---

![](/assets/8eabac894a59/1*ZllpRz5xeKRtoNewSnkg_g.png)

### Introduction

Pandas is an indispensable tool for many data scientists and analysts. Its intuitiveness and flexibility make manipulating and analyzing data a breeze. But with large datasets, Pandas' familiar performance bottlenecks start to show. There are now many ways to speed up Pandas. This article looks at cuDF, which uses GPU acceleration, and walks you step by step through installing it on WSL2.
### Installing cuDF
#### Step 1: Prepare the WSL2 environment

Before installing cuDF, make sure WSL2 is installed and configured on your Windows system. WSL2 not only provides a full Linux environment but also works directly with the Windows file system, making it an ideal platform for high-performance computing. If you haven't installed WSL2 yet, follow [Microsoft's official guide](https://learn.microsoft.com/zh-tw/windows/wsl/install).
#### Step 2: Install CUDA

cuDF's performance depends on NVIDIA's CUDA, so installing CUDA is a prerequisite for GPU acceleration. See my earlier article on installing CUDA and PyTorch on WSL2.
#### Step 3: Install cuDF

First, it has some requirements for your machine. Check whether yours meets them before continuing:

**- OS:** Windows 11 with Ubuntu 22.04 instance for WSL2.
**- WSL Version:** WSL2 (WSL1 not supported).
**- GPU:** GPUs with [Compute Capability](https://developer.nvidia.com/cuda-gpus) 7.0 or higher (16GB+ GPU RAM is recommended).

Next we need to install conda-libmamba-solver. It's a Conda component that uses `libmamba` as the underlying solver for package dependencies and environment resolution. `libmamba` is the core of the Mamba project, an alternative to Conda that aims to provide faster package management and resolution. If you're interested, see [Mamba on GitHub](https://github.com/mamba-org/mamba).
```bash
conda install -n base conda-libmamba-solver
```

Once that's installed, you can find the install command that matches your setup on the RAPIDS [website](https://docs.rapids.ai/install#selector):


![](/assets/8eabac894a59/1*J3BwM-I02wuANUCm9inctg.png)


You can check your CUDA version with `nvidia-smi`.


![](/assets/8eabac894a59/1*iWYuMN9YZ5OuPeeeO-ZDkw.png)


If you install with the commands above, a new conda env called rapids-23.12 will be created. Enter the env and you can check whether cudf installed successfully.
```bash
conda activate rapids-23.12
conda list
```


![](/assets/8eabac894a59/1*24FvTrkBi59-iKjojydm1A.png)

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/8eabac894a59/1*QCQqlZr6doDP-cszzpaSpw.png)
