---
original: aeb3d6733a91
title: 'Building an Interactive AI Assistant: LLMAvatarTalk'
description: >-
  How to combine speech recognition, LLMs, text-to-speech, LangChain, Audio2Face
  and Unreal Engine's MetaHuman into your own interactive AI avatar assistant.
tags:
  - llm
  - nvidia
  - avatar
  - tutorial
  - ai-avatars
sourceHash: 'd1e6a88a85c6'
---

### Introduction

I was recently invited to a competition run by NVIDIA and LangChain, where I built an interactive AI avatar assistant: LLMAvatarTalk: An Interactive AI Assistant. The project brings together advanced AI technologies so you can chat smoothly with the AI assistant you create and see lifelike facial expressions as it talks.

The project is on [GitHub](https://github.com/wsxqaza12/LLMAvatarTalk-An-Interactive-AI-Assistant), with detailed step-by-step instructions for every stage. If you're interested in the project or have suggestions, feel free to take a look, open an issue or send a PR. And if it helps you, please give it a star. Thank you!

Since this was an NVIDIA and LangChain competition, I built everything with NVIDIA and LangChain technologies, but you can integrate different technologies to suit your needs.


[![LLMAvatarTalk: An Interactive AI Assistant - DEMO](/assets/aeb3d6733a91/bfc2_hqdefault.jpg "LLMAvatarTalk: An Interactive AI Assistant - DEMO")](https://www.youtube.com/watch?v=G17fgkN3e0w)

### Features
1. **Speech recognition**: NVIDIA RIVA ASR converts the user's speech into text in real time.
2. **Language processing**: NVIDIA NIM APIs and advanced LLMs (like llama3-70b-instruct) provide deep semantic understanding and generate responses.
3. **Text-to-speech**: NVIDIA RIVA TTS turns the generated text responses into natural speech.
4. **Facial animation**: Audio2Face generates realistic facial expressions and animation from the speech output.
5. **Unreal Engine integration**: Unreal Engine's MetaHuman connects to Audio2Face in real time, making the virtual character more expressive.
6. **LangChain**: simplifies integrating NVIDIA RIVA and the NVIDIA NIM APIs, giving AI development a seamless, efficient workflow.

### Architecture


![](/assets/aeb3d6733a91/1*d1o57T9ecsAm1TMucWMV1Q.png)

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/aeb3d6733a91/1*QCQqlZr6doDP-cszzpaSpw.png)
