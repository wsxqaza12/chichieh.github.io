---
original: f60612a0854f
title: 'The Rise of Voice AI: Machines That Listen and Talk Back'
description: >-
  Notes from a Twinkle AI podcast on speech-to-speech models, which skip text
  entirely. How speech tokens work, how models like Moshi are trained and
  interrupted, and the challenges for Traditional Chinese.
tags:
  - ai
  - speech-to-speech
  - genai
  - ailogora
sourceHash: 'c5126019e2e3'
---

I recently joined a podcast hosted by Twinkle AI and learned a lot, so I wrote up my notes for those who missed it. This article is also published on [AILogora](https://ailogora.com/card/33726fd1-aa45-4230-88e7-675196fd2547), if you'd like to discuss it there.


![](/assets/f60612a0854f/0*3629P1BRqtmBTI1M.png)

### Notes

In this conversation, host Liang-Hsun Huang invited Ethan to dig into the world of speech, especially how, after the rise of voice-cloning technology like VibeVoice, machines can truly "understand" and "respond to" human voices. Ethan has a background in mathematics and statistics, taught high school math for nine years, and became an AI engineer in 2023, now focusing on LLM applications.
### I. The limits of traditional speech pipelines and the rise of STS models

When we talk about AI voice conversations, many people picture Siri, Google Assistant or ChatGPT speaking. But most of these "talking AIs" aren't actually end-to-end speech models.

A traditional AI voice system usually has three main stages:
1. **ASR (automatic speech recognition):** turns speech into text.
2. **LLM (large language model):** understands the meaning of the text and generates a text response.
3. **TTS (text-to-speech):** turns the text into synthesized speech.



![](/assets/f60612a0854f/0*WS9ERc3qJ67uuc6V.png)


But this conversion pipeline **ignores important information carried in the voice, like emotion, timbre, rhythm and tone**.

Imagine saying, "Are you serious right now?" The tone could be surprise, doubt or anger, and those details are all hidden in the voice. A traditional speech system only sees the words "are you serious right now," with no way of hearing that you might actually be rolling your eyes XD

To solve this, a new kind of speech model started emerging last year: the **speech-to-speech (STS) model**.

The idea is simple: **skip the text step entirely and go straight from speech to speech.**

That means **STS models have a few key traits**:
- The model can directly understand both the content and the emotion of a voice.
- Its replies can carry natural tone and rhythm.
- Conversations can be interrupted, as naturally as a real chat.


In this mode, AI doesn't just understand what you say; it can hear how you say it.
### II. The core technique: tokens and why they help

The problem is that sound has always been a continuous waveform with a frightening amount of data. Take the common 24 kHz: it means the computer measures the height of the waveform 24,000 times a second, a sampling rate of 24,000 data points per second. So a 10-second recording has 24,000 × 10 = **240,000 data points**.

Feeding that much data straight into a transformer would make the computation snowball quadratically. The clever trick researchers came up with recently is to **turn continuous sound into discrete symbols, speech tokens**. These tokens preserve features like timbre and tone, so the model can be trained with a transformer architecture.

The process has roughly three steps:
1. **Speech encoding:**
2. A purpose-built encoder (like SoundStream or EnCodec) compresses continuous audio into a fixed-length set of vectors. These vectors keep key information like timbre and rhythm, with far less data.
3. **Feature distillation:**
4. The encoder usually learns by "distilling" from large speech models (like WavLM or HuBERT), so it keeps the meaning and emotional features of speech while compressing the signal.
5. **Tokenization (discretization):**
6. The compressed audio segments are mapped to a set of discrete tokens, each representing a particular speech feature. That lets speech data be treated as "the language of sound," so it can be trained and generated much like a text LLM.



![](/assets/f60612a0854f/0*piEffE2_Mvz-Uvpi.png)


This compresses a signal of 24,000 data points per second down to about 12.5 tokens per second, which not only makes STS models lighter but lets them learn sound "the way a text model thinks."

Tokenizing sound brings several clear advantages:
1. **Higher computational efficiency:** in the Moshi model, for example, a speech signal of 24,000 data points per second can be compressed to 12.5 per second, greatly lowering inference cost.
2. **Understandable by transformers:** once sound is tokenized, a transformer can understand and learn it (much like training a text LLM).
3. **Preserves the original features:** it captures and keeps the original timbre, emotion and rhythm.
4. **Low latency:** latency can drop below 200 milliseconds, so users barely notice the machine pausing to think, making the interaction feel natural.

### III. Representative models and architectures

The concept of STS models is clear, but implementation is still frontier research. Over the past two years, several key models have gradually shaped the technical landscape of the field. Commercial LLMs don't yet have native STS models, though. Ethan mentioned a few well-known STS models:
1. [Moshi](https://github.com/kyutai-labs/moshi): from kyutai labs in France
2. [LFM2audio](https://www.liquid.ai/): from Liquid AI, which just released LFM2-Audio-1.5B on October 1; see the viewpoint card below if you're interested


In an STS model, the encoder is the model's ears and mouth. Ethan also introduced a few **representative encoders:**
- [**MIMI**](https://arxiv.org/abs/2410.00037)**:** developed by kyutai labs in France in 2024, designed specifically for real-time voice interaction. Many of the newest STS models still use this encoder.
- [**SoundStream**](https://arxiv.org/abs/2107.03312) **(Google, 2021):** compresses sound using residual vector quantization.
- [**EnCodec**](https://github.com/facebookresearch/encodec) **(Meta, 2022):** has advantages in music generation.


For details on STS models and encoders, see the viewpoint card below:
### IV. How STS models run inference

Many people wonder how an STS model runs inference, and the host kindly asked for us. Ethan explained using Moshi, in four main steps:
1. **Speech input:** the user's speech is encoded by the **MIMI encoder** into **speech tokens**.
2. **LLM processing:** the speech tokens are sent into a custom **LLM** (Moshi uses the Helium model). What sets it apart from an ordinary LLM is that it can take in and emit speech tokens.
3. **Generating output:** after understanding the meaning and context, the LLM generates two kinds of tokens, **semantic tokens** and **acoustic tokens**.
4. **Speech output:** the acoustic tokens go to the **MIMI decoder**, which turns them into a real speech waveform.



![](/assets/f60612a0854f/0*9MQMc9OonNXXki3Z.png)

### V. How STS models are trained

Training an STS model is similar to text, going through two stages, **pre-training** and **supervised fine-tuning (SFT)**, with a multimodal design that combines acoustic tokens and semantic tokens.
### 1. Pre-training: understanding speech and aligning modalities

In pre-training, the model has to learn to "understand sound" and connect it to text. This usually has two parts:
- **Self-supervised speech learning (speech encoder):** using large amounts of unlabeled speech data, the model learns features of speech like content, rhythm, timbre and intonation.
- **Speech-text alignment:** using paired speech and text data, speech representations are projected into a semantic space compatible with the language model, and trained with contrastive loss or cross-modal matching so speech features and text embeddings correspond to each other.


The goal of this stage is for the model to "understand speech" and build a shared semantic foundation with the language modality.
### 2. SFT (supervised fine-tuning): adapting to dialogue and context

In fine-tuning, the model is trained with supervision on **conversations between two or more speakers**, so it learns more natural interaction and speech behavior:
- **Dialogue skills:** learning turn-taking, response strategies and context.
- **Learning interruptions:** the data includes markers for cutting in or interrupting, so the model learns to stop generating, change topics or respond quickly when interrupted.
- **Expressing timbre and emotion:** if the data is labeled with emotion or timbre, the model can learn to control its tone and pitch when generating, making conversations more expressive.


This stage mainly takes the model from "understanding speech" to "conversing and interacting."
### 3. Aligning and fusing tokens

Structurally, STS models usually adopt a multimodal fusion strategy similar to VLMs (vision-language models):
- **Acoustic tokens** come from the speech encoder and carry the rhythm, timbre and tone of the voice.
- **Semantic tokens** come from the language model and handle understanding and generating meaning.
- **Fusion:** acoustic tokens are usually fed in as a prefix and interact with language tokens through cross-attention or adapter layers, rather than simply being concatenated. That balances the weight of information across modalities and reduces interference from long sequences.


This design lets the model keep the emotional expression in speech while maintaining logic and semantic coherence at the language level.
### VI. Interruptions

Everyone was curious how interruption works, and again the host kindly asked. Interruption is achieved during **SFT on two-person dialogue**. When speaker B talks, new acoustic tokens keep coming in. In a transformer, because of length limits, **new tokens push out old ones**, forcing the model to understand what B just said and prepare a reply. Some call this mechanism an **inner monologue**.
### VII. The advantage in collecting data

Compared with collecting text or image-caption datasets, collecting SFT data for STS models is relatively easy. You just record conversations and then organize them. This not only keeps the knowledge in the conversation but also trains in the speaker's **timbre**. Training does demand quality speech data, though, with attention to **clarity** and **how standard the pronunciation is**.
### VIII. Technical challenges for Traditional Chinese

Today's mainstream STS models (like Moshi and LFM2audio above) are mostly developed by foreign labs and only support English and French, with no native Chinese support. To apply them to Traditional Chinese, Ethan proposed two approaches:
- **Approach 1 (high cost):** build a new speech encoder tailored to Chinese and redefine discrete tokens for Chinese speech. The upside is the best results and high speech fidelity; the downside is extremely high cost, requiring a huge Chinese speech corpus and compute.
- **Approach 2 (more economical):** use an existing encoder to extract the acoustic features of the voice (timbre, intonation, speed), then integrate them with an LLM that already handles Chinese reasonably well (like Gemini), in effect **"fitting ears and a mouth"** onto a Chinese LLM. It's a compromise between cost and feasibility.

### IX. Challenges, applications and ethics
### 1. Hallucination

Hallucination in STS models stems mainly from **limits on model size**. To meet low-latency requirements, STS models usually use smaller LLMs (like 1.x B or 3B; 7B counts as large), which limits the model's own abilities. For example, it may get math wrong. If SFT training is too concentrated, the model may also **overfit**, repeating trained phrases word for word in certain situations.
### 2. Recognizing emotion

**The same sentence asked with different emotions produces different acoustic tokens**, while the semantic tokens stay similar. This confirms that the model uses discrete tokens to recognize emotion. But complex tones like **irony or sarcasm** are hard to catch from sound alone and usually need meaning as well.
- **Serving specific groups:** Moshi has been used in practice to provide fully voice-operated services for **visually impaired people**.
- **Emotion recognition applications:** because it can recognize tone, it may be used in long-term care or healthcare in the future, detecting feelings like anxiety or sadness.
- **Multimodal development:** in the world of tokens, speech technology can merge with vision. For example, images can also be turned into tokens so a transformer learns speech and images together, though real-world results and use cases are still developing.

### 3. Ethics and security challenges

Finally, an audience member asked about security, and Ethan shared a few things to watch out for:
- **Voice cloning and misuse:** cloning a voice has become very easy; a model can imitate a speaker's voice directly and talk to different people. Fraud prevention will be a big problem in the future.
- **Copyright and privacy:** as with text and images, training models on real people's voices raises the problem of data being used without consent.


After this talk, I could feel the new era of AI that STS technology is bringing. Chinese support, understanding complex emotions and ethical norms still need work, but the potential applications, especially in making human-computer interaction more natural and serving specific groups, are really exciting!
