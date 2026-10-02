---
original: c9ac7835adb3
title: 'Comparing LLM Specs: ChatGPT, Gemini, Claude, Mistral, Llama and More'
description: >-
  With Gemini 1.5 and Claude 3 out, LLM specs got complicated, so I put together
  an up-to-date comparison table of models from OpenAI, Google, Anthropic, Meta
  and Mistral AI.
tags:
  - llm
  - technology-comparison
  - ai
  - machine-learning
  - research
sourceHash: '0636dab61503'
---

### Comparing LLM specs: ChatGPT, Gemini, Claude, Mistral, Llama and more

Last updated: 2024/04/26

LLMs have grown extremely fast over the past few months. Their abilities are astonishing and their uses wide-ranging, from writing articles to composing music to answering complex scientific questions. Recently, the releases of Gemini 1.5 and then Claude 3 have intensified the competition further, and LLM specs have become more and more complicated. So I decided to take the time to put together an up-to-date comparison table, covering models from OpenAI, Google, Anthropic, Meta, Mistral AI and others.

The table aims to give everyone a clear view of the key specs of each vendor's LLMs, comparing dimensions from model size and training data to context window.

The table is on GitHub: [Comparison-of-LLM-Specifications](https://github.com/wsxqaza12/Comparison-of-LLM-Specifications). On GitHub you can find the sources for each piece of uncertain information. If you spot any errors, want to discuss something, or have new information to add, you're very welcome to open an issue or submit a PR. I hope this way the document keeps improving and the quality of the data goes up. I hope this work is valuable to anyone interested in the development of machine learning and AI, whether you're a researcher, a developer or just an enthusiast.
### April update

A lot of open models came out this month. Added: xAI's Grok-1, Apple's MM1, Snowflake's Arctic, Cohere's Command R+, Mistral AI's Mixtral 8x22B and Meta's Llama 3.
- GPT-4 was briefly overtaken by Claude 3 Opus, but returned to first place after an update
- Data shows Llama 3 400B can beat the weakest GPT-4, but it isn't open yet.
- Command R+ is designed specifically for RAG.



![](/assets/c9ac7835adb3/1*g86Ns8_hVl2rr8_oChsUQQ.png)

### March update

Mainly comparing well-known models from OpenAI, Google, Anthropic, Meta and Mistral AI. For now, GPT-4 is still number one.


![](/assets/c9ac7835adb3/1*oYCTU5uLfij0m4_EVaVR4w.png)

### Other notes
- Both Gemini 1.5 and Claude 3 have put a lot of work into the context window. Gemini 1.5's technical report even says it can handle 10M tokens and understand the content accurately. That's undoubtedly a major competitor to OpenAI's GPT series, because RAG systems arose, to some extent, precisely because LLMs couldn't handle a very large context window.
- Claude 3 has always been known for safety, which isn't covered here.
- Each vendor has too many fine-grained model variants to cover here. If you're interested, see Wolfram Ravenwolf's [LLM Comparison/Test](https://www.reddit.com/r/LocalLLaMA/comments/1b5vp2e/llm_comparisontest_17_new_models_64_total_ranked/).

### Glossary:
- Parameters size: the parameter count measures a model's "capacity" or complexity
- MoE (Mixture of Experts): an architecture that divides the model into multiple experts, each responsible for learning a different part of the input data. It effectively improves the model's learning ability and adaptability, because the model can pick the most suitable expert for each input.
- Training data (date): the size of the data used to train the LLM; the date is the time range in which the data was collected.
- Output token: the maximum number of tokens the model can generate in a single output. Tokens usually represent words or subwords, so this number reflects the upper limit on the length of generated text.
- Context window: the maximum number of characters (or tokens) the model can take into account when making a prediction.
- Type: how the model can be accessed, open (open source) or closed.
- Release date: the date this model version was publicly released.

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/c9ac7835adb3/1*QCQqlZr6doDP-cszzpaSpw.png)
