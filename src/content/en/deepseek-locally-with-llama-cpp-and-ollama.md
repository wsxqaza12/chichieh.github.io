---
original: 78f24809604f
title: Running DeepSeek Locally with llama.cpp and Ollama
description: >-
  A step-by-step guide to deploying DeepSeek-R1 locally, with the flexible
  llama.cpp (build, convert, quantize, chat and serve) and the easy-to-install
  Ollama.
tags:
  - llm
  - deepseek
  - ollama
  - llama-cpp
  - ai
sourceHash: '9b53130abfc1'
---

![](/assets/78f24809604f/1*qvAF4i_TmS3RaWzBsbCigg.png)


DeepSeek has been the hottest name in LLMs lately, drawing attention worldwide. On December 26, 2024, DeepSeek released DeepSeek-V3, optimized for math, programming and Chinese, with performance on par with OpenAI's GPT-4o at the time.

After V3, the DeepSeek team kept optimizing the architecture, and on January 20, 2025 released DeepSeek-R1-Zero, DeepSeek-R1 and DeepSeek-R1-Distill. Compared with V3, R1 uses more efficient computation to match, at a lower cost, the performance of OpenAI's reasoning model o1, which OpenAI had only released on December 5, 2024. Seven days later, on January 27, 2025, they also released Janus-Pro-7B, a vision-based model.

Some experts think R1 has mainly grabbed users' attention and hasn't yet revolutionized enterprise applications, but the exciting part is that DeepSeek's models are open source. Anyone can use them to build their own local LLM and add custom features freely. So this article walks you through running DeepSeek locally, using tools like llama.cpp and Ollama, so you can easily build your own AI model.
### 1. Tools and models for running LLMs locally

There are many inference frameworks for running LLMs locally, as shown below. In this article I'll demonstrate the more flexible llama.cpp and the easy-to-install Ollama.
- **llama.cpp**: supports running LLMs on the CPU, ideal for users who don't have enough GPU VRAM but still want to test.
- **Ollama:** Ollama is built on llama.cpp with some adjustments, ending up with a more convenient interface.



![](/assets/78f24809604f/1*4OZ7nN2mRUj5SUXiP5KUkg.png)


DeepSeek-V3 and DeepSeek-R1 are both huge 671B models that ordinary consumer computers can't run, so the tests in this article focus on [DeepSeek-R1-Distill-Qwen-14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B). If you're interested in running the full DeepSeek-R1 671B, you can use llama.cpp with virtual memory to run the 671B model slowly and see how it does. If people are interested, I'll write a separate tutorial.

Note that the environment in this tutorial is Linux; some commands may differ on Windows or macOS.
### 2. Deploying DeepSeek with llama.cpp

llama.cpp offers building locally, [Docker deployment](https://github.com/ggerganov/llama.cpp/blob/master/docs/docker.md) and [installation through native package managers (Homebrew, Nix and Flox)](https://github.com/ggerganov/llama.cpp/blob/master/docs/install.md). This article focuses on building llama.cpp locally. I've previously written a [tutorial on running Llama 2 with a local llama.cpp build](https://github.com/ggerganov/llama.cpp/issues/11474), and switching to DeepSeek is much the same. But nearly half a year has passed, and [llama.cpp](https://github.com/ggerganov/llama.cpp/issues/11474) has changed quite a bit, so I've rewritten it for the latest version.
### Step 1. Clone the llama.cpp project

Clone the [llama.cpp](https://github.com/ggerganov/llama.cpp) repo
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```
### Step 2. Compile with `CMake`

The old llama.cpp project used `make`; the current version is compiled with `CMake`. For more detailed commands, see the [official documentation](https://github.com/ggerganov/llama.cpp/blob/master/docs/build.md).

If you haven't installed `cmake`, you can install it with this command:
```bash
# linux
sudo apt-get update
sudo apt-get install cmake
```
#### 1. CPU build

If your computer only has a CPU, use this command:
```bash
cmake -B build
cmake --build build --config Release
```
#### 2. CUDA build

If you have an NVIDIA graphics card, use this instead:
```bash
cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release
```

When it's done, you'll see lots of tools in ./build/bin/. Commonly used ones include `llama-cli`, `llama-server` and `llama-quantize`. Older versions put the tools in ./ after building; the new version puts them in ./build/bin/, so take note.


![](/assets/78f24809604f/1*okD8Oc_wMV5zNIzep6AeTA.png)

### Step 3. Prepare the environment

I'm using conda to manage it. The officially recommended Python is >= 3.7
```bash
conda create --name llamaCpp python=3.9
conda activate llamaCpp
python3 -m pip install -r requirements.txt
```
### Step 4. Quantize the model
#### a). Download the model

First, download [DeepSeek-R1-Distill-Qwen-14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B) from Hugging Face. If you're not familiar with Hugging Face, see my [earlier article](../ef839026207b/). After downloading, check that it contains:
- config.json
- model.safetensors
- tokenizer.json
- tokenizer_config.json



![](/assets/78f24809604f/1*GGdrw_hi-WojSh5xIFIbeQ.png)

#### b). Convert the model to GGUF

llama.cpp only supports models in GGUF format, but models usually aren't released as GGUF, so we need to convert it.

llama.cpp provides various Python scripts, `convert_*.py`, to help with this; you'll find them in the llama.cpp folder you cloned in step 1. For models downloaded from Hugging Face, you generally use `convert_hf_to_gguf.py` to convert to GGUF, like this:
- --outfile: where the converted model goes.

```bash
python3 convert_hf_to_gguf.py ../DeepSeek-R1-Distill-Qwen-14B --outfile ./models/DeepSeek-R1-Distill-Qwen-14B-gguf
```
#### c). Quantize with llama-quantize (optional)

Once you have the GGUF model of DeepSeek-R1-Distill-Qwen-14B, you can quantize it further, trading some precision for a smaller model. Below is how much space Q8_0 and Q4_0 save; there are many other quantization methods, described in the [official documentation](https://github.com/ggerganov/llama.cpp/blob/master/examples/quantize/README.md).


![How much space different quantization methods take for different models](/assets/78f24809604f/1*Xon-DM_s4sMsrUZci69Pww.png)

How much space different quantization methods take for different models

Here I'm using Q4_K_M; you can swap in whichever quantization you like:
```bash
# quantize the model to 4-bits (using Q4_K_M method)
./build/bin/llama-quantize ./models/DeepSeek-R1-Distill-Qwen-14B-gguf.gguf ./models/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf Q4_K_M
```

It took my computer about 20 minutes, quantizing the original 27.5 GB model down to 8.37 GB.

If this feels too complicated, you can use Hugging Face's [GGUF-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo) to quantize directly. It has a nice UI and is easier to use. And if you don't want to quantize at all, there are plenty of ready-made quantized models online that you can download and use directly.
### Step 5. Load the model

Then you can use `llama-cli` to chat with the model. Here are the commonly used parameters:
```bash
./build/bin/llama-cli -m ./models/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf -cnv --chat-template gemma -ngl 100
```
- `-m` specifies the model path
- `-n` sets the number of tokens to predict when generating text
- `-c` sets the context size of the input prompt; the default is 4096
- `-t` sets the number of threads used for generation; setting it to the number of physical CPU cores is recommended for best performance.
- `-cnv` runs in conversation mode, which doesn't show special tokens or prefixes and suffixes
- `-ngl` in builds with GPU support, offloads some layers to the GPU



![Chatting with the model using llama-cli](/assets/78f24809604f/1*je34hhF8060oZmEU9kFCPQ.png)

Chatting with the model using llama-cli
### Step 6. Server

llama.cpp also provides an HTTP server compatible with the OpenAI API. Just run `./llama-server` to get it up quickly. By default it opens an LLM service at `http://127.0.0.1:8080/`. It has many more parameters than `llama-cli`; see the [official documentation](https://github.com/ggml-org/llama.cpp/tree/master/examples/server), or adjust them once you're in the server.
```bash
./build/bin/llama-server -m ./models/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf -ngl 100
```

Once it's running, you can go to `http://127.0.0.1:8080/` and chat with the model. llama.cpp's chat interface has improved a lot, and I recommend trying it.


![](/assets/78f24809604f/1*z1Nmmr2iVyVK8ir9vs1JPg.png)


With the HTTP server running, you can also talk to it directly with curl, which lets you use it as an interface for connecting other services.
```bash
curl --request POST \
    --url http://localhost:8080/completion \
    --header "Content-Type: application/json" \
    --data '{"prompt": "Tell me about Snow Mountain in Taiwan"}'
```


![What it looks like](/assets/78f24809604f/1*tfSCjHfrmqFwKQe6eopr-Q.png)

What it looks like
### 3. Deploying DeepSeek with Ollama

The llama.cpp steps above are more involved, but they offer a lot of flexibility. If you just want to test how a model performs without going through all that, try Ollama, which is built on top of llama.cpp.
### Step 1. Download Ollama

On Linux, first download Ollama with the command below. On other systems, you can find download instructions on the [Ollama website](https://ollama.com/download).
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
### Step 2. Ollama basics

Once installed, start Ollama first. Here are some commonly used commands:
```typescript
ollama serve
```
- `ollama list`: list all downloaded models
- `ollama ps`: show the currently loaded models
- `ollama stop <model_name>`: stop a loaded model
- `ollama rm <model_name>`: delete a model

### Step 3. Download a model

Ollama has packaged some well-known models so you can download them directly with the ollama tool; you can see the [official list of available models](https://ollama.com/search). If the model you want isn't on the list, Ollama can also import GGUF models, so you can download any model you like from Hugging Face.

I'll demonstrate both approaches below; you only need to do one.
#### 1. Download a model with ollama pull:

Ollama has integrated deepseek-r1 in versions of different sizes, which you can see on [this page](https://ollama.com/library/deepseek-r1). Some are already quantized. For example, the 14b model below is exactly the same as the one demonstrated with llama.cpp above: DeepSeek-R1-Distill-Qwen-14B quantized with Q4_K_M.


![](/assets/78f24809604f/1*k8yoTU6am8D48kMgNF-ouQ.png)


To download this model, just enter this command:
```bash
ollama pull deepseek-r1:14b
```
#### 2. Import an existing GGUF model

Here I'll use the DeepSeek-R1-Distill-Qwen-14B model quantized with Q4_K_M in the llama.cpp walkthrough as the example. Above, we ended up with a model named `DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf`.

a). Create a `Modelfile`

First create a file named `Modelfile`, and in it write FROM followed by the path of the model to import.
```bash
FROM ../llama.cpp_new/models/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf
```

b). Create the model in Ollama

Then use the ollama command to import the model. `DeepSeek-R1-Distill-Qwen-14B-Q4_K_M` is the model's name in Ollama; you can call it whatever you like.
```bash
ollama create DeepSeek-R1-Distill-Qwen-14B-Q4_K_M -f Modelfile
```
### Step 4. Load the model

After getting the model with either method, you can check it worked with `ollama list`.


![](/assets/78f24809604f/1*BpkLJ86S11hQTY0gqWA6FQ.png)


Once the model is there, we can run it with `ollama run`:
```bash
ollama run DeepSeek-R1-Distill-Qwen-14B-Q4_K_M:latest
```


![](/assets/78f24809604f/1*gYvr56vl11GL3TtuQBxnXw.png)


While it runs, the HTTP server is up too, so just like with llama.cpp, you can talk to the model with curl, and later use this interface to connect different services.
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "DeepSeek-R1-Distill-Qwen-14B-Q4_K_M:latest",
  "prompt":"Hi, tell me about Hehuanshan"
}'
```


![What it looks like](/assets/78f24809604f/1*WB9X6e40CupsegSugVH2Xw.png)

What it looks like
### Conclusion

LLMs are improving faster and faster. When I demonstrated llama2 + llama.cpp early last year, a model of about the same 9 GB size performed very differently from today's DeepSeek-R1. Back then, the model was nearly unusable, with too many errors and too short a context window. Now, I find the 9 GB DeepSeek-R1 model's fluency and accuracy quite usable, which makes me very excited about where open-source LLMs are heading.

That's exactly why I wanted to write a new llama.cpp and Ollama tutorial, in the hope of making it easier for everyone to test open-source LLMs. If you have any questions, leave a comment or email me, and if anything in the article is wrong, please let me know.
