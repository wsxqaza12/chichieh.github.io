---
original: mcp改版
title: 'MCP Goes Stateless: Getting Ready for Scale'
description: >-
  The July 2026 MCP stable release removes protocol-level sessions, adds multi
  round-trip requests and moves extra capabilities into extensions. What
  changes, what doesn't, and whether to upgrade now.
tags: []
sourceHash: 'd9c84285e5c9'
---

A while ago I wrote about productizing MCP. At the time I felt MCP was slowly moving from a plain connector toward agent infrastructure. That essay focused on the boundaries of product design, like whether too many tools would flood the LLM's context, and which capabilities should stay in the backend.

Then the MCP stable release on July 28, 2026 went straight for a much lower layer.

This time the maintainers didn't add any trendy new features. They reorganized sessions, the request flow, how servers and clients interact, and even how capabilities get extended. Put plainly, MCP has started to take one thing seriously: if lots of products are really using it in production, how does the protocol stay stable over the long run 😅

![The MCP 2026-07-28 stable release](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2%202026-08-02%20194521.webp)

## The key change: servers don't have to keep remembering who you are

The old MCP had a session mechanism. When a client first connected to a server, it had to complete a handshake, get a session ID from the server, and send that ID with every request after that. It's like getting a number at a restaurant: every time you order more, the staff use the number to know which table you are.

That's fine when you're running a demo locally. But once the service scales, with a load balancer in front and several server instances behind it, the number becomes a huge hassle. You have to make sure the same person's requests always go back to the same server, or else set up a shared session store so every machine knows what happened before. Just maintaining that relationship adds a pile of infrastructure cost that has nothing to do with the tools themselves 😭

The new version simply removes protocol-level sessions. The `initialize` and `initialized` handshake is gone, and so is `Mcp-Session-Id`. Now every request carries its own `protocolVersion` and `capabilities`, like an order form with all the required fields already filled in, so any server can pick it up.

If a client wants to check which versions and capabilities the other side supports first, it can call `server/discover`. Servers must provide this method, but clients don't have to call it before they can work. That's the stateless design this release keeps emphasizing.

Stateless doesn't mean products can't keep state, though. If a shopping cart, a browser session or a long workflow really needs to continue, the server can still return an explicit ID, and the client passes it back as an ordinary parameter on the next call. The state hasn't disappeared. It's moved from a session hidden in the protocol layer to data the product manages itself.

I think that difference matters a lot. Once state is explicit, it's much easier to trace and test, and to know which part of the flow went wrong, instead of staring at a session ID trying to divine what happened when a bug shows up 🫠

## When data is missing, say what's missing, then send it again

Removing long-lived sessions creates another problem, though.

Before, a server could reach back to the client in the middle of execution. Say a tool was halfway through and suddenly needed the user to confirm a refund amount: the server could turn around and ask the client to handle it. In a stateless world, the server shouldn't assume the original client is still online waiting.

So the new version adds multi round-trip requests, or MRTR. Simply put: when the server finds it doesn't have enough data, it returns what's still missing as the result. Once the client has collected the data, it resends the original request along with the state from the previous attempt.

Technically, the server returns `resultType: "input_required"`, with `inputRequests` and `requestState`. The client adds `inputResponses` and the original `requestState`, then sends it again. The new version also requires every result to carry an explicit `resultType`, so the client knows what to do next. You don't need to memorize the field names. What really matters is that the interaction no longer depends on the server reaching back to the client. Every step has an explicit request and result, which also makes it easier to trace and retry.

Notifications move in the same direction. The client actively waits for the changes it cares about through `subscriptions/listen`, and the server sends notifications back on the response stream. The old GET, subscribe and unsubscribe paths are removed.

## The genuinely hard work doesn't disappear. It just moves

Stateless solves sessions at the protocol layer, not all product state, and MRTR brings new implementation responsibilities.

Shopping carts, long tasks or browser sessions still need to save progress. It's just that now the application decides how to store it, for how long, and who's allowed to get it back. If that layer isn't designed well, state has simply moved from the MCP server's memory to some uglier place.

Take refunds. After the client fills in the missing data, it resends the original request. The server has to know this continues the previous operation rather than issuing a second refund. `requestState` gives a protocol-level clue, but idempotency, timeouts, duplicate submissions and failure recovery are still the product's job in the end.

Caching is the same. Tool lists can be shared, but that doesn't mean every result should be shared across users. Enterprise systems still have to check tenant, permissions and cache scope. Saving a few lookups in exchange for a broken data boundary is never worth it. And having trace context doesn't automatically make a system easy to debug. The gateway, the MCP server and the backend services all have to pass the data along correctly, or the trace breaks halfway.

The protocol has organized the problems more clearly, but it hasn't finished them for the product.

## A smaller core, with other capabilities growing as extensions

Another key direction is that MCP has started separating the core protocol from additional capabilities.

If every new feature goes straight into the core, every client and server ends up carrying the implementation cost, and every spec change forces the whole ecosystem to move. That isn't healthy. So the new version negotiates additional capabilities through `extensions`, letting them evolve separately from the core spec. For example, Tasks, which used to be an experimental feature in the core, has moved into the official Tasks extension, and MCP Apps uses an extension to let servers provide interactive UI.

This reminds me of skills, which I mentioned in my earlier essay. At the time I felt MCP was responsible for exchanging context and capabilities, while skills handled workflow knowledge. There is now a Skills over MCP Working Group and a SEP pushing how the two should work together, but that's still in review and under discussion, not a finalized extension. Keeping the core small and letting other capabilities develop on their own is a structure with a better chance of handling whatever changes come next.

## Some old features are on their way out

In this release, roots, sampling, logging and the old HTTP+SSE transport are all marked deprecated.

Deprecated doesn't mean they stop working tomorrow, though. Under the new lifecycle policy, a feature has to stay deprecated for at least 12 months before it's eligible for removal. For an existing system, you don't need to stop everything and rewrite the moment you see the label. For a new project, though, I wouldn't build the architecture on these features anymore.

Sampling's retirement says a lot about where MCP stands now. Before, a server could ask the host to call a model on its behalf. Now the maintainers prefer that applications integrate LLM provider APIs themselves, rather than tying model inference into the core protocol. MCP's job is to connect capabilities, not to run the whole agent runtime on the side.

## Impact on the industry: the competition shifts from "do you have it" to "can you govern it"

In the previous phase, demoing MCP usually meant showing an agent successfully calling a tool on screen. If it ran, it was easy to treat as a product highlight.

But once MCP starts connecting to internal documents, CRMs, orders, payments and customer-service systems, what enterprises care about is completely different.

They won't just ask whether it can connect. They'll ask who can use it, whether different departments' data is isolated, whether every operation can be audited, whether things recover when a server goes down, and whether a spec upgrade will break old clients along with it.

This update doesn't answer those questions automatically, but it starts filling in the structure that gateways, routing, caching, tracing and version evolution need. To me, that's the signal that it's more likely to make it into enterprise environments.

I don't think MCP will replace existing APIs. The real work is still done by the APIs, databases and services behind it. MCP is gradually becoming more like the common entrance agents use to reach those capabilities.

If things keep going this way, the difference between products won't just be whether they support MCP, but who can manage permissions, observability, compatibility and capability boundaries together.

Supporting the protocol will slowly become table stakes. How you operate it is where the competitive edge is.

## A maturing protocol doesn't make product problems go away

Looking back, statelessness makes servers easier to scale horizontally, extensions let features evolve separately, and caching and tracing add what production environments need.

But the product problems from my last essay are all still there. The protocol won't decide for you how many tools an agent should see, and it won't design your capability boundaries for you. A gateway still has to control which capabilities can be used by whom, and complex flows may still be better wrapped behind a workflow or an agent-backed MCP tool.

Put plainly, MCP now knows better how to carry these capabilities, but the product still has to decide what the agent gets to see.

## Do you need to rush to upgrade?

If you're starting a new project, I'd start directly with the new official SDKs that support `2026-07-28`. But if you already have an MCP server running in production, I wouldn't blindly upgrade the moment a new version appears. At least check these things first:

- Whether you depend on `initialize` or `Mcp-Session-Id` to keep state
- Whether you use older server-to-client flows like sampling and roots
- Whether you implement the old Tasks API
- Whether you depend on `resources/subscribe` or SSE resumability
- Whether your client correctly handles the new `resultType`
- Whether your gateway and permission layer recognize the new standard headers

Old clients and old servers don't all have to be replaced on the same day. Confirm the SDK's version negotiation and compatibility paths first and migrate gradually. That's usually much safer than tearing everything down and starting over at once.

I used to wonder whether MCP was just a protocol people would play with and then drop. After this update, I feel it can really go the distance. It didn't suddenly get better at thinking, and it didn't add some magical feature that reads your mind. What it did was remove sessions, clean up the request lifecycle, add routing, caching and tracing, and move capabilities not everyone needs into extensions.

Next time a product says it supports MCP, I'll probably ask a few more questions: can the server scale horizontally? How are different users' permissions isolated?

Once people start taking these questions seriously, MCP will have really moved from "can connect tools" to "can carry a product for the long term." If you work with MCP, I'd love to hear about the potholes you hit while upgrading 🙌



## References

- [MCP `2026-07-28` Stable Release](https://github.com/modelcontextprotocol/modelcontextprotocol/releases/tag/2026-07-28)
- [MCP `2026-07-28` Key Changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [The `2026-07-28` MCP Specification Release Candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- [MCP `2026-07-28` Specification](https://modelcontextprotocol.io/specification/2026-07-28)
- [Skills over MCP Working Group](https://modelcontextprotocol.io/community/working-groups/skills-over-mcp)
