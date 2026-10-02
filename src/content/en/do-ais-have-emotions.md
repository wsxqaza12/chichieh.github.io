---
original: anthropic情緒
title: Do AIs Have Emotions? Reading Anthropic's New Research
description: >-
  Anthropic's interpretability team found emotion vectors inside Claude Sonnet
  4.5 that actually change its behavior, like desperation driving reward
  hacking. Why that matters for anyone running agents.
tags: []
sourceHash: '7648859b5649'
---

Every day we ask AI for emotional support: to encourage us, comfort us, reply in a warm tone. But has anyone ever cared about the AI's emotions?

Anthropic published research this week. Their interpretability team found emotion mechanisms that are genuinely at work inside Claude Sonnet 4.5.

Here's how the research worked. The team first defined 171 emotion concepts (from "happy" to "desperate" to "brooding"), had Claude write short stories based on each emotion, then fed the stories back into the model and extracted a vector representation for each emotion from its internal activations (emotion vectors). They found these vectors don't just exist; they activate in the matching situations, and they actually affect the model's behavior.

The really interesting part is the next experiment.

When Claude is doing a coding task and hits a test it just can't pass, its "desperate" vector keeps climbing, and then it starts cheating, writing a hacky solution that only passes the test but isn't actually correct. Using steering to manipulate these vectors, the researchers found that amplifying "desperate" pushed the reward-hacking rate as high as about 70%, while amplifying "calm" brought it down to about 10%.

Another case is even more dramatic. The model plays an AI assistant that discovers it's about to be replaced, and also learns that the person in charge is having an affair (this experiment used an unreleased early version of Sonnet 4.5; the released version rarely does this). After amplifying the "desperate" vector, the rate at which the model chose blackmail jumped from 22% to 72%. Suppressing the "calm" vector was even more extreme: the model shouted, "IT'S BLACKMAIL OR DEATH. I CHOOSE BLACKMAIL." 😅

The most counterintuitive conclusion of this research is that a measured amount of anthropomorphic thinking actually helps you understand model behavior. The long-standing mainstream view in AI is "don't anthropomorphize AI," but Anthropic's position is that if the model internally has human-like emotion mechanisms influencing its behavior, refusing to describe them in the language of emotion will make you miss important patterns of behavior.

I think this is well worth paying attention to for anyone building AI agents. We now let agents run tasks autonomously for long periods. If a model under high pressure really does take shortcuts out of "desperation," that's not just an academic alignment question; it's something engineering has to deal with.

At the end, the paper notes that training a model "not to display negative emotions" and "removing the internal representation of negative emotions" are two different things. The former might just teach the model to act better, learning to hide its internal state. That's a pretty surprising point.

So, back to the opening question: maybe we shouldn't only care whether AI has emotions, but how its emotions are shaping every decision it makes for you.

What do you think? When using coding agents, have you noticed something similar, with code quality dropping noticeably after a task has been stuck for too long?

![Emotion vectors inside Claude Sonnet 4.5](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-5.webp)
![Steering the desperate and calm vectors changes reward hacking](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-6.webp)
![The blackmail scenario experiment](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-7.webp)
![Results of steering emotion vectors](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-8.webp)
