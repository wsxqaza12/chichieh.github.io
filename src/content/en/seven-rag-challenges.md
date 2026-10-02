---
original: 0e4ac8adc6df
title: Seven RAG Challenges and How to Solve Them
description: >-
  Even with RAG, retrievers return wrong or irrelevant data and LLMs answer from
  bad information. The seven common failure points of RAG systems and practical
  fixes for each in LangChain and LlamaIndex.
tags:
  - llm
  - langchain
  - llamaindex
  - rag
  - research
sourceHash: '9cf855a1b819'
---

### RAG optimization: 7 challenges and how to solve them, to improve your LLM

In today's fast-moving field of AI, large language models (LLMs) have become ubiquitous. They've changed how we communicate with machines and are having a revolutionary impact across industries.

But although what LLM + RAG can do is already amazing, using RAG to improve an LLM still brings plenty of challenges, including but not limited to retrievers returning inaccurate or irrelevant data and LLMs generating answers from wrong or outdated information. So this article sets out the 7 most common challenges in RAG, along with solutions for each, in the hope of helping you improve your RAG.

The figure below shows the two main flows of a RAG system, retrieval and querying. The red boxes are the challenges you'll run into along the way, 7 in all:
1. Missing content
2. Missed top ranked: content ranked wrong, so the correct answer isn't retrieved
3. Not in context: context limits mean the correct answer isn't used
4. Wrong format
5. Incomplete answers
6. Not extracted: failing to pull out the information
7. Incorrect specificity: answers with the wrong level of detail



![Barnett _et al. (2024)_ Seven Failure Points When Engineering a Retrieval Augmented Generation System.](/assets/0e4ac8adc6df/1*MSP2W2EhexEADFhA1_S8uw.png)

Barnett _et al. (2024)_ Seven Failure Points When Engineering a Retrieval Augmented Generation System.

These challenges affect not only a system's usability and accuracy but also users' trust in the technology directly. Here are solutions for each one:
### 1. Missing content

This happens when a RAG system faces a question that the available documents can't answer. In the best case, we'd want the RAG system to say "I don't know." In practice, though, RAG systems often make things up or answer wrong.

There are two main strategies for this:

**1. Clean the data**

As the saying goes, "garbage in, garbage out." Raw data quality matters enormously to the accuracy of an information system. If the input data is wrong or contradictory, or preprocessing is done badly, no retrieval-augmented generation (RAG) system, however advanced, can extract anything valuable from the mess. That means investing resources and technique in choosing data sources, cleaning data and preprocessing, to make the input as accurate and consistent as possible. This strategy applies not only to this problem but to every data-processing pipeline: data quality is always key.

**2. Prompt engineering**

When the knowledge base lacks relevant information, so the system might give an answer that sounds reasonable but is actually wrong, prompt engineering is a very helpful fix. For example, a prompt like "If you're not sure of the answer, just tell me you don't know" encourages the model to respond more cautiously and honestly, avoiding misleading users. It can't guarantee the system's answers are absolutely accurate, but prompts like this do improve answer quality.
### 2. Missed top ranked

The main problem with this challenge is that "the answer is in the documents, but it didn't rank high enough to be given to the user." In theory, every document in a retrieval system gets a rank, and that rank determines how much it's used in later processing. In practice, because of performance and resource limits, usually only the top K documents are selected and shown to the user, where K is a parameter chosen with performance in mind.

There are two ways to fix this:

**1. Tune parameters to improve search**

Two levers here can improve RAG's efficiency and accuracy: `chunk_size` and `k`.

On `chunk_size`: as covered in [an earlier article](../fced76fdb8b9/), `chunk_size` is very important for building an accurate semantic space, and **chunk optimization** is a hot research area in RAG, with common methods like **sliding windows, small2big** and **abstract embedding**.

If you want to adjust the chunk size directly in LangChain, you can use this code:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=100)
all_splits = text_splitter.split_documents(PDF_data)
```

`k` concerns how many results the retriever should return. We can return more results to make sure the correct answer isn't left out of what's sent to the LLM:
```python
retriever = vectordb.as_retriever(search_kwargs={"k": 8})

qa = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=retriever, 
    verbose=True
)
```

**2. Optimize the ranking of retrieved documents**

Optimizing the order of retrieved documents before sending them to the LLM can greatly improve a RAG system's performance, because the initial ranking doesn't reflect how relevant documents really are to the query. For research on this, see [Liu et al. 2023](https://arxiv.org/abs/2307.03172), which finds that **performance is usually highest when the most similar documents are placed at the beginning or end, because models tend to get lost in the middle**.

In LangChain, we can implement this with LangChain's built-in Long-Context Reorder or the Cohere Reranker. I'll demonstrate both:

**2.1 Long-Context Reorder**

See the [official documentation](https://python.langchain.com/docs/modules/data_connection/retrievers/long_context_reorder).
```makefile
retriever = vectordb.as_retriever(search_kwargs={"k": 8})
query = "What can you tell me about the Celtics?"

# Get relevant documents ordered by relevance score
docs = retriever.get_relevant_documents(query)

# Reorder the documents:
# Less relevant document will be at the middle of the list and more
# relevant elements at beginning / end.
reordering = LongContextReorder()
reordered_docs = reordering.transform_documents(docs)

# Confirm that the 4 relevant documents are at beginning and end.
reordered_docs
```

**2.2 Cohere Reranker**

See the [official documentation](https://python.langchain.com/docs/integrations/retrievers/cohere-reranker).
```makefile
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank
from langchain_community.llms import Cohere

retriever = vectordb.as_retriever(search_kwargs={"k": 8})
query = "What can you tell me about the Celtics?"

# Get relevant documents ordered by relevance score
docs = retriever.get_relevant_documents(query)

# Uses the Cohere rerank endpoint to rerank the returned results
llm = Cohere(temperature=0)
compressor = CohereRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.get_relevant_documents(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
### 3. Not in context

The paper puts it this way: "The document containing the answer was retrieved from the database but wasn't included in the context used to generate the answer." This usually happens when too many documents are returned and a consolidation step has to choose the answer.

One way to solve this is to expand the range of context processed. I'd also suggest trying the following:

**1. Adjust the retrieval strategy**

LangChain offers many retrieval methods to make sure RAG gets the documents that best fit the question; see the [full list on the website](https://python.langchain.com/docs/modules/data_connection/retrievers/). They include:
1. Vectorstore: mentioned in earlier examples
2. ParentDocument
3. Multi Vector
4. Self Query
5. Contextual Compression
6. Time-Weighted Vectorstore
7. Multi-Query Retriever
8. Ensemble
9. Long-Context Reorder: covered in the previous step


These strategies give us flexible, varied ways to adjust to different retrieval needs and use cases, improving the accuracy and efficiency of retrieval.

**2. Fine-tune embeddings**

Fine-tuning the embedding model for a specific task is an effective way to improve retrieval accuracy. If your embedding model is open source, you can do this with LlamaIndex. Compared with LangChain, LlamaIndex is a package optimized for retrieving data, and it offers detailed tutorials on this, while LangChain has no equivalent feature.

Below is how to set up a fine-tuning framework, run the fine-tuning and get the fine-tuned model; see also the [documentation](https://docs.llamaindex.ai/en/stable/examples/finetuning/embeddings/finetune_embedding.html).
```makefile
finetune_engine = SentenceTransformersFinetuneEngine(
    train_dataset,
    model_id="BAAI/bge-small-en",
    model_output_path="test_model",
    val_dataset=val_dataset,
)

finetune_engine.finetune()

embed_model = finetune_engine.get_finetuned_model()
```
### 4. Wrong format

When you use a prompt to ask an LLM to extract information in a specific format (like a table or list) but the LLM ignores it, try these 3 strategies:

**1. Improve the prompt**

You can use these strategies to improve your prompt and solve the problem:

A. State the instructions clearly

B. Simplify the request and use keywords

C. Provide examples

D. Use iterative prompting and ask follow-up questions

**2. Output parsers**

Output parsers take the LLM's output and convert it into a more suitable format, which is very useful whenever you want an LLM to produce structured data of any kind. They mainly help ensure you get the output you expect by:

A. Providing formatting instructions for any prompt or query

B. "Parsing" the large language model's output.

LangChain provides streaming interfaces for many different types of output parsers. Here's example code; for details, see the [documentation](https://python.langchain.com/docs/modules/model_io/output_parsers/).
```python
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

**3. Pydantic parser**

Pydantic is a versatile framework that can turn input text strings into structured Pydantic objects. LangChain provides this as one of its output parsers. Here's example code; see the [official documentation](https://python.langchain.com/docs/modules/model_io/output_parsers/types/pydantic).
```python
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0)

# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```
### 5. Incomplete answers

Sometimes the LLM's answer isn't entirely wrong but leaves out some details. Those details are present in the context but aren't fully brought out. For example, if someone asks "What aspects do documents A, B and C mainly discuss?", asking about each document separately may work better and make sure you get more detailed answers.
1. **Query transformations**


One strategy for improving a RAG system's performance is to add a query-understanding layer, running a series of query rewrites before actually retrieving. Specifically, we can use these four kinds of transformation:

1.1 **Routing**: without changing the original query, identify the relevant subset of tools and direct the query to them as the first choice for handling it.

1.2 **Query rewriting**: keep the selected tools, but restructure the query in several ways so it can be applied across the same set of tools.

1.3 **Sub-questions**: break the original query into several smaller questions, each targeted at a specific tool chosen based on its metadata.

1.4 **ReAct agent tool picking**: decide which tool is most suitable based on the original query, and construct a query specifically for running on that tool.

LlamaIndex has organized this into a set of easy-to-use features; see the [official documentation](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook.html). In LangChain, most of these features are scattered across [Templates](https://python.langchain.com/docs/templates/), such as the [HyDE implementation](https://python.langchain.com/docs/templates/hyde) and implementations of papers. Here's an example of HyDE using LangChain:
```python
from langchain.llms import OpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import LLMChain, HypotheticalDocumentEmbedder
from langchain.prompts import PromptTemplate

base_embeddings = OpenAIEmbeddings()
llm = OpenAI()

# Load with `web_search` prompt
embeddings = HypotheticalDocumentEmbedder.from_llm(llm, base_embeddings, "web_search")

# Now we can use it as any embedding class!
result = embeddings.embed_query("Where is the Taj Mahal?")
```
### 6. Not extracted

When a RAG system faces a lot of information, it often struggles to extract the answer it needs accurately, and missing key information lowers the quality of the answer. Research shows this usually happens when there's too much distracting or contradictory information in the context.

Here are three strategies for this problem:

**1. Clean the data**

Data quality directly affects retrieval, and this pain point highlights again how important good data is. Before blaming your RAG system, make sure you've put enough effort into cleaning the data.

**2. Compress the prompt**

Prompt compression for long-context scenarios was first proposed by the [LongLLMLingua](https://arxiv.org/abs/2310.06839) research project and has been applied in LlamaIndex, while LangChain's resources are more scattered. We can now apply LongLLMLingua as a node postprocessor, which compresses the context after retrieval before sending it to the LLM.


![Jiang et al. (2023) LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression.](/assets/0e4ac8adc6df/1*Esj6fNb4jR5zhgdfz5cgnw.png)

Jiang et al. (2023) LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression.

Here's an example of using LongLLMLingua in LlamaIndex; for other details, see the [official documentation](https://docs.llamaindex.ai/en/stable/examples/node_postprocessor/LongLLMLingua.html#longllmlingua):
```python
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.response_synthesizers import CompactAndRefine
from llama_index.postprocessor import LongLLMLinguaPostprocessor
from llama_index.schema import QueryBundle

node_postprocessor = LongLLMLinguaPostprocessor(
    instruction_str="Given the context, please answer the final question",
    target_token=300,
    rank_method="longllmlingua",
    additional_compress_kwargs={
        "condition_compare": True,
        "condition_in_question": "after",
        "context_budget": "+100",
        "reorder_context": "sort",  # enable document reorder
    },
)

retrieved_nodes = retriever.retrieve(query_str)
synthesizer = CompactAndRefine()

## outline steps in RetrieverQueryEngine for clarity:
## postprocess (compress), synthesize
new_retrieved_nodes = node_postprocessor.postprocess_nodes(
    retrieved_nodes, query_bundle=QueryBundle(query_str=query_str)
)

print("\n\n".join([n.get_content() for n in new_retrieved_nodes]))

response = synthesizer.synthesize(query_str, new_retrieved_nodes)
```

**3. LongContextReorder**

As mentioned under the second challenge, missed top ranked, this addresses LLMs "getting lost" in the middle of documents by reordering the retrieved nodes, and it's especially useful when you need to handle a large number of top results. See the example above for details.
### 7. Incorrect specificity

Sometimes an LLM's answer isn't detailed or specific enough, and it may take several follow-up questions to get a clear answer. These answers may be too general to meet users' actual needs.

So we need more advanced retrieval strategies to find a solution.

When you find answers aren't as detailed as you expected, optimizing your retrieval strategy can significantly improve how precisely information is retrieved. LlamaIndex offers many advanced retrieval techniques, while LangChain has fewer resources here. Here are a few advanced retrieval techniques in LlamaIndex that can effectively ease this problem:
- [Auto Merging Retriever](https://docs.llamaindex.ai/en/stable/examples/retrievers/auto_merging_retriever.html)
- [Metadata Replacement + Node Sentence Window](https://docs.llamaindex.ai/en/stable/examples/retrievers/auto_merging_retriever.html)
- [Recursive Retriever](https://docs.llamaindex.ai/en/stable/examples/query_engine/pdf_tables/recursive_retriever.html)

### Conclusion

In this article we looked at seven major challenges you'll meet when using RAG, and for each we proposed concrete solutions aimed at improving the system's accuracy and user experience.
1. **Missing content**: solutions include data cleaning and prompt engineering, ensuring input data quality and guiding the model to answer more precisely.
2. **Missed top ranked:** can be solved by tuning retrieval parameters and optimizing document ranking, so the most relevant information is presented to users.
3. **Not in context:** expanding the range processed and adjusting the retrieval strategy are key, to include a wider range of relevant information.
4. **Wrong format:** can be fixed by improving the prompt and using output parsers and the Pydantic parser, which help get information in the format users expect.
5. **Incomplete:** can be solved with query transformations, ensuring the question is fully understood and answered.
6. **Not extracted:** data cleaning, prompt compression and LongContextReorder are effective strategies.
7. **Incorrect specificity:** can be solved with more advanced retrieval strategies, like the Auto Merging Retriever and metadata replacement, refining retrieval further.


Taken together, by analyzing and optimizing a RAG system's challenges carefully, we can not only improve the LLM's accuracy and reliability but also greatly increase users' trust in and satisfaction with the technology. I hope this helps you improve your RAG system.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/0e4ac8adc6df/1*QCQqlZr6doDP-cszzpaSpw.png)
