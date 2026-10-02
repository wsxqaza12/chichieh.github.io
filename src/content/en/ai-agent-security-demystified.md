---
original: 資安問題-改寫版
title: AI Agent Security Is Less Mysterious Than You Think
description: >-
  Don't expect an agent never to be fooled. Design the system so that when it
  is, nothing big breaks. Prompt injection, tool permissions, and the practical
  rules I use with OpenClaw.
tags: []
sourceHash: 'fe99cb202ef0'
---

When many people hear about autonomous AI agents like OpenClaw, their first reaction is: "Is it safe?"

Honestly, I think asking "is it safe?" is already a bit of the wrong question.

My current view is this: don't fantasize that AI will never be fooled. It can be fooled, just like people. What you should actually do is design the system so that "even if it's fooled, nothing big breaks right away."

OpenAI made the same point when it talked about agent security this March: the key isn't relying on filtering inputs alone, but limiting high-risk actions, protecting sensitive data and shrinking the blast radius.

---

## Where is the risk, really?

I roughly divide the risks of systems like OpenClaw into two parts.

**Part one: prompt injection.**

Put simply, when the AI reads web pages, documents or email, there may be malicious instructions hidden inside, trying to trick it into ignoring its original rules and doing something else.

The most annoying thing about this attack is that it doesn't necessarily look like hacking. Sometimes it looks like an ordinary description of a request, but it's actually steering the agent beyond its authority. OpenAI compares it to "social engineering aimed at AI," and keyword filtering won't solve it. Anthropic has also said that capabilities like browser use and computer use, which deal directly with external screens and content, are inherently high-risk areas for prompt injection.

**Part two: the permissions of skills and tools themselves.**

Put plainly, what's really dangerous isn't only what the AI "sees," but what it "can do."

If a skill has permissions that are too broad and parameters that aren't properly limited, then even if the model is only slightly influenced, it can be led into operations it shouldn't perform. Tools should be a minimal set, and each tool should have a clear permission scope: read-only, not write; only this folder; only these specific services. Not a master key.

The risk also isn't just "can it do it," but "can it send data out." Some systems look safe on the surface because the agent can't directly delete or change anything, but if it can freely call external APIs or paste data into third-party services, things can still go wrong. So besides limiting which tools exist, also limit where data can be sent and which content must never leave.

---

## So how do you defend against it?

My current approach has no fancy tricks, just a few very practical principles.

### 1. Isolate the environment

I keep agents with high autonomy, like OpenClaw, completely separate from my own machine, from the product side and from production.

The reason is physical isolation. OpenClaw reads data on its own, decides its next step on its own and calls tools on its own, so you can't put it next to your most sensitive things. When Anthropic talks about sandboxing in Claude Code, the core idea is very similar: assume the agent may run into malicious content, so confine the execution environment to a small scope first, and even if something goes wrong, don't let it spread sideways.

### 2. External content ≠ instructions

Web pages, documents, email, API responses, anything RAG pulls back: I treat all of it as "untrusted data" first, not as commands to follow.

Many people think prompt injection means "someone sneaks 'ignore the previous rules' into a web page." But in fact, any external content that enters the model's context has a chance to influence its judgment.

So the steadier approach isn't to keep guessing which sentence is poisoned. It's to accept that external data is untrustworthy to begin with, and lock down the permissions and actions that come after it.

### 3. No matter who wrote a skill, don't trust it directly

I won't install a skill just because it looks convenient, and I won't assume one is safer because I had the AI generate it myself.

The risk isn't about who the author is. It's about what the skill can touch, what it can call, whether it can send data out and whether it pulls in questionable dependencies. Whatever the source, look at its purpose, its permissions and its code first, then decide whether it goes on the allowlist.

### 4. Least privilege

It's an old idea, but it matters even more in the age of AI agents.

OpenClaw gets only the capabilities this task really needs, nothing more. Just organizing information? No write access. Just analyzing an issue? It doesn't touch production code. Just helping plan? It doesn't get to see `.env` or production keys.

And least privilege isn't just about whether a tool is on or off. The parameters need limits too. It can read the repo but can't touch the main branch directly; it can write tickets but can't deploy directly; it can search one folder but can't freely read across the whole machine. Don't just ask "does it have this key." Define exactly which doors it can open.

### 5. Don't let OpenClaw touch the product directly

This one matters a lot to me.

OpenClaw can do a lot: analysis, recommendations, planning. But in a high-risk product environment, I'd rather not let a highly autonomous agent change production code directly. If something really needs to be executed on the product side, I go through a GitHub issue or a Linear ticket, an intermediate process, rather than letting it connect directly.

The benefit is that even if the agent really is influenced by prompt injection, the worst it can do is send a bad suggestion into the process. It can't reach out and touch production or the deployment pipeline directly.

Separating "the agent that thinks" from "the system that actually has execution rights" is, I think, the most practical approach right now.

---

## Don't just guard the input. Guard the actions

A lot of people misunderstand prompt-injection defense as constantly trying to "detect which text is poisoned." But as far as I know, no one can yet reliably prove that a piece of content is 100% safe.

The more practical approach is to move the checkpoint further back. Instead of guessing whether the input is safe, look at the intent of "what it wants to do next." Does it want to touch the production repo, read secrets, send data out, deploy or delete something? Those are what should be blocked.

What you really need to guard are these actions, not just the input text itself. Public guidance from OpenAI and OWASP both stress that high-risk actions need extra confirmation, tool calls need validation, and the model itself shouldn't be treated as the last line of defense.

---

## An easily overlooked area: memory and knowledge bases can be poisoned too

This one is easy to overlook, and I have some experience with it.

If you let an agent remember things long-term, or keep feeding external content into a knowledge base, the risk is no longer just "being fooled in the moment." What's worse is "being fooled once, keeping the wrong thing, and letting it keep influencing judgment afterward."

And memory isn't only about "whether to remember." It's also about whose memory can affect whom. If memories from different users, different tasks and different workspaces aren't separated, the risk goes beyond wrong content and can turn into a mess of permission boundaries.

So memory should ideally be separated by user, by workspace and by time, and where necessary be traceable to its source, revocable and cleanable.

---

## Summary

I don't treat the LLM as a security boundary.

An LLM can help me understand, plan and suggest, but the real security boundary still has to sit in places that are more rigid, more mechanical and harder to fool: sandboxes, permission systems, tool allowlists, parameter limits, controls on data leaving, human confirmation and audit logs.

If someone asks me whether things like OpenClaw can be used safely:

Yes, but not because you trust the model a lot. Because you've seriously designed its permissions, boundaries and processes. The goal isn't "zero risk" but "controllable risk": if something gets in, it can't reach what matters most; if the agent is misled, it gets stuck before the high-risk checkpoints; and if something goes wrong, you can trace it, roll it back and fix it.
