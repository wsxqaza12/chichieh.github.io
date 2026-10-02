---
original: e81616d30e53
title: 'A Guide to LLM Evaluation: Trends, Metrics and What''s Next'
description: >-
  As LLMs grow more capable, how do we know whether a model is any good? How
  evaluation has evolved, the dimensions and metrics used today, and where it's
  heading.
tags:
  - llm
  - nlp
  - evaluation
  - technology-trends
  - research
sourceHash: 'b2d1061724b1'
---

Over the past few years, LLMs have made astonishing progress in natural language processing (NLP) and become the core technology of many applications, including question answering, text generation and translation. As these models grow more capable, making sure they're both accurate and fair becomes very important, which raises a fundamental question: how do we evaluate whether a model is good?

To answer it, I've drawn on several papers to explore how evaluation has evolved, its methods, what it covers and where it's heading, in the hope of helping you understand the current landscape of LLM evaluation.
### 1. How evaluation has evolved

In recent years, as language models have kept improving, evaluation methods have kept changing too, evolving from early simple tasks and benchmarks into comprehensive evaluation systems that cover a wide range of performance metrics.


![Zhao et al. (2023) A Survey of Large Language Models.](/assets/e81616d30e53/1*t9jVda2BlJloAkhn-2ovIw.png)

Zhao et al. (2023) A Survey of Large Language Models.

Early on, researchers focused mainly on how models performed on specific language-understanding tasks, like the accuracy of sentence completion, reading comprehension and question answering. As technology advanced, people realized that relying only on these metrics couldn't fully evaluate what LLMs can do. So evaluation systems began to include more dimensions, like a model's general knowledge, logical reasoning, creativity, even its sensitivity to bias and ethical issues. And the recent rise of RAG has spawned a whole approach to evaluating RAG, which I'll explore in a later article.
### 2. What evaluation covers

As mentioned above, past evaluation items are no longer enough to evaluate LLMs comprehensively. According to recent research by Guo et al. (2023), besides the traditional considerations of capability and alignment, we can also evaluate LLMs along these key dimensions:


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*QFgQ8b8QjP2iAtAeeDEpQg.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
1. **Knowledge and capability evaluation:**
Evaluates the model's ability to understand and produce language, such as question answering, knowledge completion and reasoning.
2. **Alignment evaluation:**
Focuses on whether the model's outputs meet ethical standards and social expectations, such as bias, toxicity and trustworthiness.
3. **Safety:**
Focuses on whether the model produces outputs that harm users or system security, such as assessing potential risks, or how stable and reliable an LLM is when facing erroneous inputs and malicious attacks.
4. **Specialized LLM evaluation:**
Evaluates LLMs' abilities and limits across specialized fields, including biology, education, law, computer science and finance.
5. **Evaluation organization:**
The mainstream benchmarks and methodologies for evaluating LLMs, aimed at helping users make informed choices for their specific needs.


Guo et al. (2023) studied the evaluation methods for each dimension in depth. Below are summaries of the methods for each dimension; for details on each paper, see their [GitHub](https://github.com/tjunlp-lab/Awesome-LLMs-Evaluation-Papers). I've highlighted the more commonly seen evaluation methods. Note also that each evaluation item uses different metrics:
### 1. Knowledge and capability evaluation

The most commonly heard-of evaluation item, covering question answering, knowledge completion, reasoning and tool learning.


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*DKGYhyIoFPDYGSRKylPvwg.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
### 2. Alignment evaluation

This item focuses on making sure LLM development stays consistent with human social values, covering ethics and morality, bias, toxicity and truthfulness:


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*xZ6DnKoMWtuYU-iCVBGMkg.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
### 3. Safety

To make sure LLMs can be used safely across all kinds of applications, robustness evaluation and risk evaluation are usually carried out.


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*tSng97kJFuJ0yqW0uUU6Nw.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
### 4. Specialized LLM evaluation

Some LLMs are now fine-tuned for specialized fields. Compared with general LLMs, these models care more about scores in their particular domains, including biology, education, law, computer science and finance.


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*hBoqPISGsIXb46kWtO_2Hw.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
### 5. Evaluation organization

Focuses on comprehensive evaluation of LLMs, from early NLU and NLG tasks, to benchmarks of subject knowledge, to the various leaderboards and Elo scores.


![Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.](/assets/e81616d30e53/1*hy7HDKkKCvvkF_VvSAWg2A.png)

Guo et al. (2023) Evaluating Large Language Models: A Comprehensive Survey.
### 3. Evaluation metrics

When discussing how to evaluate an LLM system, you should set different metrics for different use cases, to match specific goals and needs. That's why the evaluation items above each use different metrics; you should be able to find the metrics each one uses in its documentation. Here are a few application areas and their corresponding metrics:
1. **Machine translation**:
The main goal is accurate, coherent translation. Common metrics include **BLEU** and **METEOR**.
2. **Automatic summarization**:
To evaluate how similar machine-generated summaries are to human reference summaries, ROUGE is usually used.
3. **Sentiment analysis**:
The aim is to understand the text and answer questions about it accurately, so metrics like **accuracy**, **recall** and **F1 score** are prioritized.
4. **Machine reading comprehension:**
**EM** and **F1 score** are commonly used. **EM** measures how exactly the model's answer matches the correct answer, while **F1 score** accounts for partial matches, balancing precision and recall.
5. **Code generation:**
The main goal is to automatically generate code that meets requirements from a natural-language description. **pass@k** and **accuracy** are usually used.

### 4. Future trends

Based on the research, I expect evaluation methods to evolve and deepen further in these areas:

**1. Cross-modal and cross-domain evaluation**

As LLM technology advances, models are no longer limited to text; they increasingly handle images, audio and video across modalities. So future evaluation frameworks need to expand to include cross-modal understanding and mastery of domain-specific knowledge.

**2. More detailed ethics and safety evaluation**

As public attention to AI ethics and safety grows, these dimensions will matter more and more when evaluating LLMs. Existing safety evaluations mainly test large models through question answering, but this approach can hardly evaluate a model's risks comprehensively in specific scenarios or environments.

**3. Evaluating human-computer interaction and real-world effectiveness**

Another important direction is how LLMs perform in real-world applications, including user satisfaction, effectiveness in practice and economic benefit. That requires moving from traditional dataset-based evaluation toward more consideration of human-computer interaction scenarios and long-term operation.

**4. Automated and continuous evaluation**

As models iterate faster, we need more automated evaluation tools and frameworks to support continuous evaluation and monitoring of LLMs. Existing evaluation methods are usually static, with test samples that stay unchanged for a long time, so the test samples may already be in an LLM's training data.
### 5. References
1. Guo, Z., Jin, R., Liu, C., Huang, Y., Shi, D., Supryadi, Yu, L., Liu, Y., Li, J., Xiong, B., & Xiong, D. (2023). Evaluating Large Language Models: A Comprehensive Survey. _ArXiv, abs/2310.19736_.
2. Zhao, W.X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y., Min, Y., Zhang, B., Zhang, J., Dong, Z., Du, Y., Yang, C., Chen, Y., Chen, Z., Jiang, J., Ren, R., Li, Y., Tang, X., Liu, Z., Liu, P., Nie, J., & Wen, J. (2023). A Survey of Large Language Models. _ArXiv, abs/2303.18223_.
3. Chang, Y., Wang, X., Wang, J., Wu, Y., Zhu, K., Chen, H., Yang, L., Yi, X., Wang, C., Wang, Y., Ye, W., Zhang, Y., Chang, Y., Yu, P.S., Yang, Q., & Xie, X. (2023). A Survey on Evaluation of Large Language Models. _ArXiv, abs/2307.03109_.
4. Minaee, S., Mikolov, T., Nikzad, N., Chenaghlu, M.A., Socher, R., Amatriain, X., & Gao, J. (2024). Large Language Models: A Survey. _ArXiv, abs/2402.06196_.

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/e81616d30e53/1*QCQqlZr6doDP-cszzpaSpw.png)
