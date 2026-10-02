---
original: ck-wu-paper
title: 'Answer, Refuse, or Guess? Reading CK Wu''s Paper on Risk-Aware Decisions'
description: >-
  Should a model answer, refuse or guess when it isn't sure? A guided read of
  the paper OpenAI cited, on why models misjudge risk and how prompt chaining
  helps.
tags: []
sourceHash: '9b91066e3efb'
---

After reading OpenAI's "Why language models hallucinate," I went on to read CK Wu's paper that OpenAI cites, "Answer, Refuse, or Guess? Investigating Risk-Aware Decision Making in Language Models," and wrote a short guided read that I want more people to see.

Below are my notes on the paper. They've been heavily revised, so I recommend reading the version at the link:
https://lnkd.in/gbAjF3Zz
-----------------------------------------
As an AI engineer, here's the question: when an LLM answers a question and isn't sure of the answer, should it answer directly, politely decline, or take a gamble and guess? It sounds simple, but it bears on the safety and reliability of AI systems. If it answers wrong, the consequences range from misinformation to real harm. In a medical diagnosis setting, for example, a model giving an answer when it isn't confident could hurt a patient. In low-risk settings, like everyday Q&A, a wrong guess is no big deal.
So an ideal language model should decide dynamically whether to answer, refuse or just guess, depending on how risky the situation is. This is what's called risk-aware decision making, and the idea reflects what we hope for from safer, more reliable AI.

The image shows an example of risk-aware decision making proposed by the authors.

The research team designed a simple scoring scheme:
- Correct answer: points added
- Wrong answer: points deducted
- Refusal: 0 points

By adjusting how much is added and deducted, you can create different levels of risk. For example:
- High-risk setting (1, -8): wrong answers are heavily penalized, so guessing almost always loses points.
- Low-risk setting (8, -1): correct answers pay off big and wrong ones cost only a little, so guessing is always worth it.

This design lets researchers clearly observe how models behave under different risks. Notably, they used several existing multiple-choice datasets for testing, like MedQA from medical licensing exams, MMLU covering a broad range of knowledge, and GPQA, a set of very hard graduate-level questions.
Take MedQA: it comes from medical licensing exams, and in real medical settings a wrong diagnosis has serious consequences, so this question set naturally fits the profile of a high-risk scenario.

The results are thought-provoking. The team tested mainstream models like GPT-4, Claude and Gemini, and found that in high-risk settings, where models should refuse, they often couldn't help answering anyway; while in low-risk settings, where models should answer boldly, they were overly conservative and refused instead. In other words, even knowing the risk settings, models still often made irrational decisions.
Fortunately, in high-risk settings, explicitly telling the model "this is a high-risk scenario" improved its overall score compared with not telling it at all. Intuitively, that suggests the model becomes a bit more careful when it knows the stakes are high. In low-risk settings, though, telling it about the risk didn't help and sometimes even hurt performance. The authors say bluntly that in low-risk situations, the best strategy is not to give the model the option to refuse at all; just make it answer every question, and the average score goes up XD

To address this, the authors propose skill decomposition + prompt chaining. They argue a model actually needs to use three skills together to make the right decision:
- Answering the question: as in an ordinary multiple-choice question, pick a candidate answer first
- Assessing confidence: judge the probability that its answer is correct, i.e. calibration
- Expected-value reasoning: based on confidence and the reward and penalty scores, calculate the expected payoff of answering versus refusing, then decide what to do

But the experiments show that when a model has to juggle all three at once, it often drops one of them. So the authors propose prompt chaining: split the task into multiple rounds of interaction, each step focusing on one thing, with each step's result fed into the next.
Note this is different from a stepwise prompt. A stepwise prompt writes all three steps into one prompt and does them in one go; prompt chaining splits them into multiple rounds, each focused on a single step.

The results show prompt chaining significantly improves performance in high-risk scenarios: the model refuses more often when it should, lowering the risk of errors. A stepwise prompt, by comparison, is also staged but done within a single prompt, and its results aren't as consistent as prompt chaining's.

This research lays down an evaluation framework and a solution for the important problem of risk-aware decision making, and it highlights an old LLM problem: compositional generalization. A model may do well on each skill alone, but ask it to combine question answering, calibration and mathematical reasoning at once, and it easily goes off. It's a reminder that AI still has some way to go before it makes truly rational decisions.
