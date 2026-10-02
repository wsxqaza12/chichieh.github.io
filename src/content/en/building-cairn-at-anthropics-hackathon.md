---
original: antropic-hackathon
title: 'Anthropic''s Global Hackathon: Building Cairn Solo in Six Days'
description: >-
  Five hundred people were picked from over twenty thousand for Anthropic's
  global hackathon. Six days, one person, and Cairn, a community knowledge map
  tended by an agent called Moss.
tags: []
sourceHash: 'bbeeb57c7926'
---

I just finished Anthropic's global hackathon. Five hundred people were selected from over twenty thousand, an acceptance rate of about 2.4%. The deadline was 8 a.m. Taiwan time. I barely slept the day before and worked right up to the last moment before hitting submit.

During this stretch I practically vanished from the internet and didn't even look at my phone, which accidentally cured my internet addiction 🤣 Apologies to the friends I left on read. But honestly, it was precisely the extreme environment of a hackathon that let me set aside the everyday busywork of running AILogora and throw myself into this problem. On a normal day, I wouldn't have been able to do it.

Over nearly six days, by myself, I built something called Cairn.

Along the way I sometimes couldn't help wondering what I could do better with a few more days. But that's the nature of a hackathon.

What really struck me was how much my thinking about the same problem had matured. I've been thinking about this problem for the past year, and the time pressure forced me to sharpen the story.

For the first day or two I barely wrote any code. I spent most of the time figuring out one thing: what exactly did I want to show people?

The problem Cairn solves fits in one sentence: community knowledge is dying.

Over a year and a bit at AILogora, I sent out 365 surveys and did 32 one-on-one interviews, and in almost every one I heard the same complaint: I remember seeing a great answer to that, but I can't find it now. Scroll ten messages down in Discord and it's gone. Messenger groups can't be searched anymore. The notes the experts write in their own Notion, nobody else can see. Great answers get washed away, one after another.

Cairn is a community knowledge map for the AI era, a community version of Andrej Karpathy's LLM wiki. The design philosophy is "people leave real experience; agents organize, connect and maintain it." Because AI can organize knowledge, but it can't fabricate real experience from the trenches.

I built a custodian agent for it called Moss, which serves as the manager agent for the whole system (implemented with Claude Managed Agents). In each maintenance cycle, Moss decides on its own what tasks to dispatch to its subagents (reviewing stale content, finding knowledge gaps, drafting summaries), then makes the global judgments itself.

That's also why Moss's brain had to be Claude Opus 4.7: it needs judgment across the whole system. It doesn't produce knowledge; it only organizes it.

Speaking of Opus 4.7, I have to say it's a big step up from 4.6. The organizers gave us $500 in API credit, which I burned through in no time, and then I paid another $600 to $700 out of pocket to keep running Opus 4.7 😭 The jump in stability, efficiency and precision on long context is very clear.

The moment that stuck with me most: Moss's brain is a mounted file system, and its MEMORY.md has a budget of only 2,200 characters. On every tick she has to decide for herself what to keep, what to merge and what to drop. In one real run, a community moderator rejected one of her drafts with a single line: "Too much like copy-pasting the docs, no synthesis."

Without being told to, Moss not only opened a "Rules I've learned" section herself and stored that rejection, abstracted into a rule, in her memory. Later in the process, she even proactively canceled another proposal that made the same mistake. None of this involved fine-tuning or rewriting the prompt. She was simply reading a Markdown file and reasoning.

That was the moment I knew the deep collaboration I'd imagined, "people make the judgment calls, agents reflect and correct themselves," can really be done.

To turn these days of work into a demo video, I also picked up Remotion and Hyperframe along the way.

I'm a goal-driven person. Without a clear deadline bearing down, I'd almost never touch tools like these. Forcing myself to learn them this time made me feel how fast technology is moving; so many amazing things haven't been seen by most people yet.

Finally, what surprised me most about this hackathon was the community. @ClaudeDevs, @claudeai and @cerebral_valley did a really solid job building the atmosphere for participants. We were invited into a participants-only channel in the official Claude Discord to talk with developers from all over the world, who pitched all kinds of creative ideas for solving pain points in everyday life. It really impressed me, and I learned a lot from how differently people think about problems.

The organizers put together a packed schedule every day. Besides daily office hours with Anthropic staff where you could ask questions, they invited different guests to speak, including engineers from inside Claude, and the winner of the previous Opus 4.6 hackathon came on as a mentor for the whole run (that winner is now at YC, and seeing that trajectory was really inspiring). For me it was a rare chance to feel firsthand how these top engineers think.

All in all, these nearly six days of extreme development were painful, but getting to build something I'd been thinking about for a year, and to talk with such a great community, was a real thrill.

The demo video and repo are below. If you run a community, think about knowledge management or play with agents, come talk 🙌

#BuiltWithClaude #ClaudeCode #Hackathon #Anthropic #AILogora

Demo: https://youtu.be/n_OpVfxD7EA
Repo: https://github.com/wsxqaza12/cairn-wiki

![Cairn, built at Anthropic's global hackathon](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%B4%BB%E5%8B%95/images/image-4.webp)
![Moss, Cairn's custodian agent](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%B4%BB%E5%8B%95/images/image-5.webp)
![The Cairn demo](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%B4%BB%E5%8B%95/images/image-6.webp)
