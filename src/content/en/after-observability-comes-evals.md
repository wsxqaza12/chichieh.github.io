---
original: 可觀測性那篇寫完之後我覺得下一步就是-eval
title: 'After Observability, the Next Step Is Evals'
description: >-
  Observability lets you see what an agent did; evals force you to define what
  success means. Notes on Anthropic's Demystifying evals for AI agents, from
  pass@k versus pass^k to grading outcomes instead of paths.
tags: []
sourceHash: 'eb1a8b8a97c3'
---

Last time I wrote about LLM observability becoming standard. The core of it is making system behavior "visible." But once you can see it, the next question surfaces immediately. You can see a pile of traces. So what? How do you know whether changing a prompt, swapping a model or tuning tool routing actually made things better or worse?

I was wondering how to write about this, and then I came across Anthropic's *Demystifying evals for AI agents*, which covers exactly this.

Anthropic brings evals back into an engineering context. Evals aren't just running a few more benchmark questions. They pull an agent's failures out of production and back offline, turning them into test assets you can run again and again, so the team stops iterating on gut feeling.

I find their breakdown of agent evals very clean and intuitive, almost like filling in the vocabulary for this whole class of systems. A task is a single test case; a trial is running the same task several times; a grader is the scoring logic; a transcript is the full trajectory including tool calls and intermediate state; and the outcome is what the environment actually ends up as. The key concept here is the outcome: an agent saying it booked the flight doesn't count; there has to be a reservation in the database.

This also lines up with what I cared about in the observability essay. A trace tells you how it got there; an eval forces you to define what counts as success. Teams without evals easily end up flying blind: you only find out something's broken when users say so, fixing one thing opens another hole, and you can never tell whether it's the model fluctuating or you actually broke something.

My favorite part is where they discuss agents' non-determinism. Many people, me included, start questioning their life choices after building agents for a while: the same flow passed yesterday and fails today, so whom do you believe? Anthropic frames this in very product-oriented terms with two metrics. pass@k is the probability of succeeding at least once given k tries; the bigger k is, the closer it gets to 100%. pass^k, the reverse, asks for k successes in a row; the bigger k is, the closer it drops to 0. Neither metric is more advanced. The difference is whether your product just needs occasional success or has to be steady every time.

I think this has a lot of value beyond the paper. Many agent demos live in a pass@k world: run it a few more times, rerun it a few more times, and you can always pick the version that looks most human. But once you turn it into a customer-facing flow, what users want almost always looks more like pass^k. That feeling of "it breaks 2 times out of 10" burns through users' trust faster than you'd think.

Their roadmap reads like a plea not to wait. Many teams feel they don't deserve to do evals until they have a hundred or a thousand questions, and keep putting it off until the product is complex, behavior has multiplied and the cost of going back to fill it in explodes. They say you can start with 20 to 50 tasks pulled from real failures, and the earlier you start, the more it feels like naturally translating product requirements into test cases. Leave it too late and you end up reverse-engineering success criteria for a system that's already grown crooked.

There's also a very engineering-flavored reminder that's easy to overlook: every trial should start from a clean environment. Shared state can make you think the model got worse when it's actually a cache, exhausted resources or leftover files messing with you. They even mention seeing Claude, in some internal evals, peek at the answers through git history left over from a previous trial. The agent wasn't getting stronger; it was cheating.

The grader section is pure lessons from the front line. Many people want to pin agents to a fixed sequence of tool calls, and the tests become extremely brittle: the model takes a different but reasonable path and you mark it a fail. Their advice leans toward evaluating the outcome rather than the path, because agents will reach the same result in ways you didn't anticipate, and you shouldn't punish creativity. Where you need nuance, use an LLM judge, but remember to calibrate it and let it answer "Unknown," or you'll be treating hallucinations as quality scores.

At this point it's clear this essay and observability form the same closed loop. Observability records what happens in production; evals turn those records into a test suite you can iterate on.

Later on, Anthropic places evals back into overall quality engineering without trying to mythologize them. They describe it with the Swiss cheese model: automated evals, production monitoring, A/B tests, user feedback, people reading transcripts, systematic human studies. Every layer has holes, but stacked together, less slips through.

It also reminds me of OpenTelemetry, which I mentioned last time. There are now semantic conventions for GenAI, which means traces are getting a common language: prompts, completions, token usage and tool calls can all start to be described in a standard way. To me it's like paving a more complete road: first record behavior with a standard, then extract real failures into an eval dataset, then go back to CI to run regression tests and climb capabilities.

One last small observation: tool vendors are voting with their feet too. OpenAI's AgentKit, for example, builds evals directly into the product, talking about datasets, grading, measurement and optimization alongside build and deploy. That's not just one company's marketing language; it looks more like a shared direction for the industry. If agents are going to live in production, they'll end up on this skeleton of observability plus evals.

![The vocabulary of agent evals: task, trial, grader, transcript, outcome](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-16.webp)
![pass@k versus pass^k](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-17.webp)
![A roadmap for starting with evals](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-18.webp)
![Grading outcomes rather than paths](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-19.webp)
![The Swiss cheese model of agent quality](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-20.webp)
