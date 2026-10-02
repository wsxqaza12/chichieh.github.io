---
original: ab70d7117480
title: 'RAG Evaluation Frameworks Compared: TruLens, RGAR and RAGAs'
description: >-
  As RAG systems grow more complex, they need comprehensive evaluation. The
  challenges of evaluating retrieval and generation, the RAG triad, how RGAR and
  RAGAs bring in ground truth, and where RAG evaluation is heading.
tags:
  - llm
  - ai
  - research
  - rag
sourceHash: '668034460610'
---

![](/assets/ab70d7117480/1*IFHeZDZFEkHlsm5pFEOveg.png)

### 1. Introduction

In earlier [articles](../e81616d30e53/) we covered current trends in LLM evaluation and a hands-on [tutorial](../42628a4362f7/). As LLM + RAG applications have become more widespread, RAG has become a way for many companies to use internal documents while avoiding hallucinations. But even RAG can hallucinate, usually because the retriever fails to retrieve useful information or even retrieves irrelevant information. So to detect and prevent this effectively, how to evaluate RAG's answers well has become one of the important problems to solve.

Beyond that, as RAG develops, many variant architectures have appeared, turning it into an increasingly complex system that needs comprehensive evaluation to monitor its performance and deliver business value. So this article explores how to evaluate RAG systems comprehensively and broadly, and where RAG evaluation is heading.


![Zhao et al. (2024). Retrieval-Augmented Generation for AI-Generated Content: A Survey.](/assets/ab70d7117480/1*tv2w63ZTYckD66gCQJ6LLA.png)

Zhao et al. (2024). Retrieval-Augmented Generation for AI-Generated Content: A Survey.
### 2. The challenges of evaluating RAG

Compared with evaluating an LLM, what makes RAG evaluation hard is that a RAG pipeline is made of two key techniques:
1. **Retrieval:** retrieving relevant documents from a large knowledge base, including the indexing and search stages.
2. **Generation:** turning the retrieved information into natural, fluent text, including the prompting and inferencing stages.



![Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.](/assets/ab70d7117480/0*JehEi-3oSQXSfvlB.png)

Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.

So when evaluating RAG, we have to consider three parts, retrieval, generation and the whole RAG system, to work out which aspects of the system need improving. Here are the challenges each part faces:
### **1. Retrieval**

Retrieval is essential for getting relevant information from external knowledge sources, and that information affects the generation that follows. The main challenges:
1. **Dynamic, massive knowledge bases:** evaluating retrieval requires metrics that effectively measure precision, recall and relevancy, which is especially hard with huge, dynamic knowledge sources ranging from structured databases to the entire web. On top of that, the relevancy and precision of information change over time, adding to the complexity.
2. **Diverse sources of varying quality:** the diversity of information sources, and the potential for retrieving misleading or low-quality information, make it a major challenge to filter and select the most relevant information effectively.
3. **Improving evaluation methods:** traditional metrics focus on high top-K recall, which may not capture how useful the retrieved information is to a RAG system. Evaluation should consider the quality and relevance of information that helps the next step, generation.

### 2. Generation

Generation is usually done by an LLM, producing a response based on the retrieved content. Its challenges include:
- **Faithfulness and accuracy:** evaluating how faithful and accurate the generated content is to the input data, including the factual correctness of the response, its relevance to the original query and the coherence of the text. The subjectivity of tasks like creative content generation or open-ended Q&A makes judging high-quality responses more variable.

### 3. The whole RAG system

Beyond the individual parts, evaluating the whole RAG system means considering how retrieval and generation interact. The challenges include:
- **Overall performance:** the system's ability to use retrieved information to improve response quality needs to be measured, considering response latency, robustness to misinformation, and the ability to handle vague or complex queries.
- **Comprehensive evaluation:** traditional end-to-end evaluation lacks transparency about how each retrieved document contributes, making it hard to explain system behavior and optimize performance effectively.

### 3. RAG evaluation metrics

Given these challenges, to evaluate a RAG system comprehensively we need multiple metrics measuring different aspects of performance. Many frameworks and tools offer different views right now; let's look at the common principles.

In evaluating RAG systems, most frameworks mention the triangle below, and [TruLens](https://www.trulens.org/trulens_eval/getting_started/core_concepts/rag_triad/) uses exactly this structure. I've redrawn it based on TruLens's diagram to make it easier to understand:
1. `Query`: the question the user asks.
2. `Context`: the retrieved context, roughly corresponding to RAG's retrieval.
3. `Response`: the LLM's final answer based on the `Context`, roughly corresponding to RAG's generation.



![RAG Triad — Referenced from Trulens](/assets/ab70d7117480/1*glWUG7wWS-svqdR56_EozA.png)

RAG Triad — Referenced from Trulens

The triangle shows intuitively the 3 metrics that should be evaluated:
1. **Context relevancy:** how relevant the `Context` is to the `Query`, from 0 to 1; higher means more relevant. It's calculated as the proportion of sentences in the context that are relevant to answering the question.
2. **Groundedness:** some frameworks call it faithfulness. It evaluates how consistent the `Response` is with the `Context`, from 0 to 1; higher means more consistent. It's mainly used to detect LLM hallucinations. The groundedness score is calculated by identifying claims in the `Response` and checking whether they can be inferred from the `Context`.
3. **Answer relevancy:** evaluates how relevant the `Response` is to the `Query`. It computes the mean cosine similarity between the original question and several questions reverse-engineered from the generated answer. A high score means the `Response` addresses the original question directly and appropriately; a low score means the answer is incomplete or contains redundant information.


Almost every RAG evaluation framework includes these 3 metrics. But they only consider the relationships among the evaluable outputs, not their relationship to ground truth. In other words, there's no ground truth in the evaluation to provide a baseline, yet that's also an important part of evaluating RAG.
### 4. How RAG evaluation frameworks are developing

Since the framework above can't bring in ground truth, some newly proposed frameworks build on it, proposing how to use ground truth and effective metrics for evaluating the whole RAG system. Here are 2 recent frameworks:
### 1. RGAR

Yu et al. (2024) propose RGAR (**R**etrieval, **G**eneration, and **A**dditional **R**equirement), a framework meant to give a better understanding of RAG benchmarks. It brings in ground truth, including `Doc Candidates` and `Sample Response`, so the framework can cover every pairing between evaluable outputs and ground truth, evaluating RAG systems systematically.

It considers **target**, **dataset** and **metric**. The **target** module sets the direction of evaluation, the **dataset** module makes it easy to compare different data constructions, and the **metric** module introduces the evaluation metrics that correspond to specific targets and datasets.


![Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.](/assets/ab70d7117480/1*5cpDZYzbLyAs5raUtmlJHA.png)

Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.

Simply put, RGAR considers the following metrics beyond TruLens. I've redrawn a diagram based on the RAG triad above to help. To keep the terms consistent, `Ground Truth Context` stands for `Doc Candidates`, and `Ground Truth Answer` stands for `Sample Response`.
1. **Context accuracy**: evaluates how accurate the `Context` is against the `Ground Truth Context`, measuring the system's ability to identify and score relevant documents.
2. **Answer correctness**: measures how accurate the `Response` is relative to the `Ground Truth Answer`. Scores range from 0 to 1; higher means better aligned, i.e. more correct.
3. **Other metrics:** latency, diversity, noise robustness and so on



![](/assets/ab70d7117480/1*Q6LOIQqj7e6v_GGiGJdeaQ.png)


RGAR's framework brings in ground truth well and proposes the corresponding metrics to evaluate, while also proposing many metrics that should be included for the RAG system as a whole.
### 2. RAGAs

I'll also mention a very popular framework, RAGAs, proposed by Shahul et al. in 2023. It's a method for automatically evaluating RAG, and it has since become one of many people's first choices for evaluating RAG.

Like RGAR, RAGAs considers ground truth, but it includes only the `Ground Truth Answer`, RGAR's `Sample Response`, not the `Doc Candidates`. Even so, from the `Ground Truth Answer` alone RAGAs proposes 5 new evaluation metrics:


![](/assets/ab70d7117480/1*a1uQP9knmv85PG75yEQigw.png)

1. [**Context precision**](https://docs.ragas.io/en/stable/concepts/metrics/context_precision.html)**:** measures whether, for a given question and context, all the items relevant to the `Ground Truth Answer` are ranked higher. Ideally, all relevant information should appear first. It considers the `Query`, the `Ground Truth Answer` and the `Context`, with scores from 0 to 1; higher means better precision.
2. [**Context recall**](https://docs.ragas.io/en/stable/concepts/metrics/context_recall.html)**:** measures how well the retrieved `Context` aligns with the `Ground Truth Answer`. Specifically, it analyzes whether each statement in the `Ground Truth Answer` can be attributed to the retrieved `Context`. Ideally, every sentence of the `Ground Truth Answer` should map to the `Context`. Scores also range from 0 to 1; higher means better performance.
3. [**Context entities recall**](https://docs.ragas.io/en/stable/concepts/metrics/context_entities_recall.html)**:** measures how many entities in the retrieved `Context` also appear in the `Ground Truth Answer`, relative to those appearing only in the `Ground Truth Answer`, based on counts across the two sets. It's especially suited to scenarios that need a lot of factual support, like a travel help desk or historical Q&A. The score is the number appearing in both sets divided by the total in the `Ground Truth Answer`.
4. [**Answer correctness**](https://docs.ragas.io/en/stable/concepts/metrics/answer_correctness.html)**:** RGAR has this too.
5. [**Answer semantic similarity**](https://docs.ragas.io/en/stable/concepts/metrics/semantic_similarity.html)**:** evaluates the semantic similarity between the `Response` and the `Ground Truth Answer`, using a cross-encoder model to compute a similarity score from 0 to 1; higher means more consistent. It helps evaluate the quality of the `Response`, especially its accuracy at the semantic level.
6. [**Aspect critique**](https://docs.ragas.io/en/stable/concepts/metrics/critique.html)**:** evaluates answers along different aspects, like "harmlessness" and "correctness." Besides the default aspects, users can define their own aspects to evaluate.

### 3. Putting them together

If we merge the ideas of the two frameworks above, we get a complete view of which metrics to pay attention to when evaluating RAG.


![](/assets/ab70d7117480/1*IFHeZDZFEkHlsm5pFEOveg.png)

### 5. Other frameworks

That covers many tools and frameworks for evaluating RAG, and many others aren't included here, like [RGB](https://arxiv.org/abs/2309.01431) and [CRUD-RAG](https://arxiv.org/abs/2401.17043). But the core idea is the same: once ground truth is brought in, they differ in which new metrics they evaluate.

Yu et al. (2024) compiled a comparison of RAG evaluation tools and frameworks in their paper. The table doesn't list every metric some frameworks evaluate, but it makes it easy to compare how frameworks differ.


![Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.](/assets/ab70d7117480/0*fTSu6kwHEzkdZ-xr.png)

Yu et al. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.

Leonie also made a poster of RAG evaluation metrics and frameworks on 2024/01/24. Again, it doesn't list every metric for some frameworks, but it shows the differences between frameworks at a glance.


![[https://x.com/helloiamleonie/status/1747252654047142351](https://x.com/helloiamleonie/status/1747252654047142351)](/assets/ab70d7117480/0*k-ft6BCsJ-5n9t8d)

[https://x.com/helloiamleonie/status/1747252654047142351](https://x.com/helloiamleonie/status/1747252654047142351)
### 6. The future of RAG evaluation

As LLM and RAG technology keep developing, evaluation frameworks will become more complex and varied. A few possible directions:

**1. Multimodal evaluation:** most RAG evaluation today focuses on text retrieval and generation, but it may expand to multimodal data, including retrieving and generating images, audio and video. That will require new metrics and methods to handle the specific challenges of different data types. For image generation, for example, you might need to consider clarity, relevance of content and consistency of artistic style.

**2. Stronger understanding of context:** future RAG evaluation will focus more on a system's deep understanding and parsing of context. That includes global understanding of long texts, the ability to integrate information across multiple passages, and accurate interpretation of complex queries. This progress will make RAG systems more precise and reliable on more challenging tasks.

**3. Evaluating user experience:** beyond technical performance, evaluating user experience (UX) will become an important part of evaluating RAG systems. That includes measuring ease of use, response speed and overall satisfaction. User feedback will become an important basis for improving system design and features, making sure systems meet the needs of real use cases.

**4. Stronger security and ethics:** as RAG systems are used more widely, their security and ethical issues become more important. Future evaluation frameworks will focus more on how systems handle sensitive information, protect privacy and guard against generating harmful content. That will include developing dedicated security metrics and tools to make sure systems run safely in all kinds of situations.
### 7. Conclusion

This article explored why RAG evaluation matters, its challenges, and existing evaluation methods and metrics. Existing frameworks like TruLens and RGAR offer different metrics and methods for evaluating RAG systems, but their metrics aren't unified and are very complex. I hope this article helps you understand the basic structure and concepts of RAG evaluation.
### References

Chen, J., Lin, H., Han, X., & Sun, L. (2023). Benchmarking Large Language Models in Retrieval-Augmented Generation. _AAAI Conference on Artificial Intelligence_.

Huang, L., Yu, W., Ma, W., Zhong, W., Feng, Z., Wang, H., Chen, Q., Peng, W., Feng, X., Qin, B., & Liu, T. (2023). A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions. _ArXiv, abs/2311.05232_.

Yu, H., Gan, A., Zhang, K., Tong, S., Liu, Q., & Liu, Z. (2024). Evaluation of Retrieval-Augmented Generation: A Survey.

Salemi, A., & Zamani, H. (2024). Evaluating Retrieval Quality in Retrieval-Augmented Generation.

Shahul, E., James, J., Anke, L.E., & Schockaert, S. (2023). RAGAs: Automated Evaluation of Retrieval Augmented Generation. _Conference of the European Chapter of the Association for Computational Linguistics_.

Zhao, P., Zhang, H., Yu, Q., Wang, Z., Geng, Y., Fu, F., Yang, L., Zhang, W., & Cui, B. (2024). Retrieval-Augmented Generation for AI-Generated Content: A Survey. _ArXiv, abs/2402.19473_.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/ab70d7117480/1*QCQqlZr6doDP-cszzpaSpw.png)
