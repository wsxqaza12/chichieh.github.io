---
original: ac07991855e6
title: 'Knowledge Graph + RAG: Microsoft GraphRAG, Implemented and Visualized'
description: >-
  What Microsoft GraphRAG is and why combining knowledge graphs with RAG
  improves answers, plus a step-by-step implementation, two ways to visualize
  the graph, and what it costs.
tags:
  - graphrag
  - knowledge-graph
  - ai
  - tutorial
  - rag
sourceHash: 'c6fdb94672af'
---

![](/assets/ac07991855e6/1*_7xeMeTdyqufEm7rCcxV9w.png)


There are many ways to integrate an industry's knowledge into an LLM, but weighing cost and benefit, most enterprise applications use RAG. Recently, combining knowledge graphs (KGs) with RAG has become more and more common, and looks set to be the next hot technology. Riding that wave, on July 2 Microsoft finally open-sourced its GraphRAG, nearly five months after publishing the technical paper. I was very excited to test how well it works, so this article introduces GraphRAG's concept, advantages and implementation steps, along with several ways to visualize it, in the hope of helping you put the technology into practice quickly.
### 1. What is GraphRAG?

The core idea of GraphRAG is to combine data stored in a knowledge graph with an LLM, improving the quality of the model's answers by querying a graph database.

A knowledge graph is a structured way of representing knowledge, made up of entities and the relationships between them, so you can see how entities are connected on the graph, as in these conceptual examples:


![_A character map of Game of Thrones. Source: Weebly_](/assets/ac07991855e6/0*AvPfmzJP5EWBvCx3.jpg)

_A character map of Game of Thrones. Source: Weebly_


![A map of relationships among people at OpenAI from a while back. Source: Tech Job N Talk](/assets/ac07991855e6/0*TD-p6LKJpjBFxQnz)

A map of relationships among people at OpenAI from a while back. Source: Tech Job N Talk

If you want to go deeper into graphs and KGs, I recommend checking out [Neo4j's GraphAcademy](https://graphacademy.neo4j.com/) or taking the [Knowledge Graphs for RAG](https://www.deeplearning.ai/short-courses/knowledge-graphs-rag/) course on DeepLearning.AI. They cover RAG and KGs and will get you up to speed on the field quickly.
### 2. Why use GraphRAG?

Knowledge graphs go back at least to 2012, when Google launched its second-generation search engine and published a famous blog post, "[Introducing the Knowledge Graph: things, not strings](https://blog.google/products/search/introducing-knowledge-graph-things-not/)." They found that organizing the information on web pages with a KG made a huge leap in capability possible. The same pattern is now developing in GenAI, where many projects hit a wall because they're limited to processing strings rather than things. Today, frontier AI engineers and academic researchers are discovering the same important secret Google once found: the key to breaking through RAG's bottlenecks lies in KGs, bringing knowledge of concrete things into statistics-based text techniques.

According to Microsoft's GraphRAG research ([Darren _et al._, 2024](https://arxiv.org/abs/2404.16130)), GraphRAG greatly improves the retrieval part of traditional RAG, filling the context window with more relevant content, giving better answers and capturing the sources of evidence. They also found that GraphRAG needs 26% to 97% fewer tokens than other approaches, making it more scalable.

Here's an example from the Microsoft Research Blog, where you can see GraphRAG's answers are clearly better than ordinary RAG's.


![Microsoft Research Blog - GraphRAG: Unlocking LLM discovery on narrative private data](/assets/ac07991855e6/1*qHtOm0c0IXsefOd2W7VECg.png)

Microsoft Research Blog - GraphRAG: Unlocking LLM discovery on narrative private data

Another notable example comes from Writer. They recently published a RAG benchmark report based on the RobustQA framework ([Mozolevskyi & AlShikh, 2024](https://arxiv.org/abs/2405.02048)), comparing their GraphRAG approach with top competitors' tools. As the results below show, GraphRAG scored 86%, far above the competitors' range (33% to 76%), with comparable or lower latency.


![Mozolevskyi, D., & Alshikh, W. (2024). Comparative Analysis of Retrieval Systems in the Real World.](/assets/ac07991855e6/1*_JMJI3TiLbGsjDcULQNGrQ.png)

Mozolevskyi, D., & Alshikh, W. (2024). Comparative Analysis of Retrieval Systems in the Real World.

In short, GraphRAG has three main advantages over traditional RAG:
1. Higher accuracy and more complete answers, which helps a lot at runtime and in production.
2. Once the KG is built, RAG applications are easier to build and maintain, a significant advantage in development time.
3. Better explainability, traceability and access control, which benefits governance.

### 3. How do you use GraphRAG?

There are now many frameworks for implementing knowledge graph + RAG, such as LlamaIndex's Property Graph Index, LangChain's integration with Neo4j, and Haystack. The field is moving fast and the methods are getting easier to use. Today I'm introducing Microsoft GraphRAG, open-sourced not long ago.

GraphRAG is open source on [GitHub](https://github.com/Azure-Samples/graphrag-accelerator), and they've written detailed [documentation](https://microsoft.github.io/graphrag/) if you're interested.

And if you don't want to spend money but want to see what GraphRAG can do, I've put already-indexed files on [GitHub: GraphRAG-Visualization-Tutorial](https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial), which you can download and use directly.
### Step 1. Environment setup

It requires Python 3.10 to 3.12. I created the environment with conda.
```bash
conda create -n GraphRAG python=3.10
conda activate GraphRAG
```

Next, install GraphRAG
```bash
pip install graphrag
```
### Step 2. Prepare the folder and documents

First, create a directory for documents, `/ragtest/input`. Then download the official reference document. You can download it [here](https://www.gutenberg.org/cache/epub/24022/pg24022.txt), or use the commands below to create the folder and download it.

Note that Microsoft GraphRAG currently supports only `.txt`; `.pdf` files are ignored.
```bash
mkdir -p ./ragtest/input
curl https://www.gutenberg.org/cache/epub/24022/pg24022.txt > ./ragtest/input/book.txt
```
### Step 3. Initialize the workspace

Now we need to do some initial configuration. Here I'm using the [default configuration](https://microsoft.github.io/graphrag/posts/config/overview/); for details, see the official [documentation](https://microsoft.github.io/graphrag/posts/config/overview/).
```css
python -m graphrag.index --init --root ./ragtest
```

Once it finishes, you'll see that besides the input folder, the ragtest folder now has some new things in it.


![](/assets/ac07991855e6/1*ZyaVjsU_Omz6Dk0VJDsasg.png)


Next, edit 2 files
1. `.env`: enter your OpenAI API or Azure OpenAI API key

```ini
GRAPHRAG_API_KEY=<API_KEY>
```

2. `settings.yaml`: lets you customize the whole pipeline, including which LLM to use. I'm using the defaults: the default embedding model is text-embedding-3-small, and the LLM is gpt-4-turbo-preview.
### Step 4. Run the indexing pipeline

With the environment set up, and the `.txt` files you want indexed in the input folder, run the command below.

Note: this stage calls OpenAI's API and costs a fair amount. If you want to skip it, you can download my [repo](https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial), which has already been run.
```bash
python -m graphrag.index --root ./ragtest
```

It takes about 14 minutes. When it's done, you'll see the message `Completed successfully`.


![](/assets/ac07991855e6/1*XMZUK02kzEIGasG7zh5AZg.png)

### Step 5. Ask questions

Now we can ask GraphRAG questions. GraphRAG's query engine has three parts: local search, global search and question generation; for details, see the [official documentation](https://microsoft.github.io/graphrag/posts/query/overview/).

Here's an example of asking an advanced question with global search:
```bash
python -m graphrag.query \
--root ./ragtest \
--method global \
"What are the top themes in this story?"
```

The answer took about 50 seconds. Here's GraphRAG's answer:


![](/assets/ac07991855e6/1*5neeIOOEEQODXoo3ZMmWNg.png)

### 4. Visualization

As mentioned earlier, a KG is a graph showing the relationships between entities. There are a few ways to visualize the GraphRAG we built above.
### Method 1. Use yFiles Graphs

We can use yFiles Graphs to help visualize GraphRAG, mainly by running a Jupyter notebook. I've uploaded the notebook, written by Microsoft, to [GitHub](https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial/blob/master/graph-visualization.ipynb). Before using it, install the packages in `requirements.txt`:
```bash
pip install requirements txt
```

After opening graph-visualization.ipynb, remember to change the directory paths below. The part after output is the time of your indexing run. You can also download my [repo](https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial) and use the defaults.
```python
INPUT_DIR = "output/20240719-162300/artifacts"
```

Then follow the instructions and you'll see a visualization of your KG:


![Visualizing GraphRAG with yFiles Graphs](/assets/ac07991855e6/1*pcJ5KaqHcYanV_XxxvHiqQ.png)

Visualizing GraphRAG with yFiles Graphs
### Method 2. Generate GraphML and use third-party software

Before running the indexing pipeline, you can edit `settings.yaml` as follows:
```yaml
snapshots:
  graphml: True
```

That way, an extra GraphML file is generated after indexing. GraphML is an open standard supported by many open-source tools, so you can open it with software like **Gephi** or **yEd Graph Editor**.
### 5. How much does GraphRAG cost?

The document used above was downloaded from the official site and is about 185 KB. In OpenAI's dashboard you can see this run cost about $5.25, which is actually pretty high for a file that size.


![](/assets/ac07991855e6/1*q45f_JaSqa9CYe3ERxHPSw.png)


If you want to save money, I recommend changing the LLM in `settings.yaml`. The default is gpt-4-turbo-preview; using gpt-4o saves about half. See the price table below.


![](/assets/ac07991855e6/1*kIvd5W0PvWiC8ROEKrn5lA.png)

### 5. Conclusion

In this article we covered GraphRAG's concept, advantages, implementation steps and visualization methods, so you can understand and apply the technology more intuitively.

To sum up, combining KGs with RAG has become a key technology for modern enterprises to improve data processing and question-answering systems. Microsoft's GraphRAG is at the forefront of the field, using structured knowledge graphs to significantly improve the accuracy and relevance of model answers. And as GenAI develops, this matters in applications where answer quality is critical, where explainability is needed for internal, external or regulatory stakeholders, and where privacy and security controls on data access are required.

So I'll boldly predict that RAG combined with KGs will play an increasingly important role in data retrieval, question answering and intelligent applications, becoming an important force driving AI forward.
### References

Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, A., Truitt, S., & Larson, J. (2024). From Local to Global: A Graph RAG Approach to Query-Focused Summarization. _ArXiv, abs/2404.16130_.

Xu, Z., Cruz, M.J., Guevara, M., Wang, T., Deshpande, M., Wang, X., & Li, Z. (2024). Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering. _ArXiv, abs/2404.17723_.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it. Thank you for your support!
