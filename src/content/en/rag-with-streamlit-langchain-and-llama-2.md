---
original: c7d1dac2494e
title: 'RAG Tutorial: Streamlit + LangChain + Llama 2'
description: >-
  Building a visual Streamlit interface to demo a full RAG (retrieval-augmented
  generation) workflow, with your own LLM server or the OpenAI API.
tags:
  - llm
  - demo
  - langchain
  - streamlit
  - rag
  - tutorial
sourceHash: '176a62a0349d'
---

![](/assets/c7d1dac2494e/1*uxugOdrNhxIealY_oZo4sg.png)


[The previous article](../d6838febf8c4/) showed how to implement the core of RAG (retrieval-augmented generation). This time, we'll focus on using Streamlit to build a visual interface for demoing the whole RAG workflow. Unlike last time, I've swapped Gradio for Streamlit, because I've been writing Streamlit projects lately and know it better. Of course, you can use Gradio to get the same result.
### Tech stack:
- **Python** 3.7+
- **LangChain**: a powerful library for building and managing language models.
- **Chroma**: for processing and analyzing text data.
- **Streamlit**: for building and sharing good-looking data apps.
- **Llama 2** or the **OpenAI API**: choose your own LLM server or the API OpenAI provides.
- **PDF**: the source of information and the basis for queries.

### How it works:
1. Connect to an LLM: in this demo, you can choose to use an LLM server you host yourself or the OpenAI API
2. Upload and process documents: users can upload PDF documents, and the system processes them with Chroma, including splitting the text and embedding it.
3. Store the data: the processed data is stored in a database for later retrieval and analysis.
4. Interactive queries: users can ask the system questions through a friendly interface; the system retrieves relevant information from the database based on the question and uses the LLM to generate an answer.

### What it looks like:


![](/assets/c7d1dac2494e/1*qq0dnCMaKLd3P9ZJIFbUGg.gif)


In the demo I'm using my own local LLM, serving an API with llama.cpp, so you can see the URL is http://127.0.0.1:8080/v1. If that part isn't clear, see my [llama.cpp tutorial](../2451807f8ba5/). You can also use the OpenAI API.

The uploaded PDF is the same as in the previous article: information about a fictional person, Alison Hawk, recording her occupation and personality. So in the demo you can see me asking what Alison Hawk's occupation is, and the LLM answers accurately using the information from the PDF.
### Build your own demo

If you're interested in this project and want to build and run it yourself, the code is on [GitHub](https://github.com/wsxqaza12/RAG_LangChain_streamlit). You can set up your own Streamlit demo quickly with these steps:
### Step 1. Clone the project
```bash
git clone https://github.com/wsxqaza12/RAG_LangChain_streamlit.git
cd RAG_LangChain_streamlit
```
### Step 2. Prepare the environment
```lua
conda create -n RAG_streamlit python=3.7
conda activate RAG_streamlit
pip install -r requirements.txt
```
### Step 3. Start Streamlit
```shell
streamlit run rag_engine.py
```

After these steps, you should see a friendly Streamlit app. In it, you can upload a PDF, ask questions, and watch how the LLM pulls information from the material you provided. Note that if you want to use your own LLM, remember to start it in a separate process first.

I hope this article helps you better understand how RAG is implemented and build a great interactive demo with Streamlit. If you have any questions, feel free to raise them on the project's GitHub page.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/c7d1dac2494e/1*QCQqlZr6doDP-cszzpaSpw.png)
