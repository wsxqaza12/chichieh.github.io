---
original: yc的極簡-ai-coding-心法
title: 'Minimal AI Coding: First Principles Over Frameworks'
description: >-
  Notes from a talk by YC, an AI project engineer at MediaTek, on why heavy AI
  coding frameworks backfire, and seven minimal practices derived from first
  principles about context, code and verification.
tags: []
sourceHash: '82736012bde4'
---

I recently heard a fantastic talk by YC, an AI project engineer at MediaTek. He shared his experience and principles from using AI coding in practice, and it really resonated with me, because I've been through a lot of the same potholes he described.

This essay is my write-up of his talk, rewritten to convey his views as fully as I can.

---

## AI coding amplifies personal ability

YC opened with an important point: AI coding is an "amplifier of personal ability."

However much ability you have, AI can amplify that much. Many non-developers can now build things with AI tools they couldn't before, but from what he's seen, most of those results stay at the level of scripts and personal automation. For the software industry as a whole, we still need people with developer skills to collaborate with AI.

He summed it up in a formula:

> **Development ability = understanding, decision-making and planning × AI collaboration skill × the AI's own capability**

The first two are things you can actively improve. Understanding, deciding and planning are core skills of senior engineers; AI collaboration skill is what his talk mainly set out to teach.

Interestingly, he also said this is actually a chance for beginners to leapfrog, because some senior developers aren't used to AI coding or even resist it. If you max out your AI collaboration skill, you have a chance to overtake them on the curve.

---

## Three problems with current frameworks

YC mentioned a few popular AI coding frameworks, like GitHub's Spec-Kit and the BMAD-Method. Spec-Kit advocates a spec-driven process: document the specification first, then implement. The BMAD-Method uses multiple AI agents (an AI PM, an AI architect) to discuss and plan with each other.

After using them for a while, he summarized three criticisms:

**First, too many documents.** These frameworks often produce more documentation than you could ever read, which opens a cognitive gap between you and your project. Worse, the code moves forward while the documents don't get updated, until your sea of documents is full of outdated material and you can't tell what to keep or delete.

**Second, too top-down.** These frameworks encourage you to plan everything completely and then execute in one go, but many software engineering tasks actually need bottom-up exploration.

He gave the example of a voicebot he built. The architecture was complex, involving connections between multiple servers and real-time streaming. He started out applying the Spec-Kit approach. The team spent a lot of time writing specs, then generated the code in one go, and it didn't run. After two or three days of fixes it still didn't work, so they deleted all the code, wrote the spec in extreme detail and generated it again. Still didn't work.

After a month of this, he made a decision: abandon the framework and go bottom-up, building one component at a time and then putting them together. It was working within a day or two.

**Third, documents are less rigorous than code.** Documents are highly subjective. The same thing can be written this way or that, with a lot of ambiguity in between. Code is objective and strict: it can be executed, verified and give you error feedback immediately. Documents can't do any of that.

He stressed that this doesn't mean documents don't matter. You can't communicate well with AI without documents. But documents are supporting material; the code is the main body.

---

## You're not using a chatbot. You're using an AI agent

YC pointed out a concept many people mix up: why does writing code by chatting with ChatGPT work poorly, while AI coding tools like Cursor and Copilot work so much better?

The answer is that AI coding is, at heart, developing in collaboration with a coding agent, not chatting with a chatbot.

A chatbot only answers the question in front of it, but an AI agent has a few key traits:

- **High autonomy**: it can carry out all kinds of tasks around your question, not just answer it
- **Tool use**: it can call external tools, search the web, search files and run terminal commands
- **Task decomposition**: it breaks complex tasks into smaller ones to solve
- **The ReAct loop**: reasoning → acting → observing, looping and trying until the problem is solved

That's why with a chatbot you have to design your prompts carefully, but with an AI agent you can get tasks done casually, as if you were chatting.

He also compared agents with RAG. RAG does similarity search and matching, while an agent thinks like a person, uses tools and completes tasks. The industry mainstream is also moving from matching mechanisms toward agent systems.

---

## Deriving AI coding principles from first principles

Next came the core of the talk. YC cited Andrej Karpathy's concept of context engineering: a language model has a fixed short-term memory (the context window), and our job is to put high-quality information into that limited space. That's all.

Drawing on his background in physics, he argued for building the whole AI coding methodology on first principles, facts that won't change over the long term:

**Principle 1: AI coding means writing code in collaboration with an AI agent, and the key is doing context engineering well.**

**Principle 2: Only code and deployment can produce a service. Documents can't create value directly.**

**Principle 3: The more verifiable things a project contains, the healthier it is. Verification is best automated; if not, at least make it verifiable by people.**

From these three principles, he derived seven best practices.

---

## Seven minimal AI coding best practices

### 1. Don't let yourself fall out of understanding

You're responsible for the whole project, so you must understand what the AI agent is doing. Don't focus only on results and ignore the process. Masses of documents and irrelevant code both pull you away from understanding.

A good approach: have the AI write summaries for you and do Q&A with it, to make sure you understand the state of the project. Then write that understanding concisely into a small number of high-quality documents.

### 2. Give direction, but don't micromanage

Both extremes are bad. Too abstract ("build me an online shop that sells wine") and the AI doesn't know what you want. Too specific ("add a conditional on line such-and-such") and you might as well write it yourself.

A good approach: before executing, sketch a simple spec with BDD or an architecture diagram so the AI knows what you want to do. Then discuss it with the AI over several rounds as you go. One technique YC likes is to end an instruction with "ask me about anything you don't understand," letting the AI keep asking questions until you're in sync, and only then start implementing.

In his words: "Sync first, then lead. Collaborating with AI is really an exercise in leadership."

### 3. Reduce interference for the AI agent

Too many documents, unstructured code, duplicated code, outdated documents: all of these confuse an AI agent, which no longer knows whom to listen to.

A good approach is to keep documents and code consistent. Move outdated documents into a deprecated folder so the AI agent doesn't come across them easily. Keep only what's useful right now.

### 4. Avoid making the AI agent understand the whole codebase

If you ask a question and the AI agent has to read every file in the project to answer it, your architecture has a problem. A good architecture lets the AI agent start working by understanding just one part.

There are three concrete angles:

- **Documentation**: write docstrings and comments at the top of the code, so the AI can tell what follows from the beginning
- **Architecture**: modular design, the single-responsibility principle, clean architecture
- **Naming**: give files and variables meaningful names (with AI helping, naming isn't painful anymore)

### 5. Increase the coding agent's autonomy

Let the AI agent run programs directly in an executable working environment. If a program can't return information immediately, dump the logs for the AI to process next.

Most important is using TDD (test-driven development) so tests become automatic feedback for the AI agent.

The TDD loop is:
- Red (write the unit test first; the main code isn't written yet, so it must fail)
- Green (implement the main code so the test passes)
- Refactor (restructure the code while keeping the tests passing)

YC's approach is to reach agreement with the AI and then simply say "please implement this with TDD." The AI runs the loop on its own, and the code it produces is very solid.

### 6. Increase the frequency of human-in-the-loop

Don't do too much at once. Make small atomic changes each time, review after each small feature is done, and continue only if it's fine. Use Git to save each checkpoint, like saving your game after finishing a quest, so if something breaks you can just reverse back.

### 7. Use templates to standardize how things are written

He gave the example of making his own slides. He documented what he wanted to say, used a storyboard template to have the AI fill in the content of each slide according to the template, and then converted it automatically into the final presentation.

He even thought presentation clickers were too expensive, so on a whim he used AI coding to spend one evening building a phone app that works as a clicker: it can change slides, jump to a slide, show the slide on screen and has a timer. Work that might once have taken a week was done in one night.

---

## The essence of the approach

YC's final summary: AI coding is writing code in collaboration with an AI agent, and the key is context engineering, getting good structure and data to appear where the AI can see them.

Some existing frameworks have drifted away from first principles, producing too many documents and badly polluting the context. Rather than memorizing a pile of framework procedures, understand the "why" behind them and apply it flexibly.

To close in his words: "At this point, having no fixed moves beats having moves. The best method is your ability to adapt, and to grow along with AI technology."

---

*This essay is a write-up based on a talk by YC (AI project engineer at MediaTek). Thanks to YC for permission to use the transcript.*
