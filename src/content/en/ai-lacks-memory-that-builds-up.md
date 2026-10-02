---
original: ai-記憶
title: AI Doesn't Lack a Brain. It Lacks Memory That Builds Up
description: >-
  Notes on the survey Memory in the Age of AI Agents, whose forms, functions and
  dynamics framework finally separates RAG, context engineering, LLM memory and
  agent memory.
tags: []
sourceHash: '4667de602766'
---

I've been studying memory mechanisms in AI agents lately, and I read a survey I found quite illuminating:
*Memory in the Age of AI Agents: A Survey — Forms, Functions and Dynamics* (Hu, Yuyang et al., 2025)

To me the most valuable thing about it is that it raises a question everyone has been avoiding: when we talk about "memory" today, are we even talking about the same thing?

Some people call retrieving documents memory (RAG). Some call compressing and scheduling context memory (context engineering). Others are working on long-context mechanisms inside the model. All of these matter, but their goals are completely different.

Real "agent memory" is more like a system that grows. It has to decide what's worth remembering, how to update it, what to forget and when to bring it out. That's a different thing from just stuffing data into the context window.

---

I think the paper makes three key contributions:

## 1. A three-dimensional framework: forms, functions, dynamics
It breaks "memory" from a vague concept into three dimensions you can discuss in engineering terms:

- Forms: what carries the memory, whether token-level, parametric or latent
- Functions: what the memory is for, whether factual, experiential or working
- Dynamics: how memory operates, including formation, evolution and retrieval

Honestly, the framework is quite clear. Next time I discuss memory architecture with my team, we can align on this vocabulary instead of spending half an hour every time working out what each of us means.

## 2. Cleanly separating things that are often lumped together
The paper specifically distinguishes four things often all called memory:

- Memory inside the LLM (long context, KV cache, architectural changes)
- RAG
- Context engineering
- Agent memory

This is especially useful in practice, because which approach you choose depends on which kind of "memory" problem you're solving. Mix them up and you end up hammering a screw.

## 3. A big collection of benchmarks and open-source frameworks
It gathers resources for research or products into tables, so you don't have to start from zero when choosing and comparing. For anyone trying to get into the field quickly, that's quite practical.

---

My biggest takeaway is that memory is still very early, and everyone is still feeling their way. Models handling 100K+ tokens sounds impressive, but "lost in the middle" is still a problem, and the effective context is far smaller than the number on paper.

That said, external long-term memory is already showing results in specific scenarios. On cross-session memory retrieval tasks, MemGPT raised accuracy from 32–39% to 67–93%, which is a striking gap.

The really hard parts are consistency, temporal reasoning, updating and forgetting. MemoryAgentBench shows performance collapsing badly when context grows from 6K to 32K, so the bottleneck right now is obvious.

And structured memory (knowledge graphs, GraphRAG and the like) looks like the next main battleground. Plain vector RAG can no longer handle multi-hop relations and global understanding, and work like GraphRAG, HippoRAG 2 and AriGraph is all moving toward structured indexes.

---

If you're working on AI agents too, this survey is well worth the time. At the very least it helps you align on what the word "memory" means. Have you run into memory-related pitfalls in practice? I'd love to hear in the comments 🙏

#AI #AIAgent #LLM #RAG #MemorySystems

![Overview figure from the survey](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-14.webp)
![Taxonomy figure from the survey](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-15.webp)
