---
original: memory4
title: 'How Agent Memory Forms, Updates and Fades'
description: >-
  Memory isn't a static snapshot. It has a lifecycle of formation, evolution and
  retrieval, with consolidation, updating and forgetting in between. The season
  one finale of my Agent Memory series.
tags: []
sourceHash: '3682a3d4a7a7'
---

Across the first three essays, we've worked through three core questions.

The first essay defined what actually counts as agent memory. The second broke down what memory looks like: token-level, parametric or latent. The third asked what an agent uses memory for, which brought in factual, experiential and working memory.

But so far, we've mostly been quietly treating memory as a static snapshot: "the user doesn't eat beef," "production uses PostgreSQL," "check backward compatibility before a database migration." As if once memory is written, it just sits there and behaves.

The real world is obviously not that simple.

Say last year you told an agent you live in Taipei. This year you move to Tokyo and tell it you live in Tokyo now. What is the memory "lives in Taipei" now? Wrong information, or a historical record? Should it be deleted, or kept and marked as expired?

Here's a messier example. The agent's first deploy breaks, and it learns to check backward compatibility before a migration. Later it steps into five more potholes of different kinds. Should all five experiences be kept, or slowly organized into one more complete migration strategy? If that strategy is validated a hundred times, should it one day be internalized as a skill, or even written straight into the model's parameters?

This is where, to me, memory really starts to get interesting. **The first three essays looked at memory's static categories. Starting with the fourth, we look at memory's metabolism.**

Memory has its own lifecycle, which *Memory in the Age of AI Agents* calls dynamics. If form and function answer what memory is right now, dynamics asks what happens to memory next.

The survey splits dynamics into three big stages: formation, evolution and retrieval. Evolution in turn includes consolidation, updating and forgetting.

![The memory lifecycle: formation, evolution and retrieval](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-5.webp)

From the moment a piece of information appears, it faces one decision after another: should it become memory, how does it get along with existing memories, should it be merged or retired, and finally, when should it be brought out and used?

As the season one finale, this essay looks at how a memory actually comes alive.

---

## 1. Formation: not everything that happens is worth remembering

Let's start with step one.

You work with an agent all day. Along the way you might produce 300 lines of conversation, 50 tool calls, 12 errors, 3 revisions, 2 decisions, plus one genuinely painful lesson.

Is all of that memory?

Not really. There's a key distinction here: what happened is only raw experience. It has to go through formation to become an actual memory unit.

For example, the agent runs a migration directly and production throws errors. An engineer rolls it back, finds people are still using the old API, and finally reminds the agent to check backward compatibility. That whole sequence is just a work log. What gets extracted at the end, "check backward compatibility before a migration," might be a memory that shapes future behavior.

So what memory formation really does is decide, out of a pile of things that happened, what deserves to become memory and what shape it should take when it's kept. Just saving the logs isn't enough.

The survey collects many formation methods. Semantic summarization compresses a long conversation into a concise summary. Knowledge distillation extracts the truly useful experience from a full execution trajectory. Structured construction organizes raw information into facts, graphs, entities or relations. Going further into the model, memory can also form as a latent representation, or even be internalized into the parameters through training.

### When is something actually worth remembering?

The intuitive move is to write a rule: at the end of every session, have the LLM summarize.

That works, of course, but it has an obvious problem. If the user casually says they've been thinking about learning Japanese, and you immediately record "user is learning Japanese," that may be remembering too fast. Three days later they may have forgotten about it themselves.

A very intuitive fix is to "wait a bit." Instead of running expensive memory integration on every interaction right away, let new information enter a lighter layer of memory first. Only when similar things keep recurring does the system conclude this doesn't look accidental and is worth the cost of organizing properly, and only then call the LLM to extract episodic or semantic memory.

**RecMem**, at ACL this year, takes exactly this approach. In their experiments, this recurrence-based consolidation cut the token cost of memory construction by up to 87% compared with several state-of-the-art memory systems, while maintaining or even improving accuracy.

One thing to note: the "consolidation" in the RecMem paper is closer to deferring formal memory extraction and organization. It doesn't use the term in quite the same way as the survey's taxonomy, which places consolidation under memory evolution.

I like this approach a lot because it resembles how people work. If a friend says one day that they've been into Americanos lately, you don't necessarily carve that into your brain. But if they order an Americano every time you meet, you start to think it really is a stable preference.

So the first thing a mature memory system needs may not be a save button but a memory admission policy. The question isn't whether something happened. It's whether it has earned the right to influence the future.

---

## 2. Evolution: the trouble starts after a new memory arrives

Say a piece of information has passed formation and we've got the memory "the user lives in Taipei." Six months later, "the user moved to Tokyo" arrives. The dumbest system might keep both.

The next time you ask the agent to find a restaurant nearby, it runs a vector search, both Taipei and Tokyo come back with high similarity, and it hands you restaurants in both cities.

At that point the problem isn't whether retrieval is good. It's that your memory was never maintained. That's exactly what memory evolution handles.

The research divides evolution roughly into three operations:
* **Consolidation**: organizing scattered, duplicate memories
* **Updating**: revising an old understanding when new evidence arrives
* **Forgetting**: letting memories that are no longer valuable or valid leave active memory

All three answer the same core question: when new experience arrives, should what I believed change along with it?

### 2-1. Consolidation: five potholes don't need five logs

Take consolidation. Say an agent ran five migrations over six months and hit a different pothole each time: it forgot to check the old API, forgot to prepare a rollback, didn't check the mobile client, a downstream service hadn't been updated yet, or a table schema change wasn't backward compatible.

The simplest system can store five cases. That's not wrong, but if the agent has to read five incident reports every time this situation comes up, it gets exhausting. So memory might gradually consolidate into a migration strategy: check clients, verify backward compatibility, prepare a rollback, then run it.

That's the move from case to strategy we discussed in the third essay. From the dynamics angle, what we care about now is when many cases should be merged into one strategy.

Another ACL 2026 survey this year, *From Storage to Experience*, describes the evolution of agent memory in three stages: storage, reflection and experience. The earliest approaches just stored trajectories; then came reflecting on and organizing those trajectories; and finally, abstracting reusable experience across many trajectories.

In other words, memory is no longer evolving toward storing more. People are trying to keep less, but more useful, from a large volume of experience. That ties directly into the experiential memory thread from the last essay. Memory might start as a record of what happened on August 3, slowly become a question of why this kind of thing usually fails, and end up as a summary of what to do next time. That's much closer to what we mean by memory turning into learning.

### 2-2. Updating: a new fact can invalidate an old one

Next is updating, which may be where memory systems most often go badly wrong today.

Take Taipei and Tokyo again. People naturally understand that Taipei was before and Tokyo is now. But to a system that just runs vector search, "user lives in Taipei" and "user lives in Tokyo" have very similar semantic structure, and retrieval may well pull up both the old and new states together.

We often assume that if we feed an agent new data, it will naturally overwrite the old. In practice, agents run into implicit conflicts all the time. The user doesn't explicitly say "I don't live in Taipei anymore"; they just mention "there's a great place near my new home in Tokyo." A person can easily infer their living situation has changed, but a memory system often doesn't realize it should proactively update the old state.

Recent work like **STALE**, which turns implicit conflict into a benchmark for testing agents, and **Supersede**, which goes further and turns the supersession gap into a trainable environment, all point at the same memory-update gap. The agent has seen, and even understood, the new fact, but still doesn't correctly retire the old value in its self-maintained memory. The research also finds that simply giving it a bigger memory budget doesn't solve this automatically, because the point isn't whether it remembers enough. It's whether memory evolves correctly.

So a more mature design might not simply delete Taipei and replace it with Tokyo, but keep the history. That's why more and more people are discussing temporal validity, or bi-temporal memory. The old fact doesn't necessarily disappear; it's still something that happened. It just no longer has the right to represent the current state.

This distinction matters a lot. "The user used to live in Taipei" is still true. "The user lives in Taipei now" is false. Memory no longer manages just true or false; it also has to capture when something was true. Recent preprints this year, like MemStrata and Engram, try to handle stale facts like this through temporal validity or bi-temporal representations, instead of pinning all their hopes on similarity search.

### 2-3. Forgetting: not a bug, maybe a feature

It may sound counterintuitive, but a mature memory system has to learn to forget.

People in AI tend to think: we finally got it to remember, why delete anything? But imagine an agent that's worked with you for ten years and has permanently kept the email you used eight years ago, your company address from six years ago, project rules retired three years ago, and two thousand duplicate experiences. That's often scarier than amnesia. An agent with amnesia says it doesn't know, and you stay on guard. An agent holding expired memory will very confidently give you an answer that used to be right. That's usually more dangerous.

In the survey, forgetting can be driven by roughly three signals: **time, frequency of use and importance**. Memories unused for a long time can gradually decay; low-frequency information can be down-weighted or retired; and low-importance, low-value memories can be actively pruned.

More importantly, forgetting doesn't necessarily mean actually deleting the data. In practice it might mean down-weighting, dropping out of normal retrieval, moving to cold storage, or being marked inactive. The supersession mentioned earlier is closer to updating, and compressing many cases into a strategy is closer to consolidation.

So I like to think of forgetting as losing the right to influence future decisions.

Since memory capacity, energy and security all cost something, an agent can't hoard experience forever. When designing a system, we should actively decide whether a memory stays based on factors like its value, potential harm and size. In other words, forgetting low-value or harmful memories can actually make an agent perform and decide better. That's the core idea of the recent paper **Forget to Improve**, in the setting of on-device agents.

Following this logic, future forgetting policies won't just hard-code a rule like "delete after 30 days unused." They'll evaluate the future value of each memory directly. We'll need to score memory value across factors like goal relevance, task utility, reliability and usage history (as a recent preprint, *Learning What to Remember*, attempts). This will matter more and more, because as memory grows, the truly scarce resource isn't disk space. It's the agent's attention.

### 2-4. When should memory be internalized?

This connects to a question a reader asked in the comments on the last essay.

They compared the path from token-level to parametric to latent with an employee becoming more senior. A new hire starts by following the SOP; over time they internalize it into their own way of working; and when they're very senior, some of their judgment has become intuition that's hard to write down as rules. The analogy isn't perfectly precise, but it does point at a core question: when is a memory worth internalizing?

So I don't think of token → parametric → latent as beginner to advanced, or as a fixed ladder of internalization. **I think the three forms each make different trade-offs in visibility, editability, durability and the cost of taking something back.**

Gradually learning a repeatedly validated piece of explicit experience into the parameters is one possible internalization path, not a direction every memory must eventually take. **TMEM** this year implements exactly that kind of mechanism. It keeps explicit memory while writing supervision signals distilled from experience into fast weights through online LoRA updates, genuinely changing the subsequent policy.

Even more fittingly, **COVE**, which came out this August, frames the question directly as "what to remember and what to internalize." It keeps volatile information like tool names and APIs in quickly editable external memory, hands only the more stable, generalizable reasoning patterns to parameter updates, and once it confirms the model has internalized something, it even releases the original external memory. That's the same trade-off of stability, editability and cost of retraction discussed above.

![What to keep explicit and what to internalize](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-6.webp)

As for what's suitable for internalization, first look at whether it's stable enough. A company rule that everything must stay backward compatible is relatively stable; an instruction like "don't deploy this week" obviously isn't. Second, has it been validated repeatedly? An experience that happened once might be a fluke; a pattern that works across many tasks looks more like a real rule. Generalization matters too: "the user has a meeting at 3 p.m. tomorrow" is too specific, but "check dependencies before changing an API" can be reused across tasks.

And if mistakes are costly, the thing changes easily, and it needs to be audited, it's probably best kept explicit at the token level. High-risk policies sometimes shouldn't become pure intuition at all; you may want the agent to show explicitly, every time, which rule it followed. Taken together: the more stable, frequent and generalizable a memory is, the more it's worth internalizing; the more it changes, needs auditing or is likely to be corrected, the more it should stay explicit.

This may gradually become an important internalization-policy problem for memory systems. When should a case become a strategy? When should a strategy become a skill? When should explicit memory become parametric memory? And if it later turns out to be wrong, can you take it back? These are all fascinating design questions.

---

## 3. Retrieval: remembering it, and recalling it at the right moment

Strictly speaking, besides formation and evolution, the third big stage of dynamics in *Memory in the Age of AI Agents* is retrieval.

The memory exists. When should it be brought out?

We've touched on this throughout the earlier essays, so I won't go too deep here, but it involves at least a few layers. When: does this moment need memory at all? What: am I looking for a fact, an experience or a piece of task state? How: vector, keyword, graph, or generate it directly? And after finding ten results, post-processing decides which ones really belong in working memory. So retrieval is definitely not just running `vector_db.search(query)` and calling it done.

This forms a very important loop. The agent's actions produce raw experience; formation decides what's worth remembering; evolution decides how to merge, update or forget; and at the right moment, retrieval brings it into working memory, where it shapes the next action and produces new experience.

Only after this loop runs for a while can an agent really become different from what it was yesterday.

---

## 4. Memory operations are no longer written as rules by people

The mechanisms above can look like engineers writing rules: add a memory if importance exceeds some threshold, merge on duplicates, delete when expired. But we can flip the thinking. Instead of engineers hard-coding conditions, let the agent try to learn memory management as a skill.

**Memory-R1** has a memory manager learn ADD, UPDATE, DELETE and NOOP. **AgeMem** goes further, exposing store, retrieve, update, summarize and discard as memory actions the agent can choose on its own, and training the management policy with downstream task rewards.

Building memory systems used to look like engineers writing rules for how an agent should remember. Now a clear new direction has appeared: asking whether agents can learn to manage their own memory. That's what the seventh essay in the series, on learned memory policies, will focus on.

---

## In the end, memory isn't a database. It's metabolism.

After all these mechanisms, it's clear that **we really shouldn't treat agent memory as a database that can only "add."**

A memory system that really works does something more like biological metabolism. It has to keep absorbing what's worth keeping from new experience, organize scattered events into patterns, update old beliefs that no longer hold, and finally metabolize information that's no longer valid.

In this dynamic loop, some repeatedly validated experiences slowly go from a scribbled note to a strategy, and finally grow into the agent's skills and behavioral tendencies.

**An agent that only remembers, and never revises or forgets, usually ends up accumulating not wisdom but heavier and heavier historical baggage.**

Which makes the next question a little scary. We're now letting agents decide for themselves what's worth remembering, organize their own experience, modify and delete their own memories, and even internalize experience into skills. So how does an agent know it got it right?

What if it reflects on a lucky success and comes away with the wrong strategy? What if two memories conflict and it deletes the wrong one? What if a hallucination gets written into memory and from then on it treats it as true? Worse, what if someone deliberately feeds it a fake experience?

That naturally leads to the core theme of season two: **once memory comes alive, how do we trust and manage it?**

Once memory starts shaping future actions, a mistake is no longer just an output error. It becomes a systemic error that gets used again and again, **and may even be reinforced again and again**. That's why, the more I read about agent memory, the more I think the really hard problems in the end aren't about capacity. They're reliability (did it remember right?), security (can it be maliciously poisoned?), governance (how do multiple agents share and govern memory?), and whether agents can learn to manage all of this themselves.

In season one we worked out what agent memory is, what it looks like, what it's for and how it evolves. In season two, we head into the deep end, to see the harder challenges memory faces once it's really deployed in complex applications.
