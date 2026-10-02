---
original: 895bb92b0c08
title: Local GraphRAG with llama.cpp
description: >-
  Running Microsoft GraphRAG on your own LLMs instead of OpenAI. Serving
  completion and embedding APIs with llama.cpp, configuring GraphRAG to use
  them, and fixing the common errors.
tags:
  - llm
  - ai
  - tutorial
  - graphrag
  - rag
sourceHash: 'f5f2c9fb903d'
---

![](/assets/895bb92b0c08/1*tInzlVhHANaOweOsiiYiow.png)


GraphRAG has become an important feature in many enterprise LLM applications. But Microsoft's GraphRAG costs money, and you have to upload your data to a commercial LLM platform, which may not be ideal for some companies. So using your own LLMs to build Microsoft GraphRAG has become a solution more and more people care about.

Microsoft GraphRAG is mainly designed for users to run with LLMs from OpenAI or Azure OpenAI. If you're not familiar with the technology yet, see my earlier [tutorial](../ac07991855e6/) for the basic concepts. Today, quite a few developers on GitHub offer open-source approaches to local GraphRAG, so people can get similar results with local LLMs. Here are two repos worth looking at:
- [**GraphRAG-Local-UI**](https://github.com/severian42/GraphRAG-Local-UI): provides a user-friendly graphical interface (UI) that's easy to use.
- [**graphrag-local-ollama**](https://github.com/TheAiSingularity/graphrag-local-ollama): an earlier resource showing how to apply GraphRAG with local LLMs.


Both repos rely on a tool called ollama to create an interface compatible with the OpenAI API. Under the hood, ollama is based on llama.cpp with some adjustments, ending up with a more convenient interface. Simply put, ollama wraps llama.cpp in Go so users can easily install and manage models.

But because ollama makes specific adjustments, the server it sets up can't be used directly with Microsoft GraphRAG; you have to modify some of GraphRAG's source code to make it run.

So if you want to start an OpenAI-API-compatible server locally more directly, I recommend using llama.cpp itself. It's simple and intuitive, avoids an unnecessary middle layer, and greatly improves flexibility and control. It also makes it much clearer how to replace OpenAI or Azure OpenAI LLMs with local ones and integrate them seamlessly into Microsoft GraphRAG.

This article walks you through using a local LLM server set up with llama.cpp in Microsoft GraphRAG, in two main steps:

A. Start the llama.cpp servers
B. Microsoft GraphRAG
### A. Start the llama.cpp servers

This step starts two servers, one for completion and one for embedding. For details on setting up the servers, see my earlier [article](../2451807f8ba5/); here's the quick version.
### A-1. Clone the llama.cpp project

Clone the [llama.cpp](https://github.com/ggerganov/llama.cpp) repo
```bash
git clone https://github.com/ggerganov/llama.cpp.git
```
### A-2. Compile with the Makefile

Compile the llama.cpp project with `make`. If you have a GPU to use, check the [llama.cpp docs](https://github.com/ggerganov/llama.cpp/blob/master/docs/build.md#blas-build) for the command that matches your setup.

I'm using CUDA, so I add `GGML_CUDA=1`.
```bash
make GGML_CUDA=1 # depends on your environment
```
### A-3. Prepare the environment

Managing it with conda is recommended
```lua
conda create --name llamaCpp python=3.9
conda activate llamaCpp
python3 -m pip install -r requirements.txt
```
### A-4. Convert and quantize the model

You can download many converted or quantized GGUF models from Hugging Face, and I recommend just downloading one. I put the downloaded model in ./models/.

If you want more detail, see my earlier [article](../2451807f8ba5/).
### A-5. Start the completion API server

Run the command below to start the completion API server on port 8080. You can see the running server at http://127.0.0.1:8080.
```css
./llama-server --host 0.0.0.0 --port 8080 \
  --threads 8 \
  --parallel 1 \
  --gpu-layers 999 \
  --ctx-size 0 \
  --n-predict -1 \
  --defrag-thold 1 \
  --model ./models/qwen2-7b-instruct-fp16.gguf
```
### A-6. Start the embeddings API server

Next, run the command below to start the embeddings API server on port 8081. You can use whichever embedding model you like, but check [llama.cpp's GitHub](https://github.com/ggerganov/llama.cpp) for what's currently supported. For example, the recently popular jina-embeddings-v3 isn't supported by llama.cpp yet.
```css
./llama-server --host 0.0.0.0 --port 8081 \
  --threads 8 \
  --parallel 1 \
  --gpu-layers 999 \
  --ctx-size 0 \
  --n-predict -1 \
  --defrag-thold 1 \
  --embeddings \
  --pooling mean \
  --batch-size 8192 \
  --ubatch-size 4096 \
  --model ./models/qwen2-7b-instruct-fp16.gguf
```

That sets up the two API servers. They take a little while to start; once they're ready, continue with the steps below.
### B. Microsoft GraphRAG

With the servers running, we can move on to Microsoft GraphRAG. If you're not familiar with it or want more detail, see my earlier [article](../ac07991855e6/); here's the quick version again.
### B-1. Environment setup

It requires Python 3.10 to 3.12. I created the environment with conda.
```lua
conda create -n GraphRAG python=3.10
conda activate GraphRAG
pip install graphrag
```
### B-2. Prepare the folder and documents

Download the official reference document.
```bash
mkdir -p ./ragtest/input
curl https://www.gutenberg.org/cache/epub/24022/pg24022.txt > ./ragtest/input/book.txt
```
### B-3. Initialize the workspace
```bash
python -m graphrag.index --init --root ./ragtest
```
### B-4. Edit settings.yaml

Next, edit ./ragtest/settings.yaml and enter the API paths of the completion API server and embeddings API server started with llama.cpp above, replacing the OpenAI API.
```yaml
llm:
  api_key: ${GRAPHRAG_API_KEY}
  type: openai_chat # or azure_openai_chat
  model: qwen2-7b-instruct
  model_supports_json: true # recommended if this is available for your model.
  max_tokens: 512
  # request_timeout: 180.0
  api_base: http://localhost:8080
  api_version: v1

embeddings:
  ## parallelization: override the global parallelization settings for embeddings
  async_mode: threaded # or asyncio
  llm:
    api_key: ${GRAPHRAG_API_KEY}
    type: openai_embedding # or azure_openai_embedding
    model: qwen2-7b-instruct
    api_base: http://localhost:8081
    api_version: v1
```
### B-5. Run the indexing pipeline

Once that's edited, run the command below to start the indexing pipeline.
```bash
python -m graphrag.index --root ./ragtest
```

It takes about an hour, depending mainly on the size of your input.txt and the speed of your computer. You may run into problems at this step. I've collected some of the ones I hit, plus common ones, below; try those fixes if you run into them too.

When everything runs successfully, you'll see: 🚀 ALL workflows completed successfully
### B-6. Ask questions

An example of asking an advanced question with global search; for other methods, see the [official documentation](https://microsoft.github.io/graphrag/posts/query/overview/):
```css
python -m graphrag.query \
--root ./ragtest \
--method global \
"What are the top themes in this story?"
```
### Common problems:

1. ❌create_base_entity_graph

The most common problem. It can usually be fixed by adjusting the llm `max_tokens` and the chunks `size` and `overlap` in ./ragtest/settings.yaml.

Sometimes, when a model is compressed too much, its ability to follow instructions suffers, which also causes this problem. In that case, try a different model.

Details: GitHub [Issue437](https://github.com/microsoft/graphrag/issues/437), [Issue951](https://github.com/microsoft/graphrag/issues/951)
```yaml
llm:
  max_tokens: 512

chunks:
  size: 600
  overlap: 150
```

2. ValueError("Columns must be same length as key")

If the logs show this problem, it can also be fixed by adjusting the chunks
```yaml
chunks:
  size: 600
  overlap: 150
```

Details: GitHub [Issue362](https://github.com/microsoft/graphrag/issues/362)

3. ❌create_final_community_reports

This step needs an LLM with a longer context window, so if you're using Llama 3.1, you won't be able to complete it, because Llama 3.1's context window is only 8K.

Details: GitHub [Issue374](https://github.com/microsoft/graphrag/issues/374)
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/895bb92b0c08/1*QCQqlZr6doDP-cszzpaSpw.png)
