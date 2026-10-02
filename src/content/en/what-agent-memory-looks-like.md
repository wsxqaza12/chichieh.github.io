---
original: memory2
title: What Does an Agent's Memory Actually Look Like?
description: >-
  Where an agent's memory lives and what form it takes are two different
  questions. A tour of token-level, parametric and latent memory, and where
  MEMORY.md, vector DBs and knowledge graphs fit.
tags: []
sourceHash: '533a5fd83de2'
---

In the last essay we got one thing straight: the core of agent memory isn't just storage, so it isn't the same as a vector DB, and it isn't just archiving every past chat. But that immediately raises another question: where does an agent's memory actually live? In `MEMORY.md`? In a vector DB? In a knowledge graph? Or inside the model's brain?

The answer is that it could be any of them. But there's something easy to mix up here: "where memory is stored" and "what memory looks like" are two different things. If you ask "where are my photos?", you might answer "in Google Drive." That answers where they're stored. If I ask "what is your photo?", the answer might be "a JPG image." That answers what it looks like. Agent memory works the same way.

![Where memory is stored versus what form memory takes](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-1.webp)

---

Let's continue the painful example from last time. Say an agent broke something the last time it deployed, got chewed out by an engineer, and learned a lesson: "Before a production migration, check backward compatibility first." That memory can take many forms. It can be a sentence: "Remember to check backward compatibility before a migration." It can also become part of the model, so next time the model thinks to check without seeing the reminder at all. It might even be compressed into a pile of numbers no human can read, hidden in the model's internal state.

So here's the interesting question: what is actually helping the agent remember this? The survey *Memory in the Age of AI Agents* roughly divides the forms memory takes into three:

1. Token-level memory
2. Parametric memory
3. Latent memory

The names may sound a bit opaque, but the concepts aren't that hard. Let's go through them one at a time.

---

## 1. Token-level memory: write it down

This is the easiest one to understand. Put simply: if you're afraid of forgetting, write it down. If you tell an agent today "I don't like cilantro," it can store "the user doesn't like cilantro." Or if a deploy goes wrong, it can store "Before a production migration, check backward compatibility first," and next time something related comes up, pull that sentence out and show it to the model 😅.

That's the classic form of token-level memory. It might be a passage of text, a JSON object, a memory card, even an entire past conversation. Its defining feature is that the memory exists explicitly, and people can usually read it. So if the agent remembers something wrong, you can open it up and go, "Wait, I love cilantro, why does it think I don't?" and fix it by hand. That's a big advantage of token-level memory: it's easy to read, easy to edit and easy to delete, and it's easier to know what the agent actually remembered.

The text in `MEMORY.md`, the textual memory records in a vector DB, conversation summaries: most of what we see today is token-level memory. But here's the problem. Ten memories are easy. What about 100,000? So people started thinking about how to organize them. The survey splits token-level memory further into flat, planar and hierarchical. The names are still a bit academic, so let's translate them into plain language.

---

### 1-1. Flat memory: throw everything in one drawer

Flat is the simplest. Picture one huge drawer: every time something important happens, you drop a note in. The notes have no particular relationship to each other; they all lie flat together, hence "flat." When the agent needs something, it asks which notes look most like the current problem. If the agent is about to do a migration, it searches "migration" and finds "the PostgreSQL migration had problems last time." That's the most common approach in vector DB memory: turn each memory into an embedding and run a similarity search. It's very simple and works well.

But there's a catch. It knows which things look alike, but not necessarily how they're connected. Say it finds three memories: the last migration failed; people are still using the old API; production migrations need a backward compatibility check. A person might see at a glance: oh, the migration failed because people still use the old API, and that's where the backward compatibility lesson came from. To flat memory, these are usually just three separate notes. It doesn't necessarily know they're one story. So people took the next step.

---

### 1-2. Planar memory: connect the notes with string

You can think of planar memory as not only putting notes in the drawer, but also tying related notes together with string. For example: the migration failed because people still use the old API, so next time check backward compatibility. Now the agent can find not only which memories relate to migrations; if we also record relationships like "caused by" and "depends on" explicitly, it can follow them back to the causes and consequences of an event. That's what knowledge graphs often do. They record things like ChiChi → works on → Cairn, or Cairn → uses → MCP. These are no longer isolated records. They're related, so the agent can start answering "What is ChiChi working on?" or "How are Cairn and MCP related?" That's already quite different from a plain similarity search.

There's an easy mix-up here, though. Many people assume that using a graph makes it hierarchical, or using a vector DB makes it flat. Not necessarily. Be careful: the survey's flat, planar and hierarchical categories cut token-level memory by memory topology. Another survey this year (Wu et al.) takes a more engineering-oriented storage view and separates "how it's organized" (organization) and "what structure represents it" (representation) into two different dimensions.

So we shouldn't equate flat with vector DBs, planar with graphs, or hierarchical with trees. A real system could just as well be flat + graph, or hierarchical + vector. The point is that a memory's topology doesn't map one-to-one onto the storage or representation technology underneath.

---

### 1-3. Hierarchical memory: separating small events from big principles

The next step is hierarchical memory, and to me this mechanism feels a lot like how humans think.

Say your first deploy breaks. The agent records "the migration blew up during the deploy on August 3," a very concrete event. After a few more incidents, the agent might gradually work out that "migrations often break because of compatibility with older systems." After even more experience, it condenses into a principle: "Before a production migration, check backward compatibility first." You can see it moving from a single event to a pattern, and finally converging on a principle. That's an important situation hierarchical memory tries to handle: letting memories exist at different granularities or levels of abstraction instead of all on one level. Add a consolidation or abstraction mechanism, and the system might distill patterns from many concrete events, even forming higher-level principles.

This matters a lot. If an agent works for a year and piles up millions of execution logs, you can't page through all of them every time. The sensible approach is to look up deployment safety first, then migrations, and only when you really need to, dig into what happened in the August 3 incident. It's like looking something up in a book: you don't start from page one every time; you look at the chapters and sections first, and read the text last. That's what hierarchical memory is after.

Recently some research has started seriously discussing how agents can automatically organize many small events into larger concepts, for example from raw events to episodes, then patterns, and finally general principles. It's a bit like the agent writing in its diary and then writing up what it learned. Personally I think this will be a very important direction once memory has to scale. What everyone eventually discovers is that the really hard challenge is teaching an agent to judge which details to keep, which to merge, and when to condense experience into rules. That goes beyond a storage question; it's more about how an agent should make sense of its own life experience 🤣.

---

## 2. Parametric memory: skip the notes and memorize it

The token-level memory above has one thing in common: when the agent wants to use an old memory, it usually has to find it first, like bringing a cheat sheet to an exam. But there's another way: forget the cheat sheet and memorize it. That's parametric memory.

Say an agent has accumulated tens of thousands of coding tasks, and the system turns that experience into a training signal and writes it into the model's parameters through fine-tuning or online adaptation. From then on, when it hits a migration, it doesn't need to dig that sentence out of a database; it just checks, as a matter of habit. It's like learning to ride a bike. At first you keep getting reminded to balance and look ahead, but after a while you don't recite those rules in your head; your body just does it. After the last essay, a reader commented that this is like the "muscle memory" an agent builds after falling over again and again, and I think that analogy is pretty intuitive here.

But it's worth making a distinction. "Muscle memory" describes what it learned from experience, while parametric memory describes where that experience ends up. One is about the function and content of the memory; the other is about the form that carries it. The two dimensions shouldn't be mixed together.

Parametric memory can be roughly divided into two kinds. One modifies the model itself, so the information is actually written into the base model's parameters. The other leaves the whole brain alone and attaches a small new piece beside it, like LoRA or an adapter, as extra parameters. You can even imagine a future with a Coding Memory LoRA, a Finance Memory LoRA or a company-specific Memory LoRA, attaching whichever piece you need for the capability you want. It's a direction with a lot of room for imagination.

But there's an obvious problem. Say the agent wrongly remembers that "the user doesn't like lattes." If that sentence is in a database, you just delete it. But if it's been learned into the model, how do you make it forget exactly that one thing and nothing else? Suddenly things get very messy 🫠. So the upside of parametric memory is that you don't search every time and it shapes the model's behavior more naturally. The downside is that it's hard to read, hard to edit and hard to forget.

---

## 3. Latent memory: it remembers, but you can't read what it remembers

The last kind is even more interesting. Suppose we don't even store text. After the agent sees the migration lesson, it compresses the information straight into a pile of numbers inside the model (a hidden state, a KV cache or some other latent representation), and next time it needs it, it pulls those internal states back and uses them directly. That's latent memory.

Think of it this way: token-level memory is written as a sentence; parametric memory is learned into the brain; latent memory is more like a feeling that stays in your head but can't necessarily be put fully into words. When you walk into a familiar room, you don't recite "the desk is 1.4 meters to the right, the door is 3 meters behind me," but you know how to move around. Some information doesn't need to be turned into human language for a model to keep it. That's what makes latent memory appealing. It can preserve internal signals that would be lost when compressing into a text summary, and it can directly reuse states the model already computed, instead of reading a long passage all over again.

But it brings a huge problem: humans can't read it at all. If token-level memory says "ChiChi likes lattes," we can check it. If the memory becomes a long vector like `[-0.183, 0.921, 0.034, ...]`, you have no idea what it is. Worse, you don't know which part it remembered wrong, how to change it, or how to delete the latte thing, and you can't even be sure whether the agent just made a particular decision because of that memory. In engineering terms, all of this becomes a nightmare 😭.

So while latent memory can be more efficient in some situations and cut down on repeated computation, it also brings new challenges in interpretability, editing, deletion and security. We'll come back to those later in the series.

---

## So what are MEMORY.md, vector DBs and knowledge graphs?

With all that in mind, the question from the start becomes clearer.

**MEMORY.md**: most of the time it holds token-level memory, like text noting that the user prefers short answers, or that tests must run before a deploy. But a `.md` file is just a container. It says nothing about how smart the memory system is.

**Vector DB**: a vector DB isn't a kind of memory either. It's more like the search system for a library of memories. The memory itself might be a passage of text; the vector DB just finds which passages are most relevant to the current question. So a lot of so-called vector DB memory is, at heart, token-level memory plus vector retrieval.

**Knowledge graph**: knowledge graphs are better at preserving relationships between entities (how A relates to B), which makes them a good fit for building token-level memory with relational structure. But as mentioned above, using a graph doesn't make it hierarchical. That one is easy to get wrong.

**Fine-tuning / LoRA**: if memory is actually learned into the model's parameters, that's parametric memory.

**Hidden state / KV cache**: if memory lives in the model's internal state, that's closer to latent memory.

---

## So which one is best?

At this point it's easy to fall into an illusion: flat is basic, hierarchical is advanced, parametric is more advanced, and latent is the coolest. That's not it at all. They're simply suited to different problems.

If all I need to remember is "the user likes lattes," I want it in a clear token-level memory, because that's the easiest to change. If I need to handle thousands of incident records from the past three years, I might really need a graph or hierarchical memory to untangle the context. If it's a coding habit an agent picked up over hundreds of thousands of training runs, internalizing it as instinct through parametric memory makes more sense. If it's a large volume of past model state that I want to reuse at high speed, latent memory has a big advantage.

So, coming back around, the point really isn't to argue about which memory technique is strongest. What we need to be clear about is: what do I actually want the agent to remember, and how do I plan to use it later? Different answers to those two questions call for completely different kinds of memory.

That leads right into the topic of the next essay. Here we sorted out what an agent's memory can look like: text, a graph, parameters or latent state. The practical problem next is: what should an agent actually remember? That the user likes lattes, yes. The last deploy blowing up, probably. What about a boring question someone asked yesterday? Should every tool call be kept? What about wrong experiences? If the same thing happens 100 times, do I store 100 entries or condense them into one?

In the next essay we'll look at factual memory, experiential memory and working memory. Put simply: not everything that happens is worth an agent remembering.

How do you build memory into your agents right now? I'd love to hear about it in the comments 🙏.
