---
original: multi-tw資料集
title: The Multi-TW Dataset
description: >-
  Multi-TW is the first multimodal benchmark built for Traditional Chinese,
  testing image, listening and text comprehension with real exam questions, and
  measuring latency too. A guided read.
tags: []
sourceHash: '019e80532037'
---

The Multi-TW dataset
This is the first multimodal benchmark built specifically for Traditional Chinese. It tests an AI's image recognition, listening comprehension and text question answering all at once. What's special is that it doesn't only look at how many answers a model gets right; it also measures latency, which makes it a very useful reference for real-world applications.

I thought it was great when I saw it, so I wrote a guided read to share. I've also put together a collection wall of LLM benchmarks, currently including Multi-TW, MME, TMMLU+, VisTai and others. What else do you think should be on it 🙏

(Link to the easy-reading version in the comments)
---------------------------------------------------------
1. What is Multi-TW?
In plain terms, Multi-TW is a question bank for testing AI, and the content is very local. The dataset collects 900 multiple-choice questions in Traditional Chinese. Each question isn't just text: some come with an image, some with an audio clip, like an everyday conversation or a broadcast, and then ask the AI a comprehension question.
These questions weren't made up by hand. They come from real questions on Taiwan's official Test of Proficiency-Huayu (TOP, or SC-TOP). They were originally designed to test people's Chinese listening and reading, and using them to test AI makes them very realistic and challenging.

2. Which models were tested?
To see how current AI models perform on the Multi-TW benchmark, the research team chose roughly two kinds of models:

A. End-to-end models with any-modality input (any-to-any MLLMs):
- These models can take images, audio, text and other inputs directly and produce an answer.
- Models included Gemini, Qwen 2.5-Omni and Baichuan-Omni-1.5.

B. Vision-language models + speech recognition (VLM + ASR):
- The second kind is the traditional approach. The model itself only handles images + text (no built-in listening ability), so for audio, Whisper speech recognition first turns the sound into text, then the model interprets it.
- The VLMs tested included Qwen-VL, Llama 3.2-Vision, UI-TARS, Idefics2, LLaVA and PaliGemma2.

The whole experimental design makes sure models from every mainstream approach can be compared on the same Traditional Chinese multimodal questions, and comparing the two approaches shows the effect of differences in model architecture.

3. How was it tested?
The researchers used a zero-shot setup: no extra training or prompt examples, just feed each question to the model and let it answer. Since the questions are multiple choice, the prompt told the model to "output only the letter of the answer (A/B/C/D)," to avoid long-winded responses. If a model didn't give a clear A/B/C/D, a random answer was guessed, so every question had an answer.
Every model ran the full set of 900 questions on the same hardware (a single NVIDIA A100 80GB), with the time per question measured. Closed models, though, were called through APIs, so their times include network latency and aren't really comparable with local models. The speed analysis therefore focuses mainly on open models.

4. Key findings and what they mean
Taken together, a few findings stand out:
A. Gemini is firmly in first place:
Google's Gemini lived up to its reputation, with overall accuracy of about 89%: 88% on image questions and 90% on listening questions. Unfortunately, Gemini is a commercial closed model, so ordinary developers can't use it directly or fine-tune it.

B. Open-source Qwen does very well on listening:
Qwen-2.5-Omni-7B showed surprisingly strong listening comprehension, with accuracy as high as 89.11% on listening questions, nearly matching the closed Gemini. That may suggest some open models are already quite mature at speech understanding.

C. Understanding images in Traditional Chinese is hard right now:
Open models were clearly weaker at understanding Traditional Chinese information in images, especially on questions that require reading or understanding Traditional Chinese text in a picture, where accuracy was far below closed models. This shows current open multimodal models still have a clear weakness in Traditional Chinese settings, which needs fine-tuning with Traditional Chinese data and stronger vision modules to improve.

D. End-to-end models infer faster:
On speech tasks, models that take audio directly have a clear speed advantage over those that first transcribe speech to text and then interpret it. In these tests, the end-to-end multimodal models took about half as long to finish the full set. For time-sensitive applications, that architectural advantage means faster responses and a better user experience.

5. Conclusion
Multi-TW gives Taiwan its first complete Traditional Chinese multimodal AI benchmark. For industry and academia alike, it's a good tool for understanding models' strengths and weaknesses and speeding up application development.
Next, the authors plan to:
A. Study whether Simplified Chinese models can be transferred effectively to Traditional Chinese;
B. Test more models' latency and streaming-inference scenarios;
C. Expand the dataset's task types, such as open-ended QA and generative tasks.

I'm really looking forward to what they do next!
