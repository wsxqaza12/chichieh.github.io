---
original: 5ceb81443c43
title: 'Faster Pandas: Installing Modin'
description: >-
  Speed up pandas with one line. A step-by-step guide to installing Modin,
  choosing a backend, and what it gained in a read_csv benchmark.
tags:
  - pandas
  - modin
  - python
  - installation
  - performance
sourceHash: '66c3e089ae29'
---

![](/assets/5ceb81443c43/1*eEtxH90Cz46hoH3Jklu9Hg.png)

### Introduction

In data science, Pandas is an indispensable tool, loved by data scientists and engineers for its powerful data handling. But as datasets keep growing, Pandas' performance can become a bottleneck. That's where Modin comes in.
### What is Modin?

Modin is an open-source Python library designed to speed up Pandas data processing. It does this by processing data in parallel in a distributed computing environment. Simply put, Modin lets you handle larger datasets faster with the same API as Pandas.
### Why Modin?
- Easy to use: Modin was designed to be fully compatible with Pandas, which means you can improve performance without changing your existing code.
- Automatic optimization: Modin automatically partitions data and processes it in parallel across multiple processors, improving efficiency.
- Flexibility: Modin supports multiple backends, such as Ray and Dask, so users can choose the tool that best fits their needs.

### How do I start using Modin?
### Installation

Installing Modin is simple with either pip or conda, and you can choose a backend to suit your needs:
```bash
pip install "modin[all]" # (Recommended) Install Modin with Ray and Dask engines.
pip install "modin[ray]" # Install Modin dependencies and Ray.
pip install "modin[dask]" # Install Modin dependencies and Dask.
pip install "modin[mpi]" # Install Modin dependencies and MPI through unidist.

conda install -c conda-forge modin-all  #conda
conda install -c conda-forge modin-ray  # Install Modin dependencies and Ray.
conda install -c conda-forge modin-dask # Install Modin dependencies and Dask.
conda install -c conda-forge modin-mpi # Install Modin dependencies and MPI through unidist.
conda install -c conda-forge modin-hdk # Install Modin dependencies and HDK.
```

You can also use conda-libmamba-solver, but when I installed Modin with libmamba I ran into some strange bugs, so use your judgment. For installing libmamba-solver, see my earlier [article](../8eabac894a59/).
```bash
conda install -c conda-forge modin-ray modin-hdk --experimental-solver=libmamba

# or starting from conda 22.11 and libmamba solver 22.12 versions:
conda install -c conda-forge modin-ray modin-hdk --solver=libmamba
```
### Speeding up Pandas with Modin

Replacing Pandas with Modin only takes changing the import statement:
```javascript
import modin.pandas as pd
```

Now you can use the Pandas API as usual, only faster. Some functions aren't supported in Modin yet, though. If you find bugs, you can contribute on [GitHub](https://github.com/modin-project/modin/issues) and help make Modin better and better.
### Performance comparison

Let's look at a simple example comparing Modin and Pandas on a large dataset. Say we have a CSV file of about 5 GB, and test their read_csv performance:
```python
import pandas as pd
import modin.pandas as mpd

start_time = time.time()
pd.read_csv('large_dataset.csv')
pandas_time = time.time() - start_time

start_time = time.time()
mpd.read_csv('large_dataset.csv')
modin_time = time.time() - start_time

print(pandas_time)
print(modin_time)
```

Pandas: 48.838 seconds

Modin: 34.447 seconds

Modin processed the same dataset about 1.42 times faster than Pandas. There's a more detailed comparison in my [GitHub project](https://github.com/wsxqaza12/PandasSpeedTests) if you're interested.
### Bugs

If you run into the following bug:
```bash
distributed.nanny.memory - WARNING - Worker tcp://127.0.0.1:38255 (pid=4356) exceeded 95% memory budget. Restarting...
```

you can set up a client and raise the memory limit.
```python
from dask.distributed import Client, LocalCluster
cluster = LocalCluster(memory_limit='10GB')
client = Client(cluster)
```
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/5ceb81443c43/1*QCQqlZr6doDP-cszzpaSpw.png)
