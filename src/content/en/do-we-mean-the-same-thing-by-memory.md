---
original: memory1
title: Everyone Talks About Memory. Do We Mean the Same Thing?
description: >-
  Everyone working on AI agents talks about memory, but chat history, MEMORY.md,
  RAG, context engineering and fine-tuning answer different questions. The first
  essay in my Agent Memory series pulls them apart.
tags: []
sourceHash: '1d93632c9e71'
---

We used to think that if we got RAG right and filled the context window, AI would get smart. Then you actually build an agent system and find that what hurts most often isn't that it can't answer something new. It's that it forgets the hard lesson the two of you learned together yesterday.

I've spent a lot of time recently studying memory in AI agents, and the more I read, the more one question fascinates me:

When people say "memory" today, they often don't mean the same thing at all.

Some say memory is ChatGPT saving your past conversations. Some treat MEMORY.md as memory. Products like Mem0 and Zep are building memory too. RAG pulling data from a vector DB sometimes gets pulled into the memory conversation. Go further down into the model, and people use "memory" to describe fine-tuning, the KV cache, even the knowledge stored in model parameters.

Mix all of that together and it turns into: if the AI can bring back something from before, call it memory.

That makes it hard to talk about anything, because different research and products are solving different problems.

So I want to spend a few essays sorting out what agent memory actually is.

I don't plan to just summarize papers. I'd rather start from the situations we actually run into when building systems: where does memory live? What should an agent remember? How does a piece of information become memory? What happens when a memory goes stale? And once there are multiple agents, who gets to change shared memory?

Conveniently, a very thorough survey came out late last year: *Memory in the Age of AI Agents*. It points out that research on agent memory has become extremely fragmented, and that the traditional split into "short-term" and "long-term" memory no longer describes today's systems very well.

I gave a talk on this in February but didn't go into detail, so this time I plan to break the whole topic into 8 essays, serialized as "Season one (laying the foundation)" and "Season two (the deep end)." Honestly, digging a hole this big makes me a little worried I won't be able to fill it 😅. The technology moves fast, so if I get something wrong, please tell me 🙏

Anyway, in episode one we'll start by pulling apart the terms that are easiest to confuse.

#They're all called memory, but they answer different questions

![A Venn diagram of LLM memory, RAG, context engineering and agent memory](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image.webp)

As the Venn diagram shows, the tangle of memory terms can roughly be cut into four related but different problem spaces: LLM memory, RAG, context engineering and agent memory.

Rather than memorizing definitions, I currently understand the real differences through four questions:


**1. LLM memory: what does the model itself "remember"?**

If the research centers on the LLM itself, for example:
• how information is encoded into model parameters
• how a model sustains a long context
• the internal state during inference
• how past information keeps influencing the model's computation

then it's closer to an LLM memory problem. Its first concern is the model.
Put simply, think of it as: how does the model itself store and use past information?
That can go all the way down to model-level mechanisms like parameters and KV state. It isn't quite on the same level as "the agent remembers I like lattes."

But the boundary here isn't set by the storage medium. Agent memory can itself be implemented in token-level, parametric or latent form. What really differs is whether the research centers on the model itself, or on how an agent accumulates and uses memory across interactions. I'll go deeper on that in the next essay.


**2. RAG: before answering this question, what should I look up?**

RAG is something else again. Its core question is:
To answer this query, which information should I pull from an external knowledge source?

The classic RAG setup chunks a large body of documents, puts them in a vector DB and lets the LLM retrieve from it to answer.
But this is where a common misunderstanding creeps in: using a vector DB doesn't mean you've built agent memory.

Say I put my company's 10,000 SOPs into a vector DB for an agent to search. That's a perfectly good knowledge retrieval system.
But if the agent made a mistake yesterday and an engineer corrected it, will it behave differently today? Not necessarily.

Put simply, classic RAG is more like "where should I look things up before I answer this," while agent memory goes a step further and asks: "Of the things that have happened, which should stay with me and shape what I do in the future?"

For experiential memory, the question is even: "How do I avoid making the same mistake I made yesterday?" But agent memory isn't only experiential memory. Factual memory like "the user likes lattes" or "this repo uses PostgreSQL," and the working memory for the agent's current task, also belong to agent memory.

Note too that RAG and agent memory aren't mutually exclusive architectures. The read path of a lot of agent memory is itself retrieval-augmented. What really differs is the role a piece of information plays across the agent's lifecycle. That's why the survey deliberately treats RAG and agent memory separately.


**3. Context engineering: what should the model see this time?**

Context engineering has also been discussed alongside memory a lot recently.
My feeling is that one sentence separates the two:
Memory is what you have; context engineering is what you let the model see right now.

For example, when a coding agent takes on a task, the context before it calls the model might include all of these at once:
• System instructions
• Project rules
• Current task
• Conversation history
• Tool results
• Retrieved memory
• Relevant code

Retrieved memory can be one of those inputs, and the memory system itself often takes part in constructing the context. What context engineering really cares about is this: this call has a limited context budget, so what goes in?

So you could have a huge memory and pull nothing from it this time. Or you could have no long-term memory at all and still get an agent running smoothly through excellent context construction. This is a split that's convenient for engineers. In practice the two overlap heavily, but thinking about them separately helps clarify what each one is solving.


**4. Agent memory: how do past experiences keep changing future actions?**

With real agent memory, I think the question becomes a bit different.
An agent is no longer just input → LLM → output. It interacts with an environment again and again, takes an action, gets an outcome, then takes the next action.

What matters about memory here is whether what happened before can keep influencing the next judgment and action.

Here's an example from the trenches. The last time an agent deployed, something broke. An angry engineer fixed it and told the agent: before any production migration, always check backward compatibility first.

That lesson was kept. Three weeks later, a different task ran into a migration, and the agent brought up that lesson on its own and changed its plan. That's much closer to the core of agent memory as we're discussing it than simply "finding the migration doc in memory."

Once you build agent memory that runs for the long term, you quickly hit an important problem: memory isn't written once and done. It needs dynamics.
• The agent does something → a new memory forms.
• It finds an old experience was wrong → the memory gets revised.
• Two experiences conflict → merge them, keep the disagreement, or retire one of them.
• It needs to complete a new task → the right memories get pulled back.


— 

**The same technique can be doing completely different things**

Once you pull these concepts apart, you can clearly feel that the technical implementation alone can't tell you whether something is agent memory.

Take two systems that both use a vector DB:
Scenario A: company documents → vector DB → answer employees' questions.
That's RAG.

Scenario B: agent execution → extract lessons from failures → vector DB → reuse them on the next task.
That starts to look like agent memory.

Honestly, both systems might even be built on the same PostgreSQL + pgvector underneath. Some systems today just keep writing chat history into a database and call it memory. But if that data is never organized, never selectively retrieved, and never influences the agent's judgment again, it's closer to an archive than a complete memory mechanism 😅.

Likewise, the MEMORY.md file an agent creates is only a storage format. The questions to ask are:
• Who writes to it?
• Does it hold objective facts or subjective experience?
• When does it get updated?
• How do old entries expire?
• When does the agent read it?
• And most important: after reading it, does the agent actually act differently?

Only when you ask those questions does memory go from a static "file" to a living "mechanism."

— 

So think of this essay as the outpost for the whole series. It's a big hole, so I plan to write it in two seasons, and I hope I make it to the end 🫠:

#Season one: the foundations of agent memory
If you're building agents, the first four essays mainly build a practical shared vocabulary, so we can see which piece each tool is actually working on:

1. Do we all mean the same thing by memory? (this essay)
2. What does an agent's memory actually look like? (from token-level and parametric to latent memory)
3. What does an agent need to remember? (from working memory to experiential memory)
4. How does memory form, update and fade? (from formation to forgetting)

#Season two: the deep end of agent memory
Once season one lays the foundation, I think what comes next is even more fascinating. Academia and industry alike are starting to face a harsh reality: even if an agent "remembers," that doesn't mean it remembers correctly; and even if it remembers correctly, that doesn't mean you can trust it.

So in season two we'll move toward the harder problems of putting memory into practice:

5. Remembering isn't the same as remembering right (staleness, hallucination and conflict)
6. When memory itself gets attacked (security and poisoning)
7. Can agents learn to manage their own memory? (learned memory policies)
8. When memory goes from "mine" to "ours" (governing shared memory)

That's the full blueprint for the series. Honestly, by the time we reach the deep end in season two, the problems have long gone beyond "which vector DB should I store the conversations in."

— 

I think what memory ultimately has to solve isn't storage. It's how past information and experience can keep shaping future actions.

So the finish line for memory shouldn't be successfully storing a million conversation logs. It should be an agent that does things differently this time, because it remembers.

Seen from that angle, the implementation details get really fun. In the next essay in season one, we'll start with the most basic question: where does memory actually live?

We'll look at why things as different as MEMORY.md, vector DBs and knowledge graphs all end up in the same agent memory toolbox.

When you've built agents, have you run into cases where you thought it remembered, and then it forgot again the next time? Any suggestions for the series are very welcome too 🙏
