---
original: prompt-repetition-improves-non-reasoning-llms
title: Prompt Repetition Improves Non-Reasoning LLMs
description: >-
  Google researchers pasted the same prompt twice and made non-reasoning models
  more accurate across most benchmarks, with almost no change in output length.
  Why such a crude trick works.
tags: []
sourceHash: 'e4ee4e94cf89'
---

Prompt Repetition Improves Non-Reasoning LLMs
I recently read a preprint that's very crude but effective. Google researchers pasted the same prompt twice (<QUERY><QUERY>), and with reasoning mode turned off, Gemini, GPT, Claude and DeepSeek all became more accurate on most tests, including ARC, OpenBookQA, GSM8K, MMLU-Pro and MATH, while barely making outputs longer and mostly keeping latency about the same. They call the trick prompt repetition.
What I find interesting is that it's really compensating for a structural limit of causal LMs: the model can only see what came before, so if key information sits in the wrong position, it's easy for it to go unused. Repeating it means the key fragments appear twice in the sequence and can align with each other more easily. On long-context extraction and locating tasks (like finding the Nth name in a long list), the effect is almost absurdly large.
The downside is that input tokens double, so you pay for it in both cost and context window. But input tokens are generally cheaper than output tokens these days, and performance is usually bottlenecked on output-token speed, so for now I think it's very much worth trying, especially in traditional RAG systems.
