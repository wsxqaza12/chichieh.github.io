---
original: 商周
title: 'Interviewed by Business Weekly: Why OpenClaw'
description: >-
  A Business Weekly interview made me sort out my thinking again, on why I chose
  OpenClaw, AI as buying back time, the pressure on SaaS, the widening
  productivity gap and why we build AILogora.
tags: []
sourceHash: '46a9a2133185'
---

A while ago at an event, a reporter from *Business Weekly* unexpectedly came over and interviewed me. I never expected the chance, so it was a lovely surprise.

We covered a lot. I'd written about some of the questions before, but being asked face to face made me sort out my thinking again. Here are a few that resonated with me most.

## Why OpenClaw?
I covered this in my earlier essay on the difference between OpenClaw and Claude Code. The core difference is in framework-level design. Simply put, Claude Code gives you a very powerful engine, but you have to build the car yourself; OpenClaw is a car you can drive off the lot, with memory, scheduling and messaging integrations already defined. I choose tools in a pretty goal-driven way: if it solves my problem right now, I use it.

To be fair, though, Claude Code has filled in a lot over the past few months. Channels can connect Claude Code to Telegram and Discord, Dispatch lets you trigger tasks remotely from your phone, and Cowork lets non-engineers use a desktop agent to get things done. In April Anthropic also launched Managed Agents, which manages the sandbox, state persistence and error recovery for you, so developers no longer have to stand up their own runtime.

To some extent, these updates respond to the needs OpenClaw validated: agents can't live only in a terminal; they need to connect to messaging, run persistently and be usable by ordinary people. I tried Claude Code Channels earlier, and honestly the experience back then felt more like a toy: you could only open one session at a time, with little flexibility when dividing work among multiple agents. But since Managed Agents came out, the overall maturity has gone up a lot.

There are also more and more agent frameworks now. Nous Research's Hermes Agent, for example, focuses on long-term learning and persistent memory; it extracts reusable skills from each task, which is conceptually a bit like OpenClaw's skill system but from a different angle. There are far more choices than when I started raising my lobster.

But my reason for choosing OpenClaw back then was simple: at that point it already had the skeleton assembled, and I didn't have to wait for the big companies to slowly fill in features. OpenClaw is also model-agnostic. Claude, GPT and Gemini all plug in, so you aren't locked into a single ecosystem, and that flexibility matters a lot to me. Looking back now, someone starting today really does have more options. But as I said in my essay on frameworks going out of date while the concepts don't, the point isn't which tool you use. It's that you learn to think in terms of agent orchestration along the way.

If you want more on framework-level differences, see my OpenClaw framework series; I won't go into it here.

## The ROI of AI is buying back time
The reporter asked how I calculate ROI, and I really have calculated it. Convert your opportunity cost per hour, then look at how much you spend on tokens each day. My conclusion: I spend less than ten US dollars a day and save more than two hours.

But what I feel even more is something else: after handing chores off to agents, my head got clearer. I can focus on strategy and product direction without being constantly interrupted by small stuff. I wrote about this in my essay on buying back time with OpenClaw: Dan Martell's "replacement ladder" says to hand off the chores that drain you most first. That logic holds completely for AI agents; the only difference is that you're handing off to a lobster instead of a person, at a fraction of the cost.

## The structure of SaaS is changing
This was the part of the interview where I talked the most.

In the past, if a SaaS had steady users and stickiness, its valuation held up. But now something new is happening: you can have an agent build you a system, with the data in your hands, control in your hands, and no monthly subscription.

I don't think SaaS will disappear right away, but structural pressure is definitely building, especially for simpler tool-type SaaS, where the pressure will arrive sooner. Of course, some SaaS relies on network effects and data moats and won't be replaced in the short term, but for pure-feature tools, the competitive landscape really is shifting.

## The productivity gap is already widening
I've met a lot of industries and companies at different stages recently. Some have fully adopted AI agents, and you can clearly feel their productivity has multiplied several times over. On the other side, some companies are still in a tug-of-war internally: management wants to adopt, but people below are resisting. That "top wants to push, bottom doesn't want to move" situation is extremely common right now.

It's not just my impression. Plenty of industry reports reach similar conclusions: a few fast-moving companies capture most of the AI dividend, while most are still stuck in pilots. To be honest, though, AI isn't a cure-all. I've seen some senior engineers actually get slower with AI tools, because they spend too much time debugging the code AI produces.

My sense is that it's a bit like digital transformation back in the day. You don't have to go all in now, but if you don't move at all, the gap will only become more obvious. The key isn't which AI tools you buy, but whether you've redesigned your workflows around them.

## Small teams + agents: a window of opportunity
I told the reporter that in the next year or two, small companies with agent capabilities may be able to do what used to require large teams. That's not just my observation. Sam Altman has talked publicly about betting with other tech CEOs on "when the first one-person unicorn will appear," and recent YC startups are clearly concentrating on tiny teams that are AI-native.

When agents can handle development, content, data analysis and first-pass customer support, a five-person team's output really can approach what used to take twenty people.

But I won't overstate it. The management complexity after scaling, high-risk decisions that need human judgment, and customer trust are things AI can't fully take over yet. For startups, it's a window worth grabbing, but it doesn't mean you can skip all the potholes you're supposed to step in.

## Why AILogora
Finally the reporter asked about this, and I shared our team's vision: we believe valuable knowledge should be properly kept and allowed to settle.

Two years ago I started writing technical articles on Medium and often got private messages with questions. But answering one-on-one only ever helps one person. Very often everyone runs into the same potholes, and if those experiences don't have a good home, they end up scattered across chat logs.

That's why we've spent the past year building AILogora. Andrej Karpathy recently proposed the idea of an "LLM Wiki," having an LLM "compile" personal material into a knowledge base that keeps growing, which resonates a lot with how we've been thinking all along. But Karpathy is solving an individual pain point, and we want to fill in the knowledge base at the community level: when dozens of people contribute on the same topic, each bringing different hands-on experience, the system lets an LLM cross-check and integrate them.

We want the potholes and lessons people have lived through to stop being one-way Q&A and become something genuinely compiled into a shared engineering asset.

---

Many thanks to Pei-shan and Mei-hsin at *Business Weekly* for getting my photo into a magazine XD.
Being asked these questions helped me sort out a lot of my own thinking.

If you're also thinking about bringing AI agents into your workflow, my earlier essays on buying back time with OpenClaw and the OpenClaw framework series might be useful references. Feel free to comment and chat 🙌

![The Business Weekly feature](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%B4%BB%E5%8B%95/images/image-7.webp)
