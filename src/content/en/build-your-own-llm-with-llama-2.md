---
original: d4374ed248d9
title: 'Build Your Own LLM: A Llama 2 Tutorial'
description: >-
  A step-by-step guide to requesting access to, downloading and running Llama 2
  (and Llama 3) from Meta.
tags:
  - llm
  - llama-2
  - meta
  - installation
  - tutorial
sourceHash: 'dbe8a5f8c951'
---

![](/assets/d4374ed248d9/1*Yl_KcB1GZsR35tCS4r9j1w.png)


In this article I'll show how to set up and use Llama 2 and 3. The basic requirement is a GPU with 28 GB of VRAM, or at least 14 GB. If you don't have that, see my [llama.cpp tutorial](../2451807f8ba5/).
### Step 1. Request a license on Meta's website

Go to [Meta's website](https://ai.meta.com/resources/models-and-libraries/llama-downloads/) and request to download the Llama models. You can request Llama 2, Llama Guard 3 and Code Llama at the same time. It usually takes 1–2 days, but in my recent experience I got approval within 10 minutes.


![](/assets/d4374ed248d9/1*00a2mTMpL0UgFCWjJMIsWg.png)

### Step 2. Receive Meta's commercial license

Once you've applied, you'll receive an email with a commercial license.


![](/assets/d4374ed248d9/1*gbDX_1FpNLTS_tBeFR66NA.png)

### Step 3. Download the model

I downloaded through GitHub. Meta also offers downloads through [Hugging Face](https://huggingface.co/meta-llama), where there's an extra kind of model with `-hf` in the name, meaning it has been converted to a Hugging Face checkpoint.

If you're also downloading through GitHub, follow the steps below:
### a). Clone the project

First go to [the Llama 2 GitHub](https://github.com/meta-llama/llama) or [the Llama 3 GitHub](https://github.com/meta-llama/llama3) and clone the project. The example below uses Llama 2.


![](/assets/d4374ed248d9/1*Wrvswt3xljgNqIysXYC9qQ.png)

### b). Run download.sh

If you're using WSL, the Windows Subsystem for Linux, you'll hit the problem below. After some digging, it turned out to be caused by not using sudo.


![](/assets/d4374ed248d9/1*rD16ErBQ5922l8wx8_oP5Q.png)

### c). Enter the URL from the email

Next, paste the URL you received by email (note that the URL in the example has expired).


![The email Meta sends you](/assets/d4374ed248d9/1*u9FI1Ro1jM1rTPvyHN4x2g.png)

The email Meta sends you


![](/assets/d4374ed248d9/1*yJz512s0U66b80txqo65DQ.png)

### d). Enter the models you want to download

I chose 7B and 7B-chat. Once entered, the download starts automatically.


![](/assets/d4374ed248d9/1*iyOIKnmBx4gNu1eCvbcnoQ.png)

### Step 4. Prepare the environment

Next, install the Python packages Llama 2 needs. Create an environment that can use CUDA. I used conda on WSL2:
```lua
conda create --name llama7B python=3.9b
conda activate llama7B
pip install -e .
```

Note: run the commands above inside the cloned folder.
### Step 5. Quick test

Enter the following command to quickly test whether your Llama 2 works.
- `--nproc_per_node 1` is the model-parallel (MP) value, which differs by model: 7B-1, 13B-2, 70B-8
- You can replace example_chat_completion.py with your own .py file
- `--ckpt_dir` is the folder you downloaded the model into

```css
torchrun --nproc_per_node 1 example_chat_completion.py \
    --ckpt_dir llama-2-7b-chat/ \
    --tokenizer_path tokenizer.model \
    --max_seq_len 512 --max_batch_size 6
```
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/d4374ed248d9/1*QCQqlZr6doDP-cszzpaSpw.png)
