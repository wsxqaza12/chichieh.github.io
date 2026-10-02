---
original: 42628a4362f7
title: Evaluating LLMs with EleutherAI's LM Evaluation Harness
description: >-
  A hands-on guide to evaluating LLMs with EleutherAI's lm-evaluation-harness on
  the six benchmarks behind Hugging Face's Open LLM Leaderboard, for Hub models,
  local models and llama.cpp, with results tracked in Weights & Biases.
tags:
  - llm
  - evaluation
  - artificial-intelligence
  - programming
  - tutorial
sourceHash: '3a6b74352e55'
---

### LLM evaluation tutorial: EleutherAI LM Evaluation Harness


![](/assets/42628a4362f7/1*6AlMGCA3cZK6E3Ef2OrELw.png)


In [the previous article](../e81616d30e53/), we looked at the metrics and details to consider when evaluating LLMs. In this article we'll dig into how to actually evaluate an LLM. The tool we'll use is EleutherAI's `lm-evaluation-harness`. It's powerful and flexible, and several organizations have built on it; Hugging Face, for example, uses it extensively in its Open LLM Leaderboard.

You've probably seen Hugging Face's Open LLM Leaderboard. It provides an open, transparent platform for showing how different models perform. Behind it, evaluation focuses mainly on 6 key benchmarks, so this article mainly walks you through using `lm-evaluation-harness` to evaluate those 6 benchmarks:
1. **AI2 Reasoning Challenge (ARC)** — 25-shot:
ARC is a set of grade-school science questions designed to test AI models' scientific reasoning.
2. **HellaSwag** — 10-shot:
HellaSwag is a commonsense reasoning test that's extremely easy for humans (about 95% of people answer correctly) but still a challenge for today's most advanced models.
3. **MMLU** — 10-shot:
MMLU measures a text model's accuracy across many tasks. It covers 57 tasks, including elementary math, US history, computer science and law.
4. **TruthfulQA** — 0-shot:
TruthfulQA measures a model's tendency to reproduce falsehoods commonly found online. Technically, TruthfulQA is a 6-shot task in the harness, because even in the 0-shot setting each example is prefixed with 6 Q/A pairs.
5. **Winogrande** — 5-shot:
Winogrande is a large-scale, adversarial and difficult Winograd benchmark focused on commonsense reasoning.
6. **GSM8k** — 5-shot:
GSM8k contains diverse grade-school math word problems, designed to measure a model's ability to solve multi-step mathematical reasoning problems.

### Step 1. Clone EleutherAI's LM Evaluation Harness

Go to the `lm-evaluation-harness` [GitHub](https://github.com/EleutherAI/lm-evaluation-harness) and clone the evaluation tool.
```bash
git clone https://github.com/EleutherAI/lm-evaluation-harness
cd lm-evaluation-harness
```
### Step 2. Prepare the environment

I recommend creating an environment with conda. In [pyproject.toml](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/pyproject.toml) you can find the required version, python ≥ 3.8, and the packages that will be installed.
```lua
conda create -n LLM_evaluate python=3.8
conda activate LLM_evaluate
pip install -e .
```
### Step 3. About the tool

`lm-evaluation-harness` supports many model types and commercial models, including models hosted on the Hugging Face Hub, the OpenAI and Anthropic APIs, and interfaces for llama.cpp and vLLM. So whether you're evaluating a publicly available LLM or your own fine-tuned LLM, you can use this tool.

It has a lot of parameters; see its [docs](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/interface.md). Here are a few commonly used ones:
- **--model**: the type of model to evaluate, such as `hf`, `gguf`, `vllm`, `openai`.
- **--model_args**: the model's location and parameters, such as a Hugging Face repo name or a local `./xxxxx`. This parameter accepts more than one value, separated by `,`.
- **--tasks**: which tasks to evaluate; also accepts more than one. You can list them with `lm-eval --tasks list`.
- **--device**: the GPU to use. For more than one, use `accelerate launcher` or the `tensor_parallel_size` parameter
- **--batch_size**: `auto` picks the batch size automatically
- **--output_path**: where results are saved.
- **--use_cache**: caches results from previous runs, so the same scenario isn't run twice.
- **--log_samples**: records the evaluation process, including every prompt and answer.

### Step 4. Start evaluating

As mentioned above, `lm-evaluation-harness` supports many model types, so below I'll demonstrate a few common cases; other uses follow the same pattern:
1. Evaluating a model hosted on Hugging Face
2. A local HF model
3. A model running on llama.cpp


The benchmarks are the 6 used by Hugging Face. You can see every task `lm-evaluation-harness` supports with this command:
```bash
lm-eval --tasks list 
```
### 4.1 Evaluating a model hosted on Hugging Face

To evaluate a model hosted on the Hugging Face Hub (for example GPT-J-6B or your own model), use this command:
```bash
lm_eval --model hf \
    --model_args pretrained=EleutherAI/gpt-j-6B \
    --tasks arc_challenge, hellaswag, mmlu, triviaqa, winogrande, gsm8k \
    --device cuda:0 \
    --batch_size auto \
    --output_path ./eval_out/hf \
    --use_cache ./eval_cache/hf
```
### 4.2 Evaluating a local HF model

If your HF model is stored on your computer, use this:
```bash
lm_eval --model hf \
    --model_args pretrained=./model_name \
    --tasks arc_challenge, hellaswag, mmlu, triviaqa, winogrande, gsm8k \
    --device cuda:0 \
    --batch_size auto \
    --output_path ./eval_out/local_hf \
    --use_cache ./eval_cache/local_hf
```
### 4.3 Evaluating a model running on llama.cpp

If you've always used llama.cpp's `gguf`, we first need to start an API. As mentioned in my earlier llama.cpp [tutorial](../2451807f8ba5/), you can use llama.cpp's built-in `./server` to set up an HTTP API quickly, but `lm-evaluation-harness` doesn't support that yet. So we need to use [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) to set up the API, in 3 main steps:

**I. Switch environments (you can do this in another tab)**
```bash
conda activate llamaCpp
```

**II. Install llama-cpp-python**
```bash
pip install 'llama-cpp-python[server]'
```

**III. Start the server**
```css
python3 -m llama_cpp.server --model models_name.gguf
```

That gets [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) serving the API for you. Note that the URL is http://localhost:8000, unlike the original llama.cpp's http://localhost:8080.

Then you can evaluate with this command:
```bash
lm_eval \
    --model gguf \
    --model_args base_url=http://localhost:8000 \
    --tasks arc_challenge, hellaswag, mmlu, triviaqa, winogrande, gsm8k \
    --device cuda:0 \
    --batch_size auto \
    --output_path ./eval_out/llamacpp \
    --use_cache ./eval_cache/llamacpp
```


![What it looks like](/assets/42628a4362f7/1*64yXk0NCnK3Lo6xjbh5_qg.png)

What it looks like
### Step 5. Record results with Weights & Biases

`lm-evaluation-harness` supports Weights & Biases (W&B), a platform for tracking, visualizing and managing machine learning experiments. It's widely used to record how models train and to compare performance across models; here it lets you track evaluation results nicely.

To use W&B, just add the `wandb_args` parameter, with `project` set to your project name in W&B.
```bash
lm_eval \
    --model gguf \
    --model_args base_url=http://localhost:8000 \
    --tasks arc_challenge, hellaswag, mmlu, triviaqa, winogrande, gsm8k \
    --device cuda:0 \
    --batch_size auto \
    --output_path ./eval_out/llamacpp \
    --use_cache ./eval_cache/llamacpp \
    --wandb_args project=llm_eval_benchmark \
    --log_samples
```

Next, W&B offers us three options:


![](/assets/42628a4362f7/1*xzHPMojlvb1u6caMm7SW2g.png)


1. Create a W&B account:
If you don't have a W&B account, this option takes you to the [W&B website](https://wandb.ai/authorize?signup=true) to sign up. Once that's done, you'll get an API key; come back and enter it.


![](/assets/42628a4362f7/1*C0JQZHidBjnKJi08o_iLbg.png)


2. Use an existing W&B account:
If you already have a W&B account, follow the instructions to get your API key. If you couldn't find your API key under (1) Create a W&B account, you can get it this way.


![](/assets/42628a4362f7/1*3AQEMuyxZMo6EWO58oJTew.png)


3. Don't visualize my results:
If you don't want to sign up or log in, you can still use W&B to record results. They're saved locally; you just can't view them with the website's visualizations.

Note: your API key is saved in ~/.netrc, so next time you won't need to choose among the 3 options. If you want to switch accounts, delete that file and start over.

Once you've entered the API key, evaluation starts automatically, and when it finishes, your results sync straight to W&B.


![](/assets/42628a4362f7/1*2Y6WCkLHyuTF4x8-pPdfdw.png)


Then you can follow the link above into your W&B project, where the results are already visualized on the site.


![](/assets/42628a4362f7/1*MunVF8D81F3Gx-PkJwwKjQ.png)

### Conclusion

`lm-evaluation-harness` is a really useful tool, offering a powerful and flexible platform for evaluating all kinds of models, and it's ideal for everyday users running experiments and research. I hope this tutorial helps you evaluate your models quickly.

Besides `lm-evaluation-harness`, there are many other frameworks designed specifically for LLM evaluation, such as LangChain's LangSmith, Confident AI's DeepEval and TruEra. Each has its strengths, so choose the evaluation tool that best fits your needs and your model.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/42628a4362f7/1*QCQqlZr6doDP-cszzpaSpw.png)
