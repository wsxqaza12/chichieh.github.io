---
original: d6838febf8c4
title: 'RAG Tutorial: Build Your Own LLM with LangChain and Llama 2'
description: >-
  Build your own RAG (retrieval-augmented generation) system step by step with
  LangChain and Llama 2, so you can upload your own PDF and ask an LLM about it.
tags:
  - llm
  - langchain
  - llama-2
  - rag
  - tutorial
sourceHash: 'ee89ee4a893b'
---

![An example RAG service](/assets/d6838febf8c4/1*BKiZCXCL9A4_9dthYFBGeg.png)

An example RAG service

In this article I'll walk you step by step through building your own RAG (retrieval-augmented generation) system, so you can upload your own PDF and ask an LLM questions about it. This tutorial focuses on the blue part of the diagram above, without wiring up Gradio yet (if you want to see it wired up, see [the next article](../c7d1dac2494e/)). The tech stack:
1. **LLM**: Llama 2
2. LLM API: llama.cpp service
3. LangChain
4. **Vector DB**: ChromaDB
5. **Embedding**: Sentence Transformers


The core is LangChain, a framework for developing applications powered by language models. LangChain is like glue, with all kinds of interfaces for connecting LLMs to other tools and data sources. But LangChain is developing rapidly, and many docs and APIs have changed a lot, so below I demonstrate the simplest approach.
### Step 1. Environment setup

First set up the Python environment. I created one with conda and installed the libraries below. I built the example in Jupyter, and the full code is on [GitHub](https://github.com/wsxqaza12/RAG_example).
```python
# python=3.9
ipykernel
ipywidgets
langchain
PyMuPDF
chromadb
sentence-transformers
llama-cpp-python
```
### Step 2. Load and process the file, then import it into the DB


![](/assets/d6838febf8c4/1*pvD0sDAZyrI8w_Tyw2FdCQ.png)


First we need to process the external information and put it into the DB for later knowledge lookups. These steps correspond to the boxed part of the diagram above: the orange 1. text splitter and 2. embedding.
### a). Use a document loader

LangChain provides lots of document loaders, about 55 in total, including Word, CSV, PDF, Google Drive and YouTube, and they're easy to use. Here I created a PDF with information about a fictional person, Alison Hawk, and loaded it with `PyMuPDFLoader`. You can see Alison Hawk's PDF on [GitHub](https://github.com/wsxqaza12/RAG_example/blob/master/Virtual_characters.pdf). Note that PyMuPDFLoader requires `PyMuPDF` to be installed.
```python
from langchain.document_loaders import PyMuPDFLoader
loader = PyMuPDFLoader("LangChain/Virtual_characters.pdf")
PDF_data = loader.load()
```
### b). Split the document with a text splitter

A text splitter divides a document or text into chunks, to keep the document from exceeding the LLM's token limit. There's research on optimizing chunks; see my other [article](../fced76fdb8b9/).

The tools commonly used for this step are `RecursiveCharacterTextSplitter` and `CharacterTextSplitter`. The difference is that if a chunk exceeds the specified threshold, `RecursiveCharacterTextSplitter` also splits the text recursively into smaller chunks. LangChain provides both. The main parameters are:
- chunk_size: the maximum number of characters in each chunk when splitting text. It sets the size or length of each chunk.
- chunk_overlap: the number of characters that overlap between consecutive chunks. It sets how much of the previous chunk should be included in the next one.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=5)
all_splits = text_splitter.split_documents(PDF_data)
```
### c). Load an embedding model

Next, use an embedding model to turn the chunks of text from step b) into vectors. LangChain provides interfaces to many embedding models, such as OpenAI, Cohere, Hugging Face and Weaviate; see the [LangChain website](https://python.langchain.com/docs/modules/data_connection/text_embedding/).

Here I'm using Hugging Face's Sentence Transformers, which offers many pretrained models you can choose from based on your needs or use case. I chose `all-MiniLM-L6-v2`; for details on other models, see [SBERT.net](https://www.sbert.net/docs/pretrained_models.html) or [Hugging Face](https://huggingface.co/sentence-transformers). Note you need to install `sentence-transformers` first.
```python
from langchain.embeddings import HuggingFaceEmbeddings
model_name = "sentence-transformers/all-MiniLM-L6-v2"
model_kwargs = {'device': 'cpu'}
embedding = HuggingFaceEmbeddings(model_name=model_name,
                                  model_kwargs=model_kwargs)
```
### d). Import the embeddings into a vector DB

We store the embedding results in a vector DB. Common vector DBs include Chroma, Pinecone and FAISS; here I use Chroma. Chroma integrates well with LangChain, so you can use LangChain's interface directly.
```python
# Embed and store the texts
# Supplying a persist_directory will store the embeddings on disk
from langchain.vectorstores import Chroma
persist_directory = 'db'
vectordb = Chroma.from_documents(documents=all_splits, embedding=embedding, persist_directory=persist_directory)
```
### Step 3. Start the LLM service


![](/assets/d6838febf8c4/1*BhMBZnuZOOJtK310fgUvxw.png)


There are two ways to start your LLM and connect it to LangChain. One is to use LangChain's LlamaCpp interface, in which case LangChain starts the Llama 2 service for you. The other is to set up a Llama 2 API service some other way, for example starting an API service with llama.cpp's server; for details, see my [llama.cpp tutorial](../2451807f8ba5/). I'll demonstrate both, and you can choose the one that suits you.
### a). Use LangChain's LlamaCpp

Load the model with the LlamaCpp interface and it starts the Llama service for you. This approach is simpler: just run the code below, with model_path pointing to your model. In the example I'm using a quantized Llama 2 Chat. Note you need to install `llama-cpp-python`.
```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import LlamaCpp
model_path = "llama.cpp/models/llama-2-7b-chat/llama-2_q4.gguf"

llm = LlamaCpp(
    model_path=model_path,
    n_gpu_layers=100,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```


![](/assets/d6838febf8c4/1*rk_msRiNOe-wTq6d0ntvpw.png)


You can test whether the LLM service has started:
```python
llm("What is Taiwan known for?")
```


![](/assets/d6838febf8c4/1*ak-hfiup7IEv6tVZujz10A.png)

### b). Use an API service you've already set up

If you've already set up an LLM API service some other way, or you're using OpenAI's API, you need LangChain's ChatOpenAI interface. Here I'm demonstrating llama.cpp's server ([llama.cpp tutorial](../2451807f8ba5/)), which offers an OpenAI-like API, so we can use the same interface directly. Some related parameters:
- **openai_api_key**: since we're not actually using the OpenAI API, you can fill in anything.
- **openai_api_base**: the base URL of the model API
- **max_tokens**: limits the length of the model's answers

```python
from langchain.chat_models import ChatOpenAI
llm = ChatOpenAI(openai_api_key='None', openai_api_base='http://127.0.0.1:8080/v1')
```
### Step 4. Set your prompt

Some LLMs can use specific prompts. Llama, for example, can use special tokens; for details, see [Twitter](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20). We can use ConditionalPromptSelector to set the prompt based on the model type, like this:
```python
from langchain.chains import LLMChain
from langchain.chains.prompt_selector import ConditionalPromptSelector
from langchain.prompts import PromptTemplate

DEFAULT_LLAMA_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""<<SYS>> \n You are an assistant tasked with improving Google search \
results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that \
are similar to this question. The output should be a numbered list of questions \
and each should have a question mark at the end: \n\n {question} [/INST]""",
)

DEFAULT_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an assistant tasked with improving Google search \
results. Generate THREE Google search queries that are similar to \
this question. The output should be a numbered list of questions and each \
should have a question mark at the end: {question}""",
)

QUESTION_PROMPT_SELECTOR = ConditionalPromptSelector(
    default_prompt=DEFAULT_SEARCH_PROMPT,
    conditionals=[(lambda llm: isinstance(llm, LlamaCpp), DEFAULT_LLAMA_SEARCH_PROMPT)],
)

prompt = QUESTION_PROMPT_SELECTOR.get_prompt(llm)
prompt
```

Use LLMChain to connect the prompt and the LLM. Also note that LangChain's recent update replaces `run` with `invoke`, so watch for that when you see other articles using `run`.
```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What is Taiwan known for?"
llm_chain.invoke({"question": question})
```

What it looks like:


![](/assets/d6838febf8c4/1*dexT6PX6eGG3MmWaLAMEoQ.png)

### Step 5. Text retrieval + querying the LLM


![](/assets/d6838febf8c4/1*MFfdNUmTPsA9EHC3FA77Ow.png)


Above we imported the PDF information into the DB and started the LLM service. Now we connect the whole RAG process:
1. The user sends a question
2. Retrieve text from the DB
3. Send the question together with the retrieved text to the LLM
4. The LLM answers based on that information


First we need to create a retriever, which returns the relevant documents for an unstructured question. LangChain offers many approaches and also integrates third-party tools, and there's a lot of research on how to find the right documents for a question. I'm using the [vector store](https://python.langchain.com/docs/modules/data_connection/retrievers/vectorstore) approach here; for other kinds, see [Retrievers](https://python.langchain.com/docs/modules/data_connection/retrievers/).

Then use RetrievalQA to combine the retriever, the question and the LLM. Note that `VectorDBQA` is deprecated and `RetrievalQA` is used now, so watch for that if you see other articles using it.
```python
retriever = vectordb.as_retriever()

qa = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=retriever, 
    verbose=True
)
```
### Step 6. Use your RAG

With that, the whole RAG pipeline is connected. Let's ask about Alison Hawk (the name of the fictional person in the PDF):
```python
query = "Tell me about Alison Hawk's career and age"
qa.invoke(query)
```


![](/assets/d6838febf8c4/1*4iAZeoLqBT6TA9wnZBB0EA.png)


You can see the LLM got the information about Alison Hawk from the PDF we uploaded to the DB, and learned that she's a 28-year-old researcher.
