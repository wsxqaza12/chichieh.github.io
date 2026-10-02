---
original: e2d02dd25fd9
title: Short on Memory? LLM Compression Techniques
description: >-
  Four kinds of LLM compression, pruning, knowledge distillation, quantization
  and low-rank factorization, with the main methods in each and how they work.
tags:
  - llm
  - compression
  - research
sourceHash: 'ca1f7b776944'
---

![](/assets/e2d02dd25fd9/1*1sk17L66iVBmconz50QTkg.png)


Large language models (LLMs) take up a huge amount of memory:
- GPT-175B stored in half precision, FP16 (2 bytes), needs 175*2 ~ 320 GB
- LLaMA2-65B stored in full precision, FP32 (4 bytes), needs 65*4 ~ 260 GB


A single A100 has only 80 GB, so fine-tuning or running inference on common hardware is a huge challenge. That's why there's rich and varied research on compressing LLMs, proposing solutions for different challenges and applications. The main research areas fall into 4 big groups; the figure below shows model compression techniques in each.


![Canwen and Julian (2022). A Survey on Model Compression for Large Language Models.](/assets/e2d02dd25fd9/0*0_YnZEAmS0ZHCAjW.jpeg)

Canwen and Julian (2022). A Survey on Model Compression for Large Language Models.
### 1. Pruning

Pruning improves a language model's efficiency by removing non-critical or redundant components (such as weight parameters). It's an optimization method. By trimming parameters that contribute little to performance, it reduces storage needs and optimizes memory and compute efficiency, while keeping the model's performance as stable as possible. Pruning falls into two main categories: unstructured pruning and structured pruning.
### **1-a.) Unstructured pruning**

This mainly means removing individual parameters at random, without regard to the model's overall architecture.

It works on individual weights or neurons by setting parameters below a certain threshold to zero, which easily leaves the model with an irregular sparse structure. That irregularity requires special compression techniques to store and compute efficiently.

Unstructured pruning usually requires extensive retraining of the LLM to recover performance, which is extremely costly for LLMs, so some research explores this area. Here are 3 different approaches.
1. **SparseGPT** (Frantar and Alistarh, 2023) proposes a one-shot pruning method that requires no retraining. It turns pruning into a generalized sparse regression problem and uses an approximate sparse regression solver to achieve significant unstructured sparsity.
2. **LoRAPrune** (Zhang _et al._, 2023) combines a parameter-efficient fine-tuning (PEFT) strategy with pruning, aiming to improve performance on specific downstream tasks. It uses a distinctive criterion for parameter importance based on the values and gradients of low-rank adaptation (LoRA).
3. **Wanda** (Sun _et al._, 2023) proposes a new pruning metric. It scores each weight by the product of its magnitude and the norm of the corresponding input activation, approximated using a small calibration dataset. The metric is used for local comparisons within the outputs of the model's linear layers, helping remove relatively unimportant weights from the LLM.

### 1-b.) Structured pruning

Structured pruning focuses on removing connections or hierarchical structures in batches according to preset rules, keeping the model's overall architecture intact. Its advantage is that by handling whole groups of weights at once, it reduces the model's complexity and memory footprint while keeping the LLM's overall structure intact.
1. **LLM-Pruner** (Ma _et al._, 2023) proposes a versatile approach to compressing LLMs while preserving their multitask and language-generation abilities. It uses a dependency-detection algorithm to identify dependency structures inside the model, and implements an efficient importance estimation method that considers first-order information and approximate Hessian information.

### 2. Knowledge distillation

The core idea is a "teacher-student network." The aim is to transfer the knowledge of a large, complex model (the teacher) to a smaller, simpler model (the student). This way, the student can learn and imitate the teacher's behavior, keeping relatively high performance while needing fewer computing resources. These methods fall into two categories: **black-box KD**, where only the teacher's predictions are accessible, and **white-box KD**, where the teacher's parameters can be used.
### 2-a.) **White-box KD**

In white-box KD, you can access not only the teacher LLM's predictions but also its parameters. This lets the student LM understand the teacher LLM's internal structure and knowledge representation more deeply, usually bringing a higher level of performance improvement. White-box KD is typically used to help a smaller student LM learn and replicate the knowledge and abilities of a larger, more powerful teacher LLM.
1. A typical example is **MINILLM** (Gu _et al._, 2023), which explores distillation from white-box generative LLMs. It identifies a challenge: minimizing the forward Kullback-Leibler divergence (KLD) can lead to excessively high probabilities in regions where the teacher's distribution is unlikely, producing implausible samples during free generation. To solve this, MINILLM minimizes the reverse KLD instead. That keeps the student from overestimating low-probability regions of the teacher's distribution, improving the quality of generated samples.
2. **GKD** (Agarwal _et al._, 2023) explores distillation from autoregressive models, of which white-box generative LLMs are a subset. It identifies two key problems: a distribution mismatch between output sequences during training and those the student generates when deployed, and model under-specification, where the student may lack the expressiveness to match the teacher's distribution. GKD handles the distribution mismatch by sampling output sequences from the student during training, and addresses under-specification by optimizing alternative divergences like reverse KL.

### 2-b.) Black-box KD

Black-box KD can only access the teacher LLM's predictions. Recent research stresses that larger LLMs like GPT-3 (175B) and PaLM (540B parameters) show distinctive behaviors compared with smaller models like BERT (330M) and GPT-2 (1.5B). These are called emergent abilities, and there are three main kinds:
1. **In-context learning (ICL)**


ICL uses structured natural-language prompts containing a task description and possibly a few task examples as demonstrations. Through these examples, LLMs can grasp and perform new tasks without explicit gradient updates.

**2. Chain of thought (CoT)**

Unlike ICL, CoT takes a different approach, including intermediate reasoning steps (which lead to the final output) in the prompt, instead of just simple input-output pairs. **MT-COT** (Li _et al._, 2022) aims to use explanations produced by LLMs to strengthen the training of small reasoners. It uses a multitask learning framework to give smaller models strong reasoning abilities as well as the ability to produce explanations.

**3. Instruction following (IF)**

IF aims to improve a language model's ability to perform new tasks just by reading a task description, without relying on few-shot examples. By fine-tuning on a series of tasks expressed as instructions, language models show the ability to accurately perform tasks described in previously unseen instructions. For example, Lion (Jiang _et al._, 2023) uses LLMs' adaptability to improve the student model's performance. It prompts the LLM to identify and generate "hard" instructions, then uses them to strengthen the student. This uses the LLM's versatility to guide the student's learning on complex instructions and tasks.
### 3. Quantization

The core is converting floats to integers or other discrete forms, reducing the burden of storage and computation. Depending on the stage at which quantization is applied to compress the model, quantization methods fall into three kinds:
### 3-a.) Quantization-aware training (QAT)

Quantization-aware training takes the effects of quantization into account directly during training. By simulating quantization effects during training, QAT makes the model more resilient to the errors quantization introduces. That way, the model's performance drops less after quantization, and in some cases can come close to that of the unquantized model.

**LLM-QAT** (Liu _et al._, 2023) uses results generated by the pretrained model to achieve data-free distillation, and quantizes weights, activation values and the KV cache, increasing throughput and supporting longer sequence dependencies. It can distill large LLaMA models with quantized weights and KV caches into models of just 4 bits, showing it's feasible to build accurate 4-bit quantized LLMs.
### 3-b.) Quantization-aware fine-tuning (QAF)

QAF means fine-tuning the model after quantization to recover performance lost to quantization. QAF is usually performed after PTQ, further optimizing the model by fine-tuning the quantized model's parameters.

Related techniques include **PEQA** (Kim _et al._, 2023) and **QLORA** (Dettmers _et al._, 2023), both focused on enabling model compression and faster inference. PEQA uses a two-stage process: first quantizing the parameter matrices of fully connected layers into low-bit integer matrices and scalar vectors, then fine-tuning the scalar vectors for each specific downstream task. QLORA introduces innovations like a new data type, double quantization and paged optimizers, aiming to save memory while maintaining performance, so large models can be fine-tuned on a single GPU, reaching state-of-the-art results on the Vicuna benchmark. Notably, these methods all fall within quantization-aware parameter-efficient fine-tuning (PEFT).
### 3-c.) Post-training quantization (PTQ)

PTQ is quantization carried out after the model has been trained. It requires no retraining and can be done directly on a trained model. Its advantage is that it's simple and fast; the drawback is that, because it can't optimize based on post-quantization performance, model accuracy may drop. These methods are popular, and here are some recently published ones.
1. **LUT-GEMM** (Park _et al._, 2022) optimizes matrix multiplication in LLMs by quantizing weights and using the BCQ format, improving computational efficiency and lowering latency while maintaining good performance.
2. **LLM.int8()** (Dettmers _et al._, 2022) uses 8-bit quantization to effectively reduce GPU memory use while maintaining performance, and can run inference on models with up to 175B parameters without hurting performance.
3. **ZeroQuant** (Yao _et al._, 2022) combines a hardware-friendly quantization scheme, layer-by-layer knowledge distillation and optimization techniques to reduce the weights and activations of transformer-based models to INT8 with minimal impact on accuracy.
4. **GPTQ** (Frantar _et al._, 2022) proposes an innovative layer-wise quantization technique based on approximate second-order information, reducing weight bit width to 3 or 4 bits with almost no loss of accuracy.
5. **AWQ** (Lin _et al._, 2023) finds that weights don't affect an LLM equally, so protecting just 1% of the critical weights can significantly reduce quantization error.
6. **OWQ** (Lee _et al._, 2023) analyzes how activation outliers amplify weight quantization errors and introduces a mixed-precision quantization strategy.
7. **SpQR** (Dettmers _et al._, 2023) focuses on identifying and isolating outlier weights and storing them at higher precision, while compressing the other weights to 3–4 bits.
8. **SmoothQuant** (Xiao _et al._, 2022) tackles the challenges of quantizing activations by introducing per-channel scaling transformations that effectively smooth out magnitudes, making quantization easier and achieving lossless compression at ultra-low precision as low as 3 bits.



![LLM quantization methods
Canwen and Julian (2022). A Survey on Model Compression for Large Language Models.](/assets/e2d02dd25fd9/1*jLQthhVrX_XoNecD9Z9e8A.png)

LLM quantization methods
Canwen and Julian (2022). A Survey on Model Compression for Large Language Models.
### 4. Low-rank factorization

The core idea is to decompose a large matrix into the product of two or more smaller, low-rank matrices, achieving data compression and feature extraction. It's widely used for dimensionality reduction, noise filtering, data compression and compressing model parameters.

Simply put, the method decomposes a large matrix W into two matrices U and V such that W ≈ UV, where U is an m×k matrix, V is a k×n matrix, and k is much smaller than m and n. Low-rank factorization has long been used in mathematics, and people commonly use methods like singular value decomposition (SVD), principal component analysis (PCA) or non-negative matrix factorization (NMF).

In LLMs, low-rank factorization has been widely used to fine-tune LLMs efficiently, as in the famous LoRA (Hu _et al._, 2022) and its many, many variants. Recent research applying the method to model compression includes:
1. **TensorGPT** (Xu _et al._, 2023) stores large embeddings in a low-rank tensor format, reducing the space complexity of LLMs so they can run on edge devices. Specifically, TensorGPT uses tensor-train decomposition (TTD) to effectively compress the embedding layer of LLMs. By treating each token embedding as a matrix product state (MPS), it achieves compression ratios of up to 38.40x on the embedding layer, while maintaining or even improving performance compared with the original LLM.

### Summary

To sum up, LLM compression techniques are advancing rapidly, with the focus on tackling challenges like multitasking, language diversity and robustness while keeping accuracy and efficiency. I hope this article helps you understand the compression techniques available for LLMs.
### References

Canwen and Julian (2022). A Survey on Model Compression for Large Language Models.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/e2d02dd25fd9/1*QCQqlZr6doDP-cszzpaSpw.png)
