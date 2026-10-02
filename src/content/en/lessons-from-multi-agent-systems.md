---
original: mutiagent
title: Lessons from Building Multi-Agent Systems
description: >-
  A CEO agent that relays every instruction turned into a telephone game. Why I
  flattened my agents into parallel C-level roles, and why tracing every
  decision belongs in the design from day one.
tags: []
sourceHash: 'b48ee37de144'
---

I've stepped into a few potholes building multi-agent systems over the past few months, and I want to share them.

At first I was lazy. The architecture was one CEO agent managing all the other agents, with every instruction dispatched through it. Sounds reasonable, right? Just like a real company, with one manager as the single point of contact. It turned out to be unmanageable.

The problem was how information got passed along. You hand a task to the CEO agent, it interprets it and passes it down, and the first layer has already drifted a little. When it dispatches further down, a second round of distortion appears. The CEO agent becomes a messenger, and one that "improvises." You tell it to do A, it might tell the layer below A', and by the time they interpret it, it's become B.

That's almost exactly the problem of bloated middle management at big companies 😅

The paper *Why Do Multi-Agent LLM Systems Fail?* points this out too. As conversation history accumulates, information decays as it passes through the layers, and whenever an agent hits a gap in its information, it fills it with a guess and then passes that guess on as fact. It's not that the agents aren't trying hard; the architecture itself is manufacturing error.

I've seen a lot of discussion about the single-point bottleneck of the supervisor pattern. The Claude and Devin teams even sparred publicly over "should you build multi-agent systems at all," and the core dispute was also about context not being shared effectively. The community hasn't reached consensus yet.

So I changed the architecture to a parallel C-level model. Now I manage three agents directly, a CPO, a COO and a CTO, each with its own clear area of responsibility, with no intermediate layer relaying anything. Each C-level agent can spawn at most one sub-agent to handle concrete execution, and the chain of command stops there. No more stacking layers.

I also let the agents mention each other on Discord and coordinate directly, without reporting everything to me to pass along. But I can see how they communicate and collaborate. It's not direct A2A communication, so the whole system's context stays much cleaner and more transparent. After two weeks of testing, watching them work together has been genuinely fun, and it really works.

After the change, distortion dropped noticeably.

My personal take is that when people design multi-agent systems today, their instinct is to copy the pyramid structure of human organizations, because it "feels orderly." But every LLM inference carries some uncertainty. The more layers, the faster errors accumulate, and human ways of communicating were never fully suited to agents in the first place.

With current frameworks, I think flattening is about cutting the paths along which information decays.

Keep going down this road, though, and complete flatness isn't the end point either. The more mature approach is "keep one unified entry point on the outside, and divide work in parallel on the inside." That is, users still talk to the system through one window, but that window has only one job: decide who should handle the task, then let the C-level agents execute it, without meddling in details or relaying content. My current setup on Discord looks more like this; I can share more if people are interested.

One more thing I've found very important after building all this: tracing and each agent's decision log should be designed into the system from day one, not patched in after something breaks. I learned this the hard way. When debugging, I had no idea what information an agent had based its decision on, so all I could do was guess. Now all our records go into Linear and GitHub issues.

Whenever you notice a C-level agent becoming a new bottleneck, adjust that one spot. There's no need to make the whole architecture complicated from the start.

Put plainly, "one CEO runs everything" and "completely flat with no center" are both extremes. Really stable systems usually grow somewhere in the middle, expanding outward gradually as task complexity demands. That's where my thinking is now, still iterating, and maybe next month I'll change it all again 🫠

If you're playing with multi-agent systems, I'd love to hear about your architecture, and if you've fallen into similar potholes, come commiserate below 🙏

![My multi-agent architecture before and after](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-3.webp)
![Agents coordinating on Discord](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-4.webp)
