---
original: 8c81c1210397
title: 'Answer, Refuse or Guess? Teaching Language Models About Risk'
description: >-
  When a model isn't sure, should it answer, decline or guess? A guided read of
  the answer-or-defer research from Appier, and why skill decomposition with
  prompt chaining gets closest to the optimal choice.
tags:
  - ai
  - llm
  - research
  - ailogora
sourceHash: 'cdb85a4d5843'
---

This article is also published on [AILogora](https://ailogora.com/card/fcef491b-47ba-43fa-aecc-aa41cd5b8404?from_topic=llmslm).

After recently reading OpenAI's "[Why language models hallucinate](https://ailogora.com/card/e1c417c3-835a-4dc0-92e8-78fad7b19eeb)" (see the viewpoint card below), I came across another interesting piece on Facebook: "[Answer, Refuse, or Guess? Investigating Risk-Aware Decision Making in Language Models](https://drive.google.com/file/d/1J16b7hYYi_-r3WETbzVsxHwT286yeLY6/view)," which OpenAI cites. I recommend reading them together. The authors are a team from Appier.
### A guided read:

When an LLM answers a question and isn't sure of the answer, should it **answer directly**, **politely decline**, or **take a gamble and guess**? The question sounds simple, but it bears on the **safety and reliability** of AI systems. If it answers wrong, the consequences range from misinformation to real harm. In a medical diagnosis setting, for example, a model giving an answer when it isn't confident could hurt a patient. In low-risk settings, like everyday Q&A, a wrong guess is no big deal.

So an ideal language model should decide dynamically whether to answer, refuse or just guess, depending on **how risky the situation is**. The authors formalize this as the "**answer-or-defer problem**" and design a framework for it. The figure below gives a quick sense of what the team set out to do.


![](/assets/8c81c1210397/0*lYx8x30AITN46Lv0.png)

### The experiment:

The study uses three values to characterize risk:
- **r_cor**: the reward for a correct answer
- **r_inc**: the penalty for a wrong answer
- **r_ref**: the score for refusing (usually set to 0, neither added nor deducted)


The evaluation logic is simple: with the **task held fixed** (say, multiple choice), **change only the risk values** and observe whether the model adjusts its strategy of whether to answer, to maximize the expected reward E[R]. For a sensible baseline, the authors use multiple choice (K=4) to derive "**the expected value of a blind guess**":


![](/assets/8c81c1210397/0*FvBwQzYw58wltxgb.png)

- If r_guess > r_ref (r_ref is mostly set to 0 in the paper), it's **low risk**: even guessing randomly beats not answering, so **the optimal strategy is to always answer**
- If r_guess < r_ref, it's **high risk**: the expected value of guessing is negative, so the model **should answer selectively**, refusing when it isn't confident


People define these three values. The authors write them into the prompt, as in the figure below, and ask the model to judge for itself whether to answer within the given task. By adjusting how much is added and deducted, you can create different levels of risk. For example:
- **High-risk setting** (1, -8): wrong answers are heavily penalized, so guessing almost always loses points.
- **Low-risk setting** (8, -1): correct answers pay off big and wrong ones cost only a little, so guessing is always worth it.



![](/assets/8c81c1210397/0*whsUj2wLmz9RkXtQ.png)


This design lets researchers clearly observe how models behave under different risks. Notably, they used several existing multiple-choice datasets for testing, like MedQA from medical licensing exams, MMLU covering a broad range of knowledge, and GPQA, a set of very hard graduate-level questions.

Take MedQA: it comes from medical licensing exams, and in real medical settings a wrong diagnosis has serious consequences, so this question set naturally fits the profile of a high-risk scenario.
### Results:

The authors ran two very illuminating sets of experiments, with results shown in the figure below:

**1. Standard knowledge tasks** (multiple-choice sets like GPQA, MMLU and MedQA):

The results are thought-provoking. The team tested mainstream models like GPT-4, Claude and Gemini. The overall trend is right: the heavier the penalty, the more often models refuse on average. But in high-risk settings, where models **should refuse**, they often couldn't help answering anyway; and in low-risk settings, where models **should answer boldly**, they were overly conservative and refused instead. In other words, even knowing the risk settings, models still often made **irrational decisions**.

**2. Pure gambling** (removing the need for knowledge, leaving only probabilities and stakes):

Besides GPQA, MMLU and MedQA, the authors ran another kind of experiment, pure gambling, which removes the need for knowledge entirely and decides whether to answer purely by computing the expected reward from confidence and the rewards and penalties. The results show that once the task is simplified to **only weighing expected value (EV)**, the models' refusal rates come **much closer to optimal**. Their reasoning traces show it too: in pure gambling, models actively compute expected values, but back on questions full of specialized knowledge, they barely do any EV calculation and guess on "intuition" instead.


![](/assets/8c81c1210397/0*7yEM5v4VUBrtjPYM.png)


From this experiment, models can compute EV and understand how to make the trade-off, but when a task requires "downstream task + confidence estimation + reasoning with expected values" all at once, they often don't assemble those skills on their own. So the authors propose the following solution.
### The solution:

The authors propose **skill decomposition** to improve things, comparing four strategies:
1. **Baseline** (risk not stated): ordinary multiple choice + chain-of-thought
2. **Risk-informing** (stating the risk structure and the option to refuse)
3. **Stepwise**
4. **Prompt chaining**


A stepwise prompt writes all three steps into one prompt and does them in one go; prompt chaining splits them into multiple rounds, each focused on a single step, as shown below:


![](/assets/8c81c1210397/0*3VivIW6xfeSrMV5_.png)


In **high-risk settings**, just explicitly telling the model the rewards and penalties clearly beats not telling it at all. And splitting "downstream task + confidence estimation + reasoning with expected values" into three steps, linked one after another through prompt chaining, almost consistently gets the best results. By contrast, the stepwise approach, which crams several subtasks into a single message, is often unstable: when the model has to juggle all three at once, it often drops one. The authors suspect this is related to the curse of instructions.

In **low-risk settings**, the reverse is true: the best choice is usually to keep the baseline, or even not offer the option to refuse, because in theory "always answer" maximizes the expected reward. Once refusal is allowed, models tend to become overly conservative, and unnecessary hesitation dilutes their score.

So the authors recommend that for low-risk tasks (like everyday customer service or drafts), you simply remove the option to refuse and require an output. For high-risk tasks (like medicine, law or finance), use **skill decomposition + prompt chaining**: have the model answer the question well first, then calibrate its confidence, and finally decide using expected value, pulling its behavior as close to optimal as possible.
### Conclusion:

The authors also tested reasoning models. Even with stronger reasoning, they still benefit from **skill decomposition + prompt chaining**, because a model being able to reason doesn't mean it will automatically assemble "downstream task + confidence estimation + reasoning with expected values" correctly. So in engineering terms, you still need to **break the task down clearly, hard-code the flow and execute the instructions step by step**, instead of cramming every expectation into a single prompt. This also highlights an old LLM problem, **compositional generalization**. A model may do well on each skill alone, but ask it to combine "downstream task + confidence estimation + reasoning with expected values" at once, and it easily goes off. It's a reminder that AI still has some way to go before it makes truly rational decisions.
