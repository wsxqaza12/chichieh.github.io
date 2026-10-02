---
original: fced76fdb8b9
title: 'RAG: Retrieval-Augmented Generation Opens a New Chapter for NLP'
description: >-
  Why use RAG instead of prompt engineering or fine-tuning, how retrieval and
  generation work and can be optimized, and the fast-growing RAG ecosystem.
tags:
  - rag
  - llm
  - research
  - fine-tuning
sourceHash: 'd42d0b2043a1'
---

### RAG (retrieval-augmented generation): a new chapter for natural language processing
### 1. Why use RAG?

If you take a pretrained LLM and apply it to your own situation, there are bound to be places where it misses the mark. Ask an LLM about your personal information, for example, and it can't answer. The same goes for companies, like using an LLM to answer questions about internal rules and regulations.

In cases like these, there are three main ways to make an LLM fit your needs better:
1. **Prompt engineering**:
Give prompts that guide the LLM to produce the response you want. A common example is in-context learning, which shapes how the model answers by providing context or examples in the prompt. For instance, giving examples of a particular answering style or including relevant situational information can guide the model to more suitable answers.
2. **Fine-tuning:**
This means training the LLM on a specific dataset so its responses better fit particular needs. A company might fine-tune ChatGPT on its internal documents, for example, so it can answer questions about internal rules more accurately. But fine-tuning needs a representative dataset of a certain size, and it isn't well suited to adding entirely new knowledge to the model or to situations that need fast iteration on new scenarios.
3. **RAG (retrieval-augmented generation)**:
Combines a neural language model with a retrieval system. The retrieval system pulls relevant information from a database or a set of documents, and the language model then uses that information to generate a response. You can think of RAG as handing the model a textbook and letting it look up information for a specific question. This approach is very useful when the model needs to incorporate real-time, up-to-date or very specific information. But RAG isn't suited to teaching a model to understand a broad domain or to learn a new language, format or style.



![Comparing RAG with other methods
Gao, Yunfan et al. "Retrieval-Augmented Generation for Large Language Models: A Survey." (2023).](/assets/fced76fdb8b9/0*tSPdWAgLKlOIgTPB.png)

Comparing RAG with other methods
Gao, Yunfan et al. "Retrieval-Augmented Generation for Large Language Models: A Survey." (2023).

Current research shows that RAG has significant advantages over other methods for optimizing LLMs (Shuster et al., 2021; Yasunaga et al., 2022; Wang et al., 2023c; Borgeaud et al., 2022). The main advantages are:
1. RAG improves the **accuracy** of answers with external knowledge, effectively reducing false information and making the generated answers more accurate and trustworthy.
2. Retrieval can pick up the latest information (provided by the user), which keeps the LLM's answers **current**.
3. RAG cites its sources so users can verify answers, which makes it highly **transparent** and increases trust in the model's output.
4. By retrieving domain-specific data, RAG can provide specialized knowledge for different fields, making it highly **customizable**.
5. For **security and privacy**, RAG stores knowledge in a database, which gives better control over how data is used. By contrast, a fine-tuned model is less clear about managing data access rights and more prone to leaks, a big problem for companies.
6. Because RAG doesn't update model parameters, it's more **cost-efficient** when handling large datasets.


But although RAG has many advantages, the 3 methods aren't mutually exclusive; they complement each other. Combining RAG with fine-tuning, and even prompt engineering, can strengthen the model's capabilities at different levels. This synergy matters especially in specific scenarios and can push the model's performance to its best. The whole process may take several rounds of iteration and adjustment to get the best results, iterating through continual evaluation and improvement of the model to meet the needs of a specific application.


![How RAG is applied in practice
Gao, Yunfan et al. "Retrieval-Augmented Generation for Large Language Models: A Survey." (2023).](/assets/fced76fdb8b9/1*BRcERCALfqSoRC06ce5b2A.png)

How RAG is applied in practice
Gao, Yunfan et al. "Retrieval-Augmented Generation for Large Language Models: A Survey." (2023).
### **2. What is RAG?**

This section introduces how RAG works and the techniques it uses. In short, RAG has two key techniques: retrieval and generation
1. Retrieval: retrieving the top few most relevant documents from a large knowledge base
2. Generation: turning the retrieved information into natural, fluent text.

### Retrieval

The key to making retrieval in RAG more accurate is getting an accurate semantic space, matching the semantic spaces of queries and documents, and aligning the retriever's output with the LLM's preferences. Let's look at each:
### a.) How to get an accurate semantic space

We usually call the multidimensional space that queries and documents are mapped into the **semantic space**. Retrieval happens in that space, so if the mapping isn't good enough, it's a disaster for the whole RAG system. Here are 2 steps for building an accurate semantic space.
1. **Chunk optimization**


When processing external documents, you first need to split them into smaller pieces to extract fine-grained features, then embed those features to express their meaning. But embedding chunks that are too large or too small can lead to poor results, so several important factors need considering, like the nature of the content being retrieved, the embedding model and its optimal chunk size, the expected length and complexity of user queries, and how the application will use the retrieval results. So there's now a lot of research proposing various **chunk optimization** methods:
1. **Sliding window**: layered retrieval that merges globally relevant information across multiple retrieval passes.
2. **small2big**: uses small chunks of text in the initial search, then provides larger related chunks for the language model to process.
3. **Abstract embedding:** prioritizes top-K retrieval based on document abstracts (or summaries), giving a comprehensive understanding of the whole document.
4. **Metadata filtering**: filters documents by their metadata.
5. **Graph indexing**: turns entities and relationships into nodes and connections, significantly improving relevance, especially for multi-hop questions.


**2. Fine-tuning embedding models**

Once the right chunk size is settled, we need an embedding model to embed the chunks and queries into the semantic space. So whether the embedding model can effectively represent the whole corpus becomes extremely important. Two embedding models have traditionally been common:
- **Sentence-Transformers:**
A Python BERT NLP package that provides many trained BERT models, suited to processing individual sentences.
- **text-embedding-ada-002:**
A newer embedding model from OpenAI, suited to text chunks of 256 or 512 tokens.


Today some excellent embedding models have appeared, like AngIE (Li and Li, 2023), Voyage (VoyageAI, 2023) and BGE (BAAI, 2023), pretrained on large corpora. But when applied to a specific domain, their ability to capture domain-specific information accurately may be limited.

We also need to fine-tune the embedding model to make sure it understands user queries, a step that's essential for downstream applications. There are 2 main ways to fine-tune an embedding model:
1. **Fine-tuning on domain knowledge:**
Fine-tuning an embedding model differs from fine-tuning an LLM, mainly in that the embedding model's dataset includes queries, a corpus and relevant documents. Collecting such a dataset is very tedious, so LlamaIndex introduced a set of key classes and functions specifically to simplify the workflow.
2. **Fine-tuning for downstream tasks:**
Some research now uses LLMs to fine-tune embedding models, like PROMPTAGATOR (Dai _et al._, 2022), which can solve problems where fine-tuning is hard because of insufficient data.

### b.) How to align the semantic spaces of queries and documents

In RAG applications, some retrievers process queries and documents with the same embedding model, while others use two different models. Also, a user's original query may be unclear or missing necessary semantic information. RAG uses 2 key techniques to address this:
1. **Query rewriting**


Methods like Query2Doc and ITER-RETGEN use LLMs to create a pseudo-document by combining the original query with additional guidance (Wang _et al._, 2023; Shao _et al._, 2023). Others include HyDE (Gao _et al._, 2022), RRR (Ma _et al._, 2023) and STEP-BACK PROMPTING (Zheng _et al._, 2022).

2. **Embedding transformation**

Compared with query rewriting, this is a more fine-grained technique. LlamaIndex adds a special adapter after the query encoder and fine-tunes it, optimizing the query's embedding to better suit a specific task.
### c.) Adjusting retrieval results to what the LLM needs

The methods above aim to improve retrieval, but they may not improve the LLM's accuracy, because the retrieval results may not match the LLM's preferences. So aligning retrieval results with the LLM's preferences is an important area.
1. **Fine-tuning retrievers**


The core idea is to adjust the embedding model using feedback signals from the LLM, that is, using scores provided by the LLM to guide the retriever's training. It's equivalent to using a large language model to label the dataset. Recent methods include AAR (Yu _et al._, 2023)

2. **Adapters**

The fine-tuning methods above can be hard to implement, with concerns like API access and compute. So some research attaches external adapters to align the models instead. PRCA (Yang _et al._, 2023) trains an adapter in a context-extraction stage and a reward-driven stage, optimizing the retriever's output with a token-based autoregressive strategy.
### **Generation**

The generator is one of RAG's key components, responsible for turning retrieved information into coherent, fluent text. In RAG, the generator's input includes not only the usual context but also relevant text fragments obtained through the retriever. This comprehensive input lets the generator understand the question's context deeply and produce more informative, contextually relevant answers. The generator uses the retrieved text to guide what it generates, making sure the generated content is consistent with the retrieved information.

But retrieved content varies widely, so a body of research explores how to make the generator adaptable enough to handle input from both queries and documents.
### a). How to optimize the retrieved information

The mainstream approach today relies on well-trained LLMs that can't be adjusted (like ChatGPT-4) for generation. But these LLMs still have problems, like limits on context length and sensitivity to redundant information. To address this, some research has started focusing on **post-retrieval processing**: further processing, filtering or optimizing the information obtained by the retriever to improve the quality of retrieval results. There are 2 main approaches:
1. **Information compression**


Even if the retriever does a great job of retrieving relevant information from a huge knowledge base, managing a large volume of retrieved information is still a challenge. The current approach is to extend the LLM's context length, but that doesn't solve the problem very effectively; context-length limits are still a big issue. So compressing information becomes necessary. Information compression matters for reducing noise, getting around context-length limits and improving generation.

PRCA tackles this by training an information extractor (Yang _et al._, 2023). In the context-extraction stage, given input text S_input, it produces an output sequence C_extracted, representing the context compressed from the input document. Training aims to minimize the difference between C_extracted and the actual context C_truth.

Others include RECOMP (Xu _et al._, 2023) and Filter-Ranker (Ma _et al._, 2023). Filter-Ranker combines the strengths of large language models (LLMs) and small language models (SLMs): the SLM acts as a filter and the LLM as a ranker. The research shows that having the LLM rerank challenging samples identified by the SLM brings significant improvements across various information extraction (IE) tasks.

2. **Reranking**

Its main job is optimizing the set of retrieved information. LLMs often see performance drop when extra context is added, and reranking addresses this effectively. The core idea is to reorder the document records so the most relevant items come first, limiting the total number of documents. This not only addresses the challenge of expanding the context window during retrieval but also improves retrieval efficiency and response speed.
### b). How to optimize the generator for the retrieved information

With an ordinary LLM, the input is usually just a text query. In RAG, the input combines the query with the various documents the retriever has retrieved, containing both structured and unstructured information. This extra information significantly affects the LLM's understanding, especially for smaller LLMs.

In this situation, fine-tuning the model to handle "query + retrieved documents" input becomes essential. Fine-tuning the generator in RAG is basically the same as general LLM fine-tuning. Below, we briefly describe some representative work involving data (formatted and unformatted) and optimization functions.
1. **General optimization process**


Self-mem (Cheng _et al._, 2023) uses a traditional training method: given input x, retrieve information z, then combine (x, z) and have the model generate output y. The paper explores two mainstream fine-tuning approaches, joint-encoder (Arora _et al._, 2023; Wang _et al._, 2022b; Lewis _et al._, 2020) and dual-encoder (Xia _et al._, 2019; Cai _et al._, 2021; Cheng _et al._, 2022).

The joint-encoder uses a standard encoder-decoder model: the encoder first encodes the input, and the decoder combines the encoding through attention and generates tokens autoregressively. The dual-encoder, on the other hand, sets up two separate encoders, one encoding the input (query, context) and the other the documents, then passes their outputs in turn through the decoder for bidirectional cross-attention. Both architectures are built on the transformer.

2. **Utilizing contrastive learning**

When preparing training data for an LLM, you usually build pairs of inputs and outputs. This traditional approach can cause "exposure bias": the model trains only on individual correct output examples, sees a single correct signal, and never learns about other possible generated tokens. That limitation can hurt the model's real-world performance, because it may overfit to specific examples in the training set and generalize less well across contexts.

To ease exposure bias, SURGE (Kang _et al._, 2023) proposes graph-text contrastive learning. It includes a contrastive learning objective that pushes the model to produce a range of feasible, coherent responses, extending beyond the instances in the training data. This approach is crucial for reducing overfitting and strengthening the model's ability to generalize.
### 3. The RAG ecosystem


![](/assets/fced76fdb8b9/1*fbbUfWHObS2MWzbq6mIo7A.png)


The RAG ecosystem is booming. Horizontally, beyond its original domain of text question answering, RAG has gradually expanded to more modalities, including images, code, structured knowledge, audio and video. Plenty of related research has emerged in these areas.

The related tech stack has developed quickly too. Key tools like the well-known LangChain and LlamaIndex rapidly gained popularity with the arrival of ChatGPT, offering a wide range of RAG-related APIs and becoming standouts in the LLM field.

Meanwhile, newer tech stacks are developing as well. Flowise AI, for example, prioritizes a low-code approach, letting users deploy AI applications, including RAG, through a simple drag-and-drop interface. Other technologies like Haystack, Meltano and Cohere Coral have also drawn attention for their distinctive contributions to the field.

Besides AI-focused providers, traditional software and cloud service providers are also expanding their offerings to include RAG-centered services. Verba, from vector database company Weaviate, focuses on personal assistant applications, while Amazon's Kendra provides intelligent enterprise search, letting users navigate various content repositories with built-in connectors.
### References

Gao, Yunfan et al. "Retrieval-Augmented Generation for Large Language Models: A Survey." (2023).
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/fced76fdb8b9/1*QCQqlZr6doDP-cszzpaSpw.png)
