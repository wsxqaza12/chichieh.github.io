---
original: mcp
title: 'Productizing MCP: Where to Draw the Line as Tools Pile Up'
description: >-
  Once MCP goes to production, the hard problem isn't connecting tools but
  deciding how much an LLM should see. Context, exposure and orchestration, and
  the agent-backed MCP tool pattern.
tags: []
sourceHash: '3dac8a373044'
---

![Productizing MCP](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image.webp)

I've long had a question: will the MCP protocol actually keep developing?

A lot of technologies are hot when they first come out. Everyone rushes to build demos, wrap tools and hook up external APIs, then after a while they discover it's not usable in production, and it slowly turns into a graveyard of side projects. At first I wasn't very sure about MCP either. I thought it was probably just a standard that made it convenient for agents to connect to internal knowledge bases and all kinds of business software, mainly to avoid rewriting the integration logic every time.

But lately, because I've been building more with it myself, I went back to what Anthropic says about MCP, and looked at the approaches that have popped up since (code execution, tool search, gateways and so on).

My sense is that MCP is slowly growing from a simple "connector" into "agent infrastructure." And once you actually try to push it into production, the problem that gives you headaches stopped being "can it reach the tools" a long time ago.

What's really hard is this: when your own product already has a huge number of features you want to open up to agents, how much should the LLM get to see? Put plainly, that's a product design question, well beyond technical integration.

This essay is my personal take and architectural sketch from recently building and researching MCP. Things are moving fast and many approaches are still converging, so if I've misunderstood something, please tell me.

## Three walls you hit in real development

Here's a situation people run into all the time. Say we're building an MCP server for a customer-service system. To let an agent help with complaints, we naturally write a bunch of granular tools in the server:
* `search_knowledge_base` (look up the FAQ)
* `get_customer_orders` (pull order history)
* `check_delivery_status` (check shipping progress)
* `calculate_refund_amount` (estimate a refund)
* `issue_refund` (issue the refund)
* `update_ticket_status` (update the ticket)
* `send_notification_email` (send a notification email)

These are all legitimate, useful MCP tools, and many people's instinct is: "Since we're building an agent, expose all these small tools and let it combine them on its own."

But here's the problem. Once your system has dozens or even hundreds of these little tools, whether they're for your own internal agent or opened up to external clients, the moment you dump them all on the front-end LLM, you hit three walls.

The first wall is **context**. The LLM sees a big pile of tool names, descriptions and input schemas. They aren't actual content, but they still eat up precious context window and can even interfere with the model's judgment.

Anthropic takes this seriously too. I recommend their November 2025 article, *Code Execution with MCP*. It points out that developers now routinely connect agents to hundreds or thousands of tools, and as tools multiply, tool definitions flood the context window, while intermediate tool results eat a huge number of tokens too. As their example puts it, if an agent connects to a thousand tools, the model might have to swallow hundreds of thousands of tokens of tool descriptions before it even reads the user's question. Just thinking about it feels like a waste of money.

The second wall is **exposure** (encapsulation and the line between inside and outside). It's especially obvious when you move a system from internal to external. Your product's underlying APIs, internal permission controls or anti-fraud logic must never be exposed to an external LLM unguarded. You need to be able to decide which tools are open to the outside and which stay tightly wrapped.

The third wall is **orchestration** (multi-step flows). Many tasks involve fixed, tedious steps. If the front-end LLM has to call all these small tools itself, it might first call "get orders," stuff a big blob of data into the context, pick out a specific order to call "estimate refund," and finally remember to call "update ticket." That wastes tokens, and it's easy for one guess in the middle to go wrong and break everything.

So at this point the focus of MCP shifts from "how do we connect tools" to "how do we design the capability surface the agent can see." Whatever an agent can see, it assumes it can do. Whatever it can't see, we have to finish for it in the backend.

## What solutions have appeared?

For the first wall, "too many tools flood the context," people might immediately think of the progressive disclosure skills use: show the model the name and description first, and only read the full instructions when it actually needs them.

Skills exist to solve the problem of too much workflow knowledge. Can MCP do something similar here?

The official architecture docs are clear: MCP focuses on being a context exchange protocol. It doesn't manage the context that gets pulled in, so MCP itself won't turn into skills. Interestingly, though, supplementary layers have started growing around MCP, all solving pain points that show up at scale.

To keep intermediate data from flooding the context, there's **code execution with MCP**.

I got a bit stuck the first time I read that article. Thinking about it in plainer terms helped. The traditional direct tool-calling approach sends every step through the LLM:

```text
The LLM decides to call tool A
Tool A returns its result to the LLM
The LLM reads the result, then decides to call tool B
Tool B returns its result to the LLM
```

If tool A returns a huge blob of data, that blob gets crammed into the context. If the next step, tool B, happens to need the same data, the model has to write it out in full again in the next tool call.

Code execution with MCP takes a different route. It has the agent write a piece of code that calls these MCP tools directly inside an execution environment:

```ts
const transcript = (await gdrive.getDocument({ documentId })).content;

await salesforce.updateRecord({
  objectType: "SalesMeeting",
  recordId,
  data: { Notes: transcript }
});
```

The transcript is of course still there, but it becomes a variable inside the execution environment. As long as you don't carelessly `console.log` it, return it or put it back into a message, the model never sees the full text at all.

So the reason "wrapping it as a code API" saves so much context has nothing to do with the API format being fancy. It simply keeps those bloated intermediate data flows out of the model 😅.

To stop the flood of tool definitions, there's **tool search**.

OpenAI's tool search lets the model dynamically search for and load tools only when it actually needs them, instead of loading every manual at the start. It's quite similar in spirit to skills, except that skills expand workflow instructions while tool search expands tool definitions. It's not a standard capability built into the MCP protocol; it's context management OpenAI does at the model-platform layer.

What about the second wall, encapsulation and the inside/outside boundary? That is, when my product connects a bunch of internal MCP servers and internal flows, but I don't want external clients to see all of it?

This is where an **MCP gateway** comes in. It handles not only external access and permission control, but also routing, logging, tool exposure and even context optimization.

Think of it as the company switchboard. Someone calling from outside doesn't need the whole company directory, and doesn't need to know how your department's internal process works. They just need to know "for this, call this number." Permission checks, transfers and record-keeping are all the gateway's job.

Docker's MCP Gateway and Cloudflare's MCP server portals are doing similar things. So a gateway really isn't just about saving tokens. It's a control layer you can't do without once you productize, letting you decide which tools get exposed and which backend capabilities stay wrapped up tight.

## A solution to the third wall: the agent-backed MCP tool

Those are a few solutions, but recently I've seen another approach that not only sidesteps the first wall, but also greatly reduces the third wall's problem of multi-step guesswork going wrong.

It breaks away from the idea of putting an ordinary function behind an MCP tool and puts a small agent there instead. In the customer-service example, we might expose just one high-level action to the outside (or to the main agent):

```text
process_customer_refund()
```

But in the back, `process_customer_refund()` has to run a whole sequence by itself:
* Pull and analyze order history
* Decide whether the refund policy applies
* Estimate the refund amount
* Execute the refund payment
* Update the ticket and send a notification email

Now the MCP tool is just an entrance, and the heavy lifting inside is done by a whole agentic workflow. This greatly reduces the context the front-end LLM has to see, and moves multi-step orchestration into a more controllable workflow or agent in the backend, instead of leaving the front-end LLM to guess its way through.

For now I'm calling it an "agent-backed MCP tool."

From the outside it looks like a perfectly stable MCP tool, but inside it wraps an agent, a workflow, or a process that can adapt to the situation.

Code execution lets "the model write code to use MCP." An agent-backed MCP tool lets "an MCP tool keep a team of agents behind it."

That difference is pretty big, and if we're building our own product, I'd definitely choose the latter. An external LLM has no need to know how my refund policy is evaluated or how the multi-step flow runs. It only needs one sentence: "refunds can be handled here." Our backend takes care of the rest 💪.

## Is anyone doing this?

From what I've found so far, this pattern doesn't seem to have a widely recognized name yet, but there are plenty of close neighbors.

The OpenAI Agents SDK describes a pattern called agents as tools: the main agent keeps control and calls specialist agents underneath as particular capabilities. Microsoft Foundry's connected agents are similar: a primary agent hands tasks down to different purpose-built subagents.

These aren't exactly the same thing, but the general direction is very close. In other words, people are already used to "a main agent calls a specialist agent." What I'm more curious about is the next step: can an MCP tool itself become the entrance to an agentic workflow?

In a real product, that's an architecture that grows quite naturally. Anyone building products knows you can't lay out every internal tool and process in front of an LLM. That's what product design that can actually ship, and stay healthy, looks like.

## When to bring out the big guns (an agent)

I should pull back a bit here.

Not every MCP tool needs an agent stuffed behind it. If it's a simple lookup or CRUD operation, just write an ordinary function as the tool, like `get_order_status()` or `search_knowledge_base()`. Don't make life hard for yourself.

But if the action needs complex judgment, has to read long context, and must handle lots of exceptions and multi-step flows, like `process_customer_refund()` above or `analyze_user_complaint_history()`, then it really is a good fit for hiding behind an agent-backed MCP tool.

My current rule of thumb:
* Simple data lookup: an ordinary MCP tool
* Fixed multi-step flow: hard-code it as a workflow
* Huge amounts of data to process: run it outside with code execution
* Judgment calls and lots of context: an agent-backed tool
* Cross-team memory and source checking: only then bring in a memory-aware agent

Cutting it this way to start keeps it from turning into a giant multi-agent free-for-all.

Multi-agent architectures sound super cool, honestly, but debugging them is often agony. I've split up a few side projects just to look cool. When I drew the architecture diagram I felt like a genius, and then the moment the system had a bug, I'd be digging through logs with no idea which layer of agent was making things up, on the verge of a breakdown 🤣.

## Looking back: four stages of MCP

To sum up, as I see it MCP has gone through roughly these stages:

**Stage one, the connector**: giving everyone a standard way to connect tools and data sources, to solve fragmented integration.

**Stage two, capability management**: as tools multiplied, the LLM's context couldn't keep up. The model might be forced to swallow a pile of tool descriptions before even reading the user's question. That's why approaches like tool search and code execution appeared.

**Stage three, the product gateway**: once MCP really goes into products, you naturally become aware of the boundary between internal and external MCP servers. You don't want to show every granular internal tool to the outside, so gateway needs like permissions, logging and routing appear.

**Stage four, the agentic backend**: expose only clean, stable MCP actions to the outside, while inside, intricate workflows and even specialist agents hold everything up. The less context is exposed externally, the more stable the agent may run.

So when I see something new now, I don't just ask "does this support MCP?" I'd rather know:

How fine-grained are the capabilities you expose to agents?
What does the LLM get to see in full, and what's hidden and handled in the backend?
Behind that MCP tool, is there just a function, or a whole agent working its heart out?

These details may be the pain points you can't avoid when MCP really goes into production and gets productized. Especially when you're building your own product, not just connecting to someone else's server, you'll feel it even more.

MCP has definitely opened a big door, letting agents easily grow all kinds of capabilities. But honestly, product builders don't need to naively lay every card on the table. That's probably my biggest takeaway from wrestling with this lately.

Have you built with MCP recently, or even pushed it into production? I'm curious how you design this layer: do you split tools very finely, or do you also lean toward exposing high-level actions and leaving the dirty work to the backend? Share your approach in the comments, and if you've hit similar disasters, come commiserate 🫠.
