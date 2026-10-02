---
original: 2451807f8ba5
title: 'Run Llama 2 on Your Phone: A llama.cpp Tutorial'
description: >-
  Build your own LLM with llama.cpp. Compile it, convert and quantize Llama 2 to
  GGUF, run it from the command line and serve it over HTTP.
tags:
  - llama-2
  - llm
  - llama-cpp
  - chatbots
  - tutorial
sourceHash: '8ce63d833750'
---

### Run Llama on your laptop! A llama.cpp tutorial


![](/assets/2451807f8ba5/0*k7pC8E9erRanEQtu.png)



> llama.cpp has changed a lot since this was written. If you're interested, see the new [article](../78f24809604f/) I wrote on 2025/2/17.





With AI developing so quickly, large language models (LLMs) like Llama 2 and 3 have become a hot spot at the frontier of technology. But the smallest Llama 2 model is 7B (Llama 3's smallest is 8B) and needs about 14 GB of memory, which ordinary consumer graphics cards can't handle. So there's a lot of work on reducing their resource use, like [llama.cpp](https://github.com/ggerganov/llama.cpp), which claims to run inference on a Raspberry Pi, and [pyllama](https://github.com/juncongmoo/pyllama). After processing, inference can run on as little as 4 GB of RAM.

This article shows you how to quantize a model with llama.cpp and set up a server, so you can use your own LLM.
### Step 1. Clone the llama.cpp project

Clone the [llama.cpp](https://github.com/ggerganov/llama.cpp) repo
```bash
git clone https://github.com/ggerganov/llama.cpp.git
```


![](/assets/2451807f8ba5/1*iPz_zGuFtUEFxtCs4P-eUQ.png)

### Step 2. Compile with the Makefile

Compile the llama.cpp project with `make`. This generates a lot of files, such as:
- ./llama-cli: for command-line use
- ./llama-quantize: for quantizing binary files
- ./llama-server: starts a server



![](/assets/2451807f8ba5/1*0N8YWwej3vU7qe7lZIGS5Q.png)


The approach above only runs on the CPU. If you want to use a GPU:
- Windows/Linux users: compiling with BLAS (or cuBLAS if you have a GPU) is recommended and speeds up prompt processing

```bash
make GGML_CUDA=1 # LLAMA_CUBLAS is deprecated
```
- macOS users: nothing extra needed. llama.cpp is already optimized for ARM NEON, and BLAS is enabled automatically. On M-series chips, using Metal to enable GPU inference is recommended and significantly increases speed.

```bash
LLAMA_METAL=1 make
```

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

If you get the following error during `make`:
```bash
: not foundld-info.sh: 2:
: not foundld-info.sh: 4:
: not foundld-info.sh: 9:
scripts/build-info.sh: 31: Syntax error: end of file unexpected (expecting "then")
make: *** [Makefile:676: common/build-info.cpp] Error 2
```

it's caused by different line endings. If you clone with Git on Windows (CRLF) and then upload the folder to a Linux system (LF), you get this error. You can fix it like this:
```bash
sudo apt install dos2unix
find -type f -print0 | xargs -0 dos2unix
```
### Step 4. Prepare the environment

Managing it with conda is recommended
```lua
conda create --name llamaCpp python=3.9
conda activate llamaCpp
python3 -m pip install -r requirements.txt
```
### Step 5. Quantize the model

Use `convert.py` to quantize the model. Here's how to quantize Llama 2 chat 7B:
### a). Download Meta's Llama 2 7B chat

See my earlier [article](../d4374ed248d9/) for this; you can also download Llama 3 depending on your needs. If you followed my earlier steps, you'll have a cloned llama project with llama-2-7b-chat/ downloaded inside it. Here are the files in that folder:


![](/assets/2451807f8ba5/1*QGecv1vIc47jxb08lERjMA.png)

### b). Convert to GGUF with convert-hf-to-gguf.py

The model file format llama.cpp can run is called GGUF. You can use the `convert-hf-to-gguf.py` tool that comes with llama.cpp to convert the llama-2-7b-chat model to GGUF.

`convert-hf-to-gguf.py` was installed in the environment step above, so you just need to run the command below.

Note: older versions of llama.cpp use `convert.py`
- Be sure to use `--vocab-dir` to specify where tokenizer.model is; if you don't, you'll get the error `FileNotFoundError: spm tokenizer.model not found.`
- Use the `--outtype` parameter to set the data type; it's usually detected automatically, so you can leave it out. Note that this is not quantization!
- Use `--outfile` to set where the converted model goes

```bash
cd llama.cpp
python3 convert-hf-to-gguf.py models/llama-2-7b-chat --vocab-dir ../llama --outtype fP16
 --outfile models/llama-2-7b-chat/llama-2-model.gguf
```

When I ran it, I got an error:
```vbnet
ValueError: The model's vocab size is set to -1 in params.json. Please update it manually. Maybe 32000?
```

To fix it, edit `params.json` in llama-2-7b-chat/ and change vocab_size from -1 to 32000.
```yaml
{"dim": 4096, "multiple_of": 256, "n_heads": 32, "n_layers": 32, "norm_eps": 1e-06, "vocab_size": -1} # original
{"dim": 4096, "multiple_of": 256, "n_heads": 32, "n_layers": 32, "norm_eps": 1e-06, "vocab_size": 32000} # changed
```

Run it again:
```bash
python3 convert.py models/llama-2-7b-chat --vocab-dir ../llama --outtype fP16
 --outfile models/llama-2-7b-chat/llama-2-model.gguf
```

and llama-2-model.gguf will be generated at the `--outfile` location.
### c). Quantize with llama-quantize

You can quantize the model with ./llama-quantize, at levels anywhere from 8-bit and 6-bit down to 2-bit. Usage:

Note: older versions of llama.cpp use `quantize`
```bash
./llama-quantize models/llama-2-7b-chat/llama-2-model.gguf models/llama-2-7b-chat/llama-2_q4.gguf Q4_K
```

The file size goes from the original 12.5 GB to 6.66 GB at Q8 and 3.79 GB at Q4. If you don't want to quantize yourself, there are plenty of ready-made quantized models online that you can download and use directly.

### Step 6. Load the model

Then you can use llama.cpp's llama-cli for some basic usage:

Note: older versions of llama.cpp use `main`
```bash
./llama-cli -m models/llama-2-7b-chat/llama-2_q4.gguf --color -f prompts/alpaca.txt -ins -c 2048 --temp 0.2 -n 256 --repeat_penalty 1.3
./llama-cli -m models/llama-2-7b-chat/llama-2_q4.gguf -n 256 --repeat_penalty 1.0 --color -i -r "User:" -f prompts/chat-with-bob.txt
```
- `-c` controls the context length; the bigger the value, the longer the conversation history it can refer to. Default 512
- `-f` specifies a prompt template
- `-n` controls the maximum length of the reply. Default 128
- `-b` controls the batch size. Default 512
- `-t` controls the number of threads. Default 8
- `--repeat_penalty` controls how strongly repeated text is penalized
- `--temp` is the temperature; the lower it is, the less random the reply, and vice versa
- `--top_p`, `top_k` control decoding and sampling
- `-m` specifies the model path
- `-ngl` specifies how many layers to load on the GPU



![](/assets/2451807f8ba5/1*glhfW0REtdNlEsgiR415uQ.png)

### Step 7. Server

llama.cpp can also set up a server so you can access the model over an HTTP API. Just run `./llama-server` to get it up quickly. By default it opens an LLM service at `http://127.0.0.1:8080/`. The parameters are much the same as for `.main/`, and you can also adjust them once you're in the server.

Note: older versions of llama.cpp use `server`
```bash
./llama-server -m models/llama-2-7b-chat/llama-2_q4.gguf -ngl 100 # GPU version
```


![](/assets/2451807f8ba5/1*aqeRgnAj_mdn0PAdXhO67Q.png)



![](/assets/2451807f8ba5/1*sCJeqhRELoCRb1pvtqJWIA.png)

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/2451807f8ba5/1*QCQqlZr6doDP-cszzpaSpw.png)
