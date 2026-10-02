---
original: 從零開始到實戰預訓練與應用心得分享
title: 'Pretraining from Scratch to Production: What I Learned'
description: >-
  Notes from Liang-Hsun Huang's DevFest Taipei 2025 talk on pretraining
  Gemma-3-270m for Traditional Chinese, from building the FineWeb-Edu-zhtw
  dataset to the learning rates that make a small model actually learn.
tags: []
sourceHash: '1ee616540f60'
---

A while ago I went to GDG DevFest Taipei 2025 and heard Liang-Hsun Huang 🧠🧪 speak on "From Scratch to Production: Lessons in Pretraining and Applications." I learned a ton, so I've written it up to share. The images come from the speaker's slides XD

If you're working on localized models or need to customize models, this talk is well worth a look.

(The full article is too long; see the link in the comments for everything.)
---------------------------------------------------------
1. Why train your own local model at all?
The speaker opened with exactly this question. With large cloud models (like Gemini or GPT) getting more powerful every day, why do companies or communities still need to train and fine-tune their own models? Mainly for three reasons:
1. Privacy: in special fields like finance or defense, policy usually doesn't allow sensitive data to be sent to the cloud.

2. Domain: if your application domain is too specialized or too local, cloud models (whose training data may come from web crawls) often give answers that "don't quite fit."

3. Cost: once usage or query volume grows, the cost of continually using cloud models becomes very expensive, and training a fine-tuned model you can deploy yourself becomes a necessary solution.

Gemini 3 is very strong, but that doesn't mean everyone's needs can be met directly. Let's follow the speaker's steps and see how to build your own local model from zero to one.

2. The example model: Gemma 3
Early this year Google released the Gemma 3 family. Gemma means "precious gem" in Greek (I didn't know that before the speaker mentioned it XD). The family is trained with the same technology as Gemini and comes in a few kinds:

• Gemma 3: takes text or vision input and outputs text.
• Gemma 3n: the n stands for multimodal.
• MedGemma: a model geared toward medicine.
• EmbeddingGemma: an embedding model.

The star of this case study is Gemma-3-270m, a text-in, text-out model that's unbelievably small; picture something on the scale of the old BERT or GPT-2. According to the official docs, it has a 128K context size and supports more than 140 languages, which makes it ideal for deployment on resource-constrained devices like phones. The specs look great, but how does a model like this actually do with Traditional Chinese?

In the speaker's tests, when you asked Gemma-3-270m something in Traditional Chinese, it often answered in Simplified Chinese by default. On top of that, with only 270M parameters, its answers were usually short and its knowledge limited. So the goal of this project was to greatly strengthen its ability to handle Traditional Chinese.

3. Building the dataset: FineWeb-Edu-zhtw
To get the model to really learn high-quality Traditional Chinese, lots of data isn't enough; how clean and how good the data is matters most. But much of the Traditional Chinese data on Hugging Face is garbage and can't be used for pretraining directly, a pain everyone who builds Traditional Chinese models knows. Recently they borrowed the approach of FineWeb and FineWeb-Edu. FineWeb is a broad, large web corpus Hugging Face assembled in recent years, covering many languages but with uneven text quality. FineWeb-Edu goes a step further and keeps only "textbook-quality" content, good enough to train a model's foundational language ability.

So to pick high-quality educational content out of FineWeb-zhtw, they set out to build a Traditional Chinese classifier that would pull the "textbook-quality content" out of a mass of web text to create the FineWeb-Edu-zhtw training set. As the figure below shows, getting there takes two stages of work.

1. Training Classifier-zhtw
They labeled the data and trained this classifier themselves, refining it all the way.

• Tools: they used embeddinggemma-300m as the base and stacked a classification head on top to build the classifier.
• Labels: working with Taiwan Mobile, and using excellent prompts contributed by the Twinkle AI community, they used Magistral-Small-2506 to score texts for educational value from 0 to 3, eventually accumulating 5 million annotations.

2. FineWeb-Edu-zhtw
Finally, they used Classifier-zhtw to filter out the first "textbook-quality" Traditional Chinese corpus: about 2 million samples and roughly 2 billion (2B) tokens of high-quality data, which is now open-source too.

With that, the dataset was ready. Next, how to do pretraining.

4. Pretraining the model
With the Traditional Chinese dataset fully prepared, the next question is how the model actually "takes in" this new knowledge.

This is the most central and most easily overlooked part of the talk: pretraining.
Many people assume that once you have data, you feed it in and the model learns. The speaker said his experience was nothing like that. Small models like Gemma-3-270m are actually very fragile. Get any one of learning rate, corpus mix or token count wrong, and the model either forgets what it already knew or simply doesn't absorb anything.

There are many pitfalls and techniques here, but the speaker kindly summarized a few key points for newcomers:

1. Chinchilla's law: small models need more tokens than you'd think. A 270M model needs about 4B tokens to effectively update its language ability.

2. Mixing ratio: to avoid catastrophic forgetting (the model forgetting what it already learned, like a kid sent to the US who comes back unable to speak Mandarin), you have to mix in a share of the original text before training. Here they used a 1:1 Chinese-to-English ratio.

3. Training details and experience: training used 8 B200 GPUs. The speaker stressed that for small models, the learning rate is key. Set it too low and the knowledge "won't stick." He suggested tuning toward the order of 10⁻⁴.

4. Training parameters for reference: see the readable version.

The trained model is named gemma-3-tw-270m. Evaluated on perplexity (PPL, lower is better), its PPL on Traditional Chinese text dropped significantly, by more than 50%, showing its Traditional Chinese ability really did improve a lot. The model is open-source as well.

5. Post-training / SFT
6. Application examples
7. Closing thoughts

For reasons of length I won't go further, but overall I thought it was a very practical talk, covering data preparation, training and applications. I highly recommend checking it out.
