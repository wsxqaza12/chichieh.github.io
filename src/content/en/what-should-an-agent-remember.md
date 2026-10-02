---
original: memory3
title: What Should an Agent Remember?
description: >-
  Not everything that happens is worth an agent remembering. Factual,
  experiential and working memory each do a different job, and stacking them
  against memory's form gives you a map of the field.
tags: []
sourceHash: '897b459488a2'
---

Last time we talked about what an agent's memory actually looks like: the same memory can be written as text in a vector DB, learned into model parameters, or hidden in a KV cache. Once you know the forms memory can take, the next question is more practical: what is actually worth remembering?

If an agent works with you for a year, it might see tens of thousands of messages, make thousands of tool calls, and step into hundreds of potholes alongside you. Should all of that be kept?

If you casually say "I kind of feel like ramen for lunch," should that be remembered? But if you say "I don't eat beef," that sounds more worth keeping. What if the agent calls the wrong API once while running a task? Honestly, if that mistake took down production, it probably should be remembered.

So the really hard question isn't whether memory can be stored. It's what an agent should turn into its own memory.

This time let's take a different angle, again from the functions described in *Memory in the Age of AI Agents*. If the last essay asked what carries memory, this one asks why the agent needs this memory: what is it for?

The survey roughly divides memory into three kinds: factual memory (what I know), experiential memory (what I've learned from the past) and working memory (what I'm handling right now). Put simply: facts, experience and the workbench. Let's go through them one by one.

![The three functions of agent memory: factual, experiential and working](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-3.webp)
---

## 1. Factual memory: what does the world look like right now?

Let's start with the most intuitive one. Say you tell an agent "I don't eat beef," or the agent knows from the project that "this project's database is PostgreSQL," "production is currently running v2 of the API," "client A wants shorter replies." All of these are closer to factual memory.

It mainly helps the agent answer: about this person, this environment and this world, what should I know? The paper splits factual memory roughly in two. One is user factual memory, about the user: you don't eat beef, you're going to Japan next month, last time you decided not to go with option A. It keeps the agent from waking up every time as if it's meeting you for the first time.

The other is environment factual memory, about the outside environment: which database the project uses, a third-party service that's been deprecated, the project being in phase 2. None of these are user preferences, but if the agent doesn't remember them, it ends up having to divine them from scratch every time.

But factual memory has a nasty problem: what counts as a fact worth remembering?

If we exchange 1,000 sentences today, in theory every one of them is something that happened. But if you store every one, memory blows up fast. So some new research this year tackles this head-on. Instead of defaulting to "remember everything in case we miss something," let the memory system judge what is actually worth keeping for this agent, this user and future tasks.

That makes a lot of sense. For a travel agent, the fact that you don't eat beef is very important, but the latte you had this afternoon probably doesn't need to be kept forever. Switch to a diet-tracking agent, and the same sentence suddenly matters. So what's worth remembering depends not only on the information itself, but on what the agent will use it for later.

And it gets messier. Some information looks completely unimportant when it's written and only turns out to be useful weeks later. Today's throwaway remark might become key evidence three weeks from now. That means agent memory can't always predict perfectly, at the moment information appears, whether it will be useful in the future.

There's an even more counterintuitive point: an agent remembering something doesn't mean it will use it. An agent can correctly answer that you're allergic to pollen, so it "knows." But when you ask what to do on a spring weekend, it recommends a picnic in a flower field.

Some research this year has started splitting this into know and act. An agent being able to retrieve a preference doesn't mean it will actually use it while planning or acting. This comes back to what I kept saying in the first essay: the finish line for memory isn't "I stored it," and it isn't just "I can look it up." What really matters is whether the memory changes the agent's next judgment.

---

## 2. Experiential memory: I fell into this hole last time, so not again

Next is the kind I'm most interested in: experiential memory. If factual memory is more like "I know the migration failed last time," experiential memory starts asking "so what did I actually learn from that?"

Back to the deployment incident we've been using throughout. Say last month, while helping release a new version, the agent updated the database structure directly (a schema migration), and production went down hard. It turned out people were still using an old version of the mobile app. The engineers rescued it in an emergency, and the lesson was: always check backward compatibility before an update.

Factual memory might only record that a migration incident happened on August 3. Experiential memory wants to keep what I should do the next time I get an upgrade task. One is closer to what happened; the other is closer to what I should learn from what happened.

The researchers divide experiential memory into three kinds, by how abstract the experience has become:

* Case-based memory
* Strategy-based memory
* Skill-based memory

I find these three categories really interesting, because they look a lot like the process of experience slowly being forged into ability.

### 2-1. Case-based memory: keep how you did it last time

The simplest approach is to not draw any grand lessons yet and just keep the full case from last time. The task was a database upgrade; it failed with "legacy API incompatible"; it was finally solved with an emergency rollback plus a compatibility layer.

The next time the agent meets a similar task, it asks itself whether it's done this before, then pulls up that case as a reference. It's a bit like searching Stack Overflow to see whether anyone has hit the exact same error. The upside is lots of detail and complete evidence. The downside is just as obvious: if you store the full trajectory every time, a year later you might have hundreds of thousands of cases, and no two tasks will ever look exactly alike. So the next step is to start abstracting.

### 2-2. Strategy-based memory: don't just keep cases, write a playbook

Say the agent has botched five database upgrades. It starts to notice that every failure seems to involve dependencies, data-structure compatibility and rollback. So instead of keeping five long execution logs, it writes a migration strategy: first check the impact on downstream services, verify backward compatibility, prepare a rollback plan, and only then run the upgrade.

At this point memory is no longer just what happened last time. It becomes "when this kind of thing comes up, here's what I usually should do." So a case is like a case study, and a strategy is like a playbook. That's a clear direction in agent memory lately: stop hoarding trajectories and compress experience into more reusable knowledge.

Raw experience keeps lots of detail. One level up, it can be organized into a more generalizable strategy; further up, it might become a rule or a skill. That's very much like how people learn. The first time your startup fails, you might remember the night you launched and nobody showed up. The second time, you might learn to validate with the market before the product is finished. A few years later, all that's left is one line: "Sell first, then build." The details shrink, but the range where you can reuse it grows.

### 2-3. Skill-based memory: a playbook used enough times becomes a tool

The next level down is even more interesting. Say the strategy "check compatibility before every system update" has been used a hundred times. Does the agent really need to recall the strategy, understand it and redo it by hand every time?

Maybe you can just write it as `check_backward_compatibility()`, or turn it into a script, a tool, even an MCP server. That's what the paper calls skill-based memory: past experience ends up packaged as a capability that can be reused directly.

The progression looks like this:

* Case: how did I do this before?
* Strategy: how should this kind of thing be done?
* Skill: okay, enough talk, I'll just do it for you.

This categorization starts to blur the line between memory and skills. Of course, not all research calls a skill a memory. But in this functional taxonomy, skills are placed under experiential memory because the skill comes from what the agent did in the past, packaged into a capability it can reuse.

One more observation of my own: failures may be more worth remembering than successes. If an agent succeeds once, great. But if it hits a pothole and asks why it failed, which step it shouldn't have taken and how to avoid it next time, that can produce more valuable reusable knowledge. So good experiential memory shouldn't just be a collection of success stories. It's more like a playbook that slowly grows from both successes and failures.

---

## 3. Working memory: where am I right now?

The last kind is quite different from the first two. Factual and experiential memory usually keep things across sessions and tasks. Working memory deals with a task the agent hasn't finished yet: what does it need to hold onto in its head right now?

Say the agent is helping you debug a bug where users can't log in. What's known so far:

* It only happens in Safari
* The login credentials (JWT token) check out
* The cookie's cross-site setting (SameSite) is the problem
* A database connection issue has been ruled out
* Next step: check the cross-origin resource sharing (CORS) settings

Plus, the tool call that just came back says `SameSite=Lax`. None of this is necessarily worth remembering forever, but right now it absolutely can't be forgotten, because the next step of reasoning depends on all of it.

I think the best way to understand working memory is as your workbench. Factual and experiential memory are more like the bookshelf behind you or the company wiki. Working memory is what's spread out on your desk right now. When you're writing a report, your desk might hold:

* Today's task
* Three papers you just found
* A draft
* A half-finished outline
* A number you just calculated

All of these matter a lot right now, but being on your desk doesn't mean you keep them forever.

There's an easy mix-up here: the context window isn't working memory. The context window is how big your desk is; working memory is how you manage it. However big the desk, if you pile all of this on it:

* A tool output that failed three days ago
* 200 pages of irrelevant documents
* Subtasks you've already finished
* The same conversation repeated 20 times

you still won't find what you need right now.

Real working memory isn't just a passive buffer. It has to actively decide what should stay for now, what can be compressed into a summary, and what's no longer useful and can go. Recent research on long-horizon agents has started treating working memory as a workspace the agent manages actively. The agent no longer just keeps appending new things to the end of the context; it can delete a passage, keep a piece of evidence verbatim, or even roll back after taking a wrong turn.

Another common approach is for working memory to keep only the progress so far plus "shortcuts," like "reference A" or "the result of step three." The full history goes into a drawer, and when it's really needed, you follow the shortcut back to the original. It's like not needing every huge file on your desktop: a few folder shortcuts that tell you where things are in Drive are enough, and you open them when you need them.

I think this will be a very important ability for long-running agents. As agents work continuously for hours or even days, the real limit may no longer be how many hundred K tokens the context window holds, but whether the agent can keep its own workbench in order.

---

## Stacking essays 2 and 3: form × function

Now we can really connect the last essay (season one, #2) with this one. The last essay was about form (how memory exists). It can be:

* Token-level memory
* Parametric memory
* Latent memory

This one is about function (what the memory is used for). It can play the role of:

* Working memory
* Factual memory
* Experiential memory

These are two different dimensions. You can think of them as a three-by-three grid, as shown:
![A three-by-three grid of memory form against memory function](/content-images/raw/images/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%8824%E6%97%A5%20%E4%B8%8B%E5%8D%8806_57_56.webp)

The horizontal axis asks what form the memory takes; the vertical axis asks what the agent is using it for right now. This matters a lot, because many things that look like different kinds of memory aren't mutually exclusive categories at all.

For example, "you don't eat beef" written into a memory store is token-level plus factual memory. Another example: "check backward compatibility before a system update," written up as a lesson in text, might be token-level plus experiential memory. But if that pattern is later internalized into the model's parameters through training, it becomes parametric plus experiential memory. The content is almost the same, but the form carrying it is different.

Even the function of the same piece of information can change. Take "the August 3 database upgrade failed because the old API wasn't handled." Normally it sits in long-term memory describing history, playing the role of factual memory. But at the next upgrade, if the agent pulls it back to ask what went wrong last time, it starts playing the role of experiential memory. Then, when the new upgrade task begins and this information is retrieved into the current context, it enters working memory.

So what decides which kind of memory a piece of information belongs to isn't only what it says, but what the agent is using it for right now.

The grid is more of a map for understanding agent memory than nine fully separate drawers. The three functions keep flowing into each other. Today the agent gets a system upgrade task. It first finds in factual memory that an old API version is still running in production, then finds in experiential memory why the system blew up last time, and both memories get pulled onto the working-memory workbench. Then it actually runs the task and discovers an old mobile app version nobody had seen before is still connecting. That new finding can later become a new factual memory, and after a few rounds, an experiential memory: "Before upgrading, check mobile app compatibility, not just the web." It's a loop: pull facts and experience into working memory, produce new information through reasoning and action, and finally write it back into long-term memory. That's when memory really comes alive.

Expand the grid further, and this figure places representative agent memory research from recent years back into this form × function space:
![Representative agent memory research placed on the form × function grid](/content-images/raw/images/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2%202026-08-24%20174822.webp)

You'll see that almost all nine directions have already been explored, but the density of research is very uneven. Some work on context condensation, previous trajectories, vector databases and knowledge graphs; some internalize experience directly into model parameters; and further toward latent memory, more model-native approaches appear, like KV generation and compression, and latent repositories.

The most obvious thing is that a large share of agent memory work is still concentrated on the token-level side. That's not surprising. Memory written explicitly as text, trajectories, graphs or external records is the easiest to inspect, edit, delete and retrieve, and the easiest to plug into existing agent workflows. Parametric and latent memory do have research, and it's been growing fast over the past six months, but it usually involves training, model editing, or managing hidden state or KV state, with higher engineering barriers and harder controllability problems. So I read this figure as: the grid isn't nine paths of equal maturity; it's a research map that's filling in quickly.

---

## The real question in the end: more isn't better

Having written all this, I think agent memory has something deeply counterintuitive about it. We tend to assume that bigger memory is better and remembering more makes an agent smarter. Once you actually build systems, it may be exactly the opposite.

Remembering too many facts leads to memory bloat. Keeping too much experience means every lookup returns a pile of duplicate or even contradictory cases. And stuffing working memory too full just drowns the agent in its own history. So what a mature memory system really has to solve is what deserves to become a fact, what experience is worth keeping, and, for the current task, what belongs in working memory and what can be decisively thrown away.

That brings us to the next essay, because so far we've quietly assumed one thing: that everything the agent writes down is correct. Reality is of course not that nice. If the user lived in Taipei last year and moved to Tokyo this year, what happens to the old memory? What if two experiences contradict each other? What about something that was important and is completely out of date six months later?

So next time we'll talk about how memory forms, updates and fades (formation → evolution → forgetting). An agent that's really going to exist for the long term can't have only a "remember" button. It also has to know when to write something down, when to change its mind, and when to forget.

When you build agents today, do you mostly store facts about the user and environment, or the experience the agent leaves behind after running tasks? The more I read, the more I think the latter is where agent memory really starts to get interesting. If you've lived through similar disasters, come commiserate in the comments!
