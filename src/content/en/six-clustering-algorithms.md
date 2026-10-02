---
original: 673d3cc64dad
title: Six Clustering Algorithms You Should Know
description: >-
  Centroid, connectivity, density, graph, distribution and compression-based
  clustering. How each family works, its main algorithms, where it's used, and
  its strengths and weaknesses.
tags:
  - clustering
  - machine-learning
  - data-science
  - k-means
sourceHash: '9af538a0b2ea'
---

![](/assets/673d3cc64dad/1*lIZN6syEUs2GRstYUCXqnA.png)


In machine learning, clustering algorithms are widely used because they're so practical in unsupervised learning. They aim to group data points into clusters based on different definitions of similarity and different methodologies. I took some notes while learning about them, dividing clustering algorithms into six major families. Here's an overview of each and their subtle differences.
### 1. Centroid-based clustering


![**k-means**](/assets/673d3cc64dad/1*R4q4oLy344DdNwIVSA7jhQ.png)

**k-means**

The core idea of centroid-based clustering is to cluster around a centroid, a central data point (not necessarily from the input dataset). Algorithms like KMeans, KMeans++ and KMedoids pivot on how close data points are to these centroids, iteratively adjusting the clusters to minimize the variance within clusters and maximize the variance between them. They're well suited to spherical or blob-shaped data.
### Members
- **KMeans**: divides the data into K clusters by minimizing the sum of squared distances between data points and their cluster centroids.
**KMeans++**: an improvement on KMeans that improves centroid initialization for better convergence.
**KMedoids**: similar to KMeans, but uses actual data points as centers, making it more robust to noise and outliers.

### Use cases:
- **Market segmentation**: dividing customers into market segments based on their purchase history and behavioral data.
- **Document classification**: grouping a collection of documents by the similarity of their text.

### Strengths:
- **Easy to implement**: KMeans and its variants have simple logic that's easy to understand and implement.
- **Computationally efficient**: on medium-sized datasets, these algorithms usually run quickly and give results in an acceptable time.

### Weaknesses:
- **Choosing K**: KMeans requires you to specify K (the number of clusters) in advance, and in practice the best K is often unknown and may take several attempts and evaluations to determine.
- **Sensitive to the initial centroids**: KMeans in particular can be very sensitive to the choice of initial centroids, which can lead to a local optimum.

### 2. Connectivity-based clustering


![**Hierarchical clustering**](/assets/673d3cc64dad/1*UHCBt0zsoCsv-nAtiOF9bw.png)

**Hierarchical clustering**

This type of clustering, exemplified by hierarchical clustering, builds models based on the distance connectivity of data points. Hierarchical methods build a dendrogram, a tree structure representing nested groupings and levels of similarity.
### Members
- **Hierarchical clustering**: builds clusters by creating a hierarchy of them, using an agglomerative (bottom-up) or divisive (top-down) approach.

### 3. Density-based clustering


![**DBSCAN**](/assets/673d3cc64dad/1*eTx-91BCCRAH0nmT_D9o9A.png)

**DBSCAN**

In contrast to centroid-based methods, density-based clustering looks for high-density regions separated by low-density regions, and connects the high-density regions into clusters. It can handle clusters of arbitrary shape and is good at excluding noise and identifying outliers.
### Members
- **DBSCAN**: a classic density clustering algorithm that defines clusters as high-density regions separated by low-density regions, and can find clusters of arbitrary shape.
- **OPTICS**: an extension of DBSCAN that can handle data of varying density, providing an ordering of the clustering that shows the data's cluster structure at different scales.
- **HDBSCAN**: a newer algorithm that turns DBSCAN's single distance measure into a hierarchical clustering algorithm, making it better suited to data of varying density.

### Use cases:
- **Geospatial analysis**: identifying densely populated areas or landscape features based on how densely geographic data points cluster.
- **Anomaly detection**: in applications like credit card fraud detection or network security, identifying anomalies that don't fit normal patterns of behavior.

### Strengths:
- **No assumptions about cluster shape**: it can identify clusters of any shape, unlike distance-based algorithms limited to spherical clusters.
- **Resistant to noise and outliers**: compared with other clustering methods, density-based algorithms are good at identifying and ignoring noise and outliers.

### Weaknesses:
- **Parameter choice**: DBSCAN and its variants are very sensitive to parameter settings, like neighborhood size and density threshold, which can affect cluster quality.
- **Computational complexity on large datasets**: on large datasets these algorithms can take a long time, especially when computing which regions meet the density requirement.

### 4. Graph-based clustering


![**Affinity propagation**](/assets/673d3cc64dad/1*3lwh9l4pZsnAxH1TNkaXPA.png)

**Affinity propagation**

These algorithms treat data points as nodes in a graph, build edges from the similarity or distance between nodes, and then identify cluster structure in that graph. They're especially good at revealing nonlinear structure in data and can handle high-dimensional data effectively.
### Members
- **Affinity propagation**: identifies cluster centers by passing messages between data points, so there's no need to determine or estimate the number of clusters.
- **Spectral clustering**: reduces dimensionality using the data's similarity matrix, then clusters in the reduced space, which is especially effective for identifying clusters with complex structure.

### Use cases:
- **Social network analysis**: in social networks, graph-based clustering can identify community structure or potential interest groups.
- **Bioinformatics**: in protein interaction networks, it can be used to find functionally related groups of proteins.

### Strengths:
- **Flexibility**: graph-based methods are very flexible with clusters of arbitrary shape and can reveal hidden nonlinear structure in data.
- **Adaptability**: for data of different scales and densities, these methods can adapt by adjusting the similarity function.

### Weaknesses:
- **Computational complexity**: on large datasets, graph-based clustering can need a lot of computing resources, especially when building and processing the graph.
- **Parameter choice**: these methods are sensitive to parameters; for example, choosing a suitable similarity threshold or neighborhood size has a big effect on the final clustering.

### 5. Distribution-based clustering


![**GMM**](/assets/673d3cc64dad/1*uTEsD-MvgKu-i2Cla8TMWg.png)

**GMM**

Unlike clustering methods based on distance or density, distribution-based clustering uses a probability model to describe how data is distributed. It assumes the data points are generated by several probability distributions, each corresponding to a cluster. By estimating the parameters of these distributions, the algorithm can determine which distribution each data point belongs to, and so cluster them. The advantage of this model is that it can handle clusters of different shapes and sizes, and can give the probability that a data point belongs to each cluster, which is very useful for some applications.
### Members
- **Gaussian mixture models (GMMs)**: the most common algorithm in this family. It assumes all data points are generated by a mixture of a finite number of Gaussian distributions. Each Gaussian corresponds to a cluster and is defined by its mean and covariance. The parameters of these distributions can be estimated with maximum likelihood estimation or the expectation-maximization (EM) algorithm. A GMM can not only identify cluster centers but also assess the uncertainty of each point's membership in each cluster, an important feature of GMMs.

### Use cases:
- **Image processing**: in image segmentation, assigning pixels to clusters of different colors.
- **Bioinformatics**: in gene expression analysis, helping identify clusters of genes with similar expression patterns.
- **Financial analysis**: in risk management and market segmentation, identifying different patterns of customer behavior or the risk distribution of a portfolio.

### **Strengths:**
- **Flexibility**: it can represent elliptical clusters, more flexible than an algorithm like KMeans that can only find spherical clusters.
- **Soft clustering**: it provides the probability that each data point belongs to each cluster. This "soft clustering" approach lets data points be assigned to multiple clusters, which makes sense in many real-world applications.

### Weaknesses:
- **Computational cost**: because it has to estimate a covariance matrix for each component, a GMM can be very expensive on high-dimensional data.
- **Choosing the number of components**: in practice, deciding how many mixture components to use is often a challenge, usually requiring model selection criteria like the Bayesian information criterion (BIC).

### 6. Compression-based clustering


![**BIRCH**](/assets/673d3cc64dad/1*_sYJuWt0mxhW-lll9FegJQ.png)

**BIRCH**

This type of clustering model focuses on dimensionality reduction and compressing the data's space. The core idea: high-dimensional data can be represented more concisely in a lower-dimensional space, and that process can reveal the data's inner structure. Clustering happens in the reduced space, which improves computational efficiency and may uncover cluster structure that isn't obvious in the original high-dimensional space.
### Members
- **BIRCH**: a clustering algorithm designed for large datasets that handles noise and outliers effectively. It clusters incoming multidimensional metric data points incrementally and dynamically, trying to produce the best-quality clustering within the available resources (memory and time constraints).

### Use cases:
- **Big data analysis**: on datasets with millions or even billions of data points, BIRCH can identify cluster structure quickly and effectively.
- **Image compression**: in image processing, BIRCH can cluster pixels to compress and simplify images.

### Strengths:
- **Scalability**: BIRCH can handle very large datasets while keeping memory use low.
- **Handles noise**: thanks to its preprocessing step, BIRCH can identify and handle noise and outliers before the final clustering.

### Weaknesses:
- **Sensitive to parameters**: BIRCH's threshold parameter has a big effect on the final clustering, and poor settings can lead to poor results.
- **Limits with high-dimensional data**: although it can handle large datasets, it may be less effective on high-dimensional data, because distance measures become less reliable in high-dimensional spaces.

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/673d3cc64dad/1*QCQqlZr6doDP-cszzpaSpw.png)
