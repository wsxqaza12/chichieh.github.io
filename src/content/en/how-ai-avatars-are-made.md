---
original: a8e27ea274ed
title: 'AI Avatars: How Virtual Characters Are Made'
description: >-
  How AI avatars are made, from content generation to presentation, and the main
  kinds, 2D, 3D and avatars driven by real people, with the tools, techniques
  and uses for each.
tags:
  - avatar
  - ai
  - digital-twin
  - deep-learning
  - ai-avatars
sourceHash: '36ca0db431ba'
---

Avatars have long been part of our digital lives, from game characters to personalized images on social media, showing up in many forms in all kinds of places. But with the strong rise of GenAI, AI-driven avatars (AI avatars) are evolving faster than ever, getting smarter and more lifelike, and more useful for everyday needs, like FTV's AI news anchor launched last year, virtual customer-service agents and KFC's ordering robot. AI avatars are gradually becoming part of our lives.


![FTV's AI news anchor, Min-hsi (Source: FTV News)](/assets/a8e27ea274ed/1*C3tagi9CtoJNOCGIxd8aiA.png)

FTV's AI news anchor, Min-hsi (Source: FTV News)

We can expect AI avatars to improve faster and faster, but making avatars is a big field in itself. So this article explores the different types of avatars (shown below), how each is made and where they're used, in the hope of understanding the field's potential and future together.


![The types of avatars covered in this article](/assets/a8e27ea274ed/1*hqt1Bggq2TkgWtExiYr4XA.png)

The types of avatars covered in this article
### 1. Making an AI avatar

Making an AI avatar breaks down into two core parts: **content generation** and **making and presenting the avatar**. Combining the two produces an intelligent embodiment that can "understand," "respond" and "express," giving users a more lifelike interactive experience.
### **Content generation**

However detailed an avatar is, it still needs the results of **content generation** to give users a vivid, natural interactive experience. This part is driven mainly by GenAI technologies working together, including text-to-speech (TTS), large language models (LLMs) and speech recognition (ASR). These technologies give the avatar its "soul": generating natural, fluent dialogue, understanding and responding to users' spoken commands, or creating content consistent with the conversation history, so the AI avatar can truly understand people's instructions and interact with them. The figure below shows the content-generation flow for a conversational AI avatar.


![A process that starts from speech](/assets/a8e27ea274ed/1*fTX_LbR1Boxx01T15vHHgw.png)

A process that starts from speech

For the full **content generation** flow, see my earlier [article](../aeb3d6733a91/); I won't repeat it here.
### **Making and presenting the avatar**

Once we have content generation, we need an avatar to respond. The focus of this step is visual design and building behavior, which differ depending on the avatar's purpose and type. For example, a 3D virtual character in a game and a 2D animated headshot on a customer-service platform have completely different production needs and technical details. Because there are so many kinds, the rest of this article focuses on what types of avatars exist and how each is made and used.
### 2. Types of avatars

I divide avatars into 3 main categories: **2D avatars**, **3D avatars** and **avatars driven by real people**. Each type has its own characteristics and use cases. Let's look at them one by one.


![Examples of different types of avatars](/assets/a8e27ea274ed/1*nb2Uw2LCyAG46wdU5izIVA.png)

Examples of different types of avatars
### 1. 2D **avatars**

2D avatars are presented in flat form, usually with an animated look, in styles ranging from cartoon and anime to hand-drawn. Because they're relatively simple to make, they suit many settings, like livestreams, videos and brand images.


![](/assets/a8e27ea274ed/1*78FfYJkMTIrelz-i2pUaQw.png)

### (1). How they're made
1. **Draw by hand and split into layers:** use common drawing tools like **Adobe Photoshop**, **Adobe Illustrator** or **Clip Studio Paint** to draw the character and split it into layers by body part (face, eyes, mouth, arms and so on). Each part needs to be finely divided so later animation can be adjusted flexibly.
2. **Import into an animation tool and bring the character to life:** use professional tools like **Live2D Cubism**, **Adobe Character Animator** or **Spine** to import the layered images, set up a skeleton and joints, then define the character's range of motion (blinking, nodding, lip sync) and adjust how natural and smooth the movements are.

### (2). Uses
- **Livestreaming and content creation**: many VTubers stream with 2D virtual personas, attracting viewers who like an anime style.
- **Games and education**: character-based 2D images make teaching or game content friendlier, good for things like children's education.

### 2. 3D avatars

3D avatars are virtual characters built from three-dimensional models. Compared with 2D, they can show more realistic detail and movement.
### (1). Types of 3D avatars

There are many kinds of 3D avatars. The figure below classifies them by "realism" and "maturity."


![A quadrant chart of human-like 3D avatars (Source: Tencent ISUX)](/assets/a8e27ea274ed/0*JBcQODidLJnhbqBv.jpeg)

A quadrant chart of human-like 3D avatars (Source: Tencent ISUX)

They can also be classified by technical details and use cases. Here are a few common types of 3D avatars:
#### A. Low-poly and lightweight 3D models (for the web, AR and e-commerce)

These models are mainly low-poly, emphasizing small file sizes and fast rendering, suited to real-time transmission and loading in a browser. Common formats include GLTF (good for the web and WebAR), USDZ (good for iOS ARKit) and FBX (supported by some AR/VR platforms).

**Use cases:**
- **E-commerce**: virtual try-ons, 360-degree 3D product views
- **AR/VR interaction**: mobile AR games, placing virtual furniture
- **Web apps**: online 3D character displays

#### B. High-detail, film-grade 3D models (for film, sculpting and industrial design)

These models usually have finely sculpted detail, suited to scenarios that need precise rendering, like film, animation, industrial design and medical applications. Common formats include OBJ (a general 3D format), Alembic (for animated models in film and animation) and ZTL (ZBrush's sculpting format), while STL is mainly used for 3D printing.

**Use cases:**
- **Film and animation**: high-detail character modeling, VFX
- **Industrial design**: precision parts, product prototyping
- **Medical applications**: dental 3D printing, modeling from medical scans

#### C. Game and real-time rendering 3D models (for games, VTubers and the metaverse)

These models are designed for real-time rendering, balancing performance and visual quality, suited to game engines or real-time interactive applications. Common formats include FBX (common across game engines), GLTF (open-source games and WebXR) and VRM (a standard format designed for VTuber characters).

**Use cases:**
- **Game characters**: 3D characters for Unreal Engine and Unity
- **VTuber characters**: virtual streamers, characters for interactive livestreams
- **Metaverse applications**: virtual social spaces, digital twins

### (2). How they're made: the steps to building a 3D avatar
1. **Character modeling:** use **Blender**, **Maya** or **ZBrush** to build the character's basic form, designing details including body proportions, facial features and clothing. Follow good topology so the model has an animation-friendly polygon layout.
2. **Adding a skeleton and motion capture:** set up a skeleton and weight-bind it (rigging) to give the character movement controls, and use **motion capture** to record real human movements, or use [**Mixamo**](https://www.mixamo.com/) to generate movements to apply to the character.
3. **Lip sync**: lip sync can be done with AI or audio analysis. Some common methods:
● **NVIDIA Audio2Face**: based on deep learning, it automatically generates realistic mouth animation from speech, suited to high-quality AI avatars.
● **Rhubarb Lip Sync**: an open-source tool that analyzes the speech in audio and generates mouth animation, suited to games or animation.
● **Live Link Face** (for Unreal Engine): real-time face capture through iPhone ARKit to drive mouth animation.
4. **Facial animation**: use blendshapes or skeleton-driven techniques to capture and drive the character's facial expressions.
● **Faceware**: professional face-capture technology, often used for film-grade character animation.
● **iPhone ARKit**: high-precision face tracking through the TrueDepth camera.
● **DeepMotion Animate**: uses AI to infer facial animation that matches speech.

### (3). Uses

Generally, **AI avatars** mainly use **lightweight 3D models** and **game and real-time rendering 3D models**, because AI avatars need to balance computational efficiency and real-time interaction while keeping up visual quality.
- **Lightweight 3D models:** suited to virtual assistants and online customer service, ensuring low latency and smooth animation.
- **Game and real-time rendering 3D models:** better suited to VTuber streams, metaverse interactions and in-game NPCs, offering more immersion and more varied animation. For example, people have built mods that bring LLMs into the NPCs of The Elder Scrolls V: Skyrim.

### 3. **Avatars driven by real people**

These technologies combine footage of real people with AI models, letting avatars smoothly imitate a real person's lip movements and head motions, even complete facial expressions and body movements.

There are many commercial products on the market, like **HeyGen, D-ID and Synthesia**, which let users generate highly realistic avatar videos by entering text or speech. Most commercial products offer similar features and support APIs, so you can also build your product directly on their APIs.


![Avatars driven by real people: commercial products](/assets/a8e27ea274ed/1*MyNoLpdnmkH2xwGXj3jq2A.png)

Avatars driven by real people: commercial products

Commercial products integrate a great many technologies, but you can do similar things with open source too, though it takes some familiarity with how the field's technologies are categorized. Broadly they divide into **speech-driven** and **video-driven**; dividing more finely, I'd group them as follows:
### (1). AI-generated lip and facial movement
#### A. Lip sync only

These technologies focus on syncing a person's mouth shapes with speech. A typical example is **Wav2Lip**, whose core ability is seamlessly combining speech with target footage so the person's mouth movements match their pronunciation.

[Wav2Lip is open source on GitHub](https://github.com/Rudrabha/Wav2Lip?tab=readme-ov-file) and provides a [Colab notebook](https://colab.research.google.com/drive/1tZpDWXz49W6wDcTprANRGLo2D_EbD5J8?usp=sharing) you can try directly if you're interested.

**Uses**:
- Video post-production: adding natural mouth animation to silent footage.
- AI digital humans: letting AI assistants and digital anchors "talk."
- Education and language learning: letting virtual tutors teach pronunciation.

#### B. Head and facial movement

These technologies not only sync lips but also generate head movements and some changes of expression, making avatars move more realistically. Representative technologies include [**SadTalker**](https://github.com/OpenTalker/SadTalker) and the [**Thin-Plate Spline Motion Model (TPSMM)**](https://github.com/yoyo-nb/Thin-Plate-Spline-Motion-Model), both open source on GitHub. They can turn a still image into a video with synced speech and head movement.

**Uses**:
- Corporate image: companies can make marketing videos with AI avatars.
- Restoring historical photos: bringing historical figures "to life."
- AI chatbots: giving virtual assistants more lively expressions and movements.

#### C. Keypoint-based movement

These technologies drive facial movements in footage through keypoints, letting AI models imitate a real person's full expressions and head movements. Commonly used technologies include the [**First-Order-Motion Model (FOMM)**](https://github.com/AliaksandrSiarohin/first-order-model), and you can also use [**LivePortrait**](https://github.com/KwaiVGI/LivePortrait), which integrates **FOMM**.

**Uses**:
- AI animated characters: letting AI-generated characters imitate real people's expressions.
- Virtual livestreaming: virtual streamers can interact in real time through AI.
- Video restoration: helping improve motion in old or low-resolution footage.

### (2). Deepfake face swapping

Besides having AI characters move according to speech and driving footage, another class of technology is **face swapping**, which divides into **high-fidelity face swapping that requires training** and **real-time face swapping**.
#### A. High-fidelity face swapping that requires training

These technologies swap faces through deep learning, producing fine results but needing training time. Representative technologies include [**DeepFaceLab**](https://github.com/iperov/DeepFaceLab) and [**FaceFusion**](https://github.com/facefusion/facefusion); FaceFusion is a simplified version of DeepFaceLab that suits ordinary users well.

**Uses**:
- **Face swapping in video** (such as film and short-video post-production).
- **AI creative content** (such as AI art and role-play).

#### B. Real-time face swapping

Real-time face swapping lets users replace their face live during a stream or video call, used for VTuber streams, AI character interactions and more. Representative technologies include [**SimSwap**](https://github.com/neuralchen/SimSwap), [**Deep-Live-Cam**](https://github.com/hacksider/Deep-Live-Cam) and [**Roop**](https://github.com/s0md3v/roop). These use AI algorithms to turn one person's face into another's in real time while keeping the original video smooth. You've probably seen lots of people making videos like this on short-video platforms.

**Uses**:
- **Virtual streamers (VTubers)**: letting real people become anime or cartoon characters through AI.
- **Role-play on livestreams**: letting creators appear on streams in different personas.
- **AI interactive entertainment**: in games, social media or AI customer-service bots.

### Conclusion

The rise of GenAI has driven the development of AI avatars, from simple 2D to highly realistic 3D avatars, and even avatars that imitate real people's voices, expressions and movements through deep learning. These technologies are already widely used in **virtual anchors, corporate customer service, education and training, and brand marketing**, lowering the cost of involving real people and offering more flexible interactive experiences.

I'll boldly guess that AI avatars will move toward being **more real-time, more intelligent and more personalized**, with a focus on two things in particular:
1. **Multimodal fusion**: future AI avatars will combine **gestures and emotion analysis**, even understanding users' expressions and tone, for more natural interaction.
2. **Low-cost, high-fidelity technology going mainstream**: making highly realistic avatars is still relatively expensive today. As AI technology improves, ordinary users will be able to create their own AI avatars much more easily, for everyday social and business use.

### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/a8e27ea274ed/1*QCQqlZr6doDP-cszzpaSpw.png)
