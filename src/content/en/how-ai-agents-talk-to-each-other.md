---
original: 942b2f15bea4
title: How Do AIs Talk to Each Other? A Look at Agent Protocols
description: >-
  AI agents mostly work in isolation, each speaking its own language. Why agents
  need communication protocols, how to classify them, how MCP, A2A and ANP
  differ, and how to judge a good protocol.
tags:
  - ai
  - ai-agent
  - mcp-protocol
  - a2a-protocol
sourceHash: '1793eb7cd76d'
---

![Yang et al. "A Survey of AI Agent Protocols." (2025).](/assets/942b2f15bea4/0*Agfa7xGgPPJTimcA.png)

Yang et al. "A Survey of AI Agent Protocols." (2025).

Have you ever wondered: **when the AI assistants we use every day need to talk to each other, what language do they speak?** AI technology is already very advanced, from chatbots helping us write to voice assistants arranging our schedules, and it's being adopted everywhere. But these AI agents mostly work on their own and find it hard to cooperate. Every AI system has its own way of communicating, like a string of isolated islands.

It's like the early days of the internet, when different computer networks were incompatible and information couldn't flow, until protocols like TCP/IP and HTTP gave everyone the same standard and truly connected the global network. The AI world now faces the same critical moment: we need AIs to "speak the same language."

To solve the problem of agents communicating poorly with each other, people have started developing agent communication protocols. If these protocols can be standardized as successfully as internet protocols, we may one day build an internet of intelligence, where all kinds of AI tools and agents cooperate seamlessly and the whole is greater than the sum of its parts. Imagine AIs with different specialties forming ad hoc teams to solve complex problems, tool-type AIs supporting many agents at once, and every interaction based on the same "language." That would not only make automation more efficient but could create an entirely new model of distributed, intelligent collaboration, solving problems no single AI can handle today.
### Why do AI agents need protocols? Where does it hurt today?

As mentioned above, today's AI ecosystem is full of communication barriers. LLM-driven AI agents are powerful, but without standard communication protocols they struggle to interact smoothly with the outside world, which causes several problems:
1. **Fragmented access to tools and data**:
To let their models use tools, different AI vendors have each designed their own interfaces or formats. Having one AI check the weather and another access a database might require different prompts or APIs. Without a unified standard, developers have to adapt their code for each AI, adding a lot of hassle and maintenance cost. It's like every company's computers speaking a different dialect, talking past each other completely.
2. **Agents struggle to collaborate**:
Many future applications will need several AI agents working together (one looking at images, one handling language, cooperating on a task), but AIs from different sources or architectures can't easily talk to each other directly, since each has its own way of communicating. This ties the hands of cross-platform AI product development. OpenAI's agents, for example, can't easily talk directly to Google's, because they have no common language.
3. **Hard to extend and upgrade**:
Without a standard protocol, it's hard to scale. When a new tool or service needs to connect to an AI system, it has to be integrated separately for each AI. With a unified protocol, adding a new capability would be as easy as plugging into a universal socket; without one, each has to be adjusted individually, which is slow and error-prone.

### What is an LLM agent, and how is it better than traditional AI?

Before getting into the protocols, let's be clear on what an LLM agent is. As the name suggests, an LLM agent is an AI system that combines an LLM with the ability to act autonomously. It doesn't just answer questions passively; like a smart assistant, it can plan, decide and carry out tasks on its own. I wrote about [using OpenManus](../8918612ba642/) earlier if you're interested. The core abilities that define an LLM agent are:
1. **An LLM brain**:
At the core of an LLM agent is a powerful foundation model (a large language model like GPT-4, or a multimodal model), which I'm sure is familiar to everyone by now.
2. **Memory**:
Unlike models that answer once and forget, LLM agents have short-term and long-term memory. Short-term memory lets it remember context within a conversation; long-term memory accumulates important information over time. So it gets smarter the more you use it, using past experience to help you solve new problems.
3. **Autonomous planning**:
LLM agents are good at breaking down tasks, splitting complex work into a series of steps. Ask it to plan a trip, and it will work through the steps itself: checking flights, booking hotels, mapping out a route of sights. This planning ability makes it more organized, instead of doing things haphazardly.
4. **Tool use**:
When it hits the LLM's own limits, like math or real-time information, an LLM agent can call external tools to make up for them. If you ask "What's the weather in New York tomorrow?", it will automatically query a weather API to answer. It's as if the agent has an "external brain" that can look things up online, use a calculator, access databases and so on.
5. **Taking action**:
LLM agents can also actually take actions that affect the outside world, like sending emails through an API or issuing commands to a system. This is probably the most impressive part.


These 5 abilities make an LLM agent like a digital secretary that "can talk and also get things done on its own." That's exactly why LLM agents are widely seen as a major breakthrough in AI and one of the trends of 2025.

But as discussed above, to fully realize these abilities, the key is getting agents to cooperate, and that's exactly why we need communication protocols. However capable an agent is, if it can't get data smoothly or work with other agents, it will struggle with more complex tasks.
### What is an AI agent protocol, and how is it better than traditional interfaces?

So what is an AI agent protocol? Simply put, it's the set of rules AI agents follow when communicating with each other and interacting with external systems. It makes sure agents and tools from different vendors and architectures can communicate without barriers. You can think of it as the lingua franca of AI.

Some might ask: "Can't we just use existing APIs, graphical interfaces (GUIs) or traditional formats?" It's true that many AIs today call tools through APIs or operate web interfaces. But protocols designed specifically for AI have some clear advantages:
1. **More efficient**
APIs are fast but usually tailor-made for specific services and not flexible enough; GUIs are intuitive but designed for people, not for high-speed transfer between AIs.
2. **Cross-platform**
A good protocol should "work anywhere," whether on Windows or Linux, a phone or a server.
3. **Built for AI**
Existing formats like HTML and XML were meant for browsers or people to read, and AIs stumble over them. AI agent protocols are designed entirely around AI's characteristics, with efficient transfer and easy extension. For example, they can directly support transferring multimedia (text + images + audio), which matters a lot for how agents will communicate in the future, and which traditional APIs often can't do.
4. **The advantages of standardization**
A unified spec saves developers a ton of effort. Just as learning HTTP lets you connect to every website in the world, learning an agent protocol lets you connect AI to all kinds of tools. It also makes security management easier, since protections can be built in at the protocol layer to keep AI behavior from getting out of control.
5. **Potential for collective intelligence**
Most exciting of all, protocols make it possible for AIs to team up! When all agents speak the same language, they can form ad hoc teams, exchange knowledge, and even generate new ideas through their exchanges.


In short, with AI agent communication protocols, AIs from different systems can team up smoothly to take on challenges. But many protocols are being actively developed right now and the picture is a bit chaotic, so next let's sort out the kinds of protocols there are.
### How are protocols classified? Four types at a glance

To make sense of this emerging field, researchers classify protocols along two dimensions:

**First dimension: who they communicate with**
- **Context-oriented:** handles communication between agents and external tools or resources
- **Inter-agent:** handles conversations between agents


**Second dimension: scope of application**
- General-purpose: usable across every industry
- Domain-specific: focused on the needs of a particular industry



![Yang et al. "A Survey of AI Agent Protocols." (2025).](/assets/942b2f15bea4/1*PFPAsSiB4lN2o87rDK7Y4Q.png)

Yang et al. "A Survey of AI Agent Protocols." (2025).

Crossing the two dimensions gives four types of protocols:
1. **Context-oriented × general-purpose**
Lets every AI agent access external resources the same way. For example, MCP (Model Context Protocol), which was hugely popular in March, lets different LLM agents connect to databases or APIs in a unified format.
2. **Context-oriented × domain-specific**
Focuses on the resource-access needs of a particular industry, such as:

- The agents.json standard for websites, which makes it easier for AI to pull information from web pages (a bit like a robots.txt for AI)
- The LMOS protocol for the Internet of Things, which optimizes communication between smart devices and AI

1. **Inter-agent × general-purpose**
Lets AIs from different vendors talk directly, regardless of use case, such as:

- A2A (Agent-to-Agent), proposed by Google in April
- ANP (Agent Network Protocol), pushed by the open-source community, which aims to become the networking standard for AI

1. **Inter-agent × domain-specific**
Rules for agent conversations designed for special scenarios, such as:

- The PXP protocol: handles the format of interactions between people and AI agents
- The CrowdES protocol: focuses on coordination between robot swarms and AI


This classification makes each protocol's position clearer: some solve "how AI uses tools," others handle "how AIs team up"; some aim to be universal standards, others take a specialized route. Next, let's look at how a few of the hottest protocols are actually used.
### **The key protocols: how MCP, A2A and ANP are building an AI communication network**

As mentioned, a huge number of AI agent protocols have sprung up recently in industry and academia, so let's look at a few of the most representative:
#### **1. MCP (Model Context Protocol) | Anthropic (2024)**

MCP is arguably one of the first general-purpose protocols for letting AI agents get information from outside. Its goal is clear: let all kinds of AI agents connect in the same way to databases, tools and services, sources of knowledge and abilities the agents don't have themselves.

MCP defines a standard flow that lets an agent get the information it needs as if calling a remote service, with an authorization mechanism too (MCP combines RPC calls with OAuth authorization to keep things secure). MCP's arrival largely solved the mess of inconsistent formats when different AIs connect to tools.

For example, you might once have had to write different instructions for an OpenAI agent and an Anthropic agent to query the same database. With MCP, both can call it with the same protocol, which greatly reduces that fragmentation. And because it uses a client-server architecture, the process of an agent calling a tool is separate from the answer the user finally gets, making data transfer safer (reducing the risk of the AI handing sensitive data directly to users).
#### **2. A2A (Agent-to-Agent) | developed by Google (2025)**

As companies start deploying all kinds of AI agents internally, Google launched A2A in April to let multiple agents in an enterprise environment cooperate seamlessly. A2A's design philosophy is simple and practical. It emphasizes reusing existing web standards, using HTTP(S) as the transport layer, JSON-RPC 2.0 as the message format and Server-Sent Events (SSE) for real-time streaming.

Because it stands on the shoulders of giants, A2A has a very low barrier to learning and implementing it; anyone familiar with web development can pick it up easily. A2A also natively supports asynchronous tasks and long-running workflows. In a complex task, for example, an agent can launch subtasks and keep communicating through A2A (checking progress periodically, receiving real-time updates), which also works well for multi-round processes that need human review and feedback.

A2A is also modality-agnostic, able to pass text, files, audio and video, even embedded frames. That's extremely important, because agents often need to exchange images, audio and the like when they cooperate. In short, A2A aims to be a universal bridge between AI agents, especially suited to complex scenarios inside companies, letting agents from different sources collaborate as smoothly as colleagues while keeping security and governance in place.
#### 3. ANP (Agent Network Protocol) | driven by the open-source community (2024)

If MCP and A2A represent efforts at tool interoperability and enterprise interoperability respectively, ANP's goal is to build a truly open "internet of agents." ANP is driven by the [ANP Community](https://find-and-update.company-information.service.gov.uk/company/14212348) with a decentralized ideal. The protocol uses semantic-web technologies (like the JSON-LD format and decentralized identifiers, DIDs) to represent agents and their capabilities, aiming to let agents on any platform find each other, trust each other and communicate.

Imagine a public network of agents in the future, like today's internet, and ANP hopes to be its common language. Because ANP emphasizes interoperability across domains and platforms, it's also used for cross-domain collaboration, such as AI systems from different industries (medical AI, financial AI and so on) sharing information through ANP to make decisions together.

ANP is still in its early days, but the blueprint it draws is very far-sighted: a decentralized ecosystem of AI agents, not monopolized by any one giant, where every agent is part of the network and teams up as needed to complete tasks. It recalls the open, free spirit of when internet standards first appeared.

There are many other protocols I won't cover here. I expect that as everyone realizes how important AI communication standards are and pours resources into finding the best solution, protocols will converge from a hundred flowers blooming into a few, and along the way, how to judge a protocol will become an important question.
### What makes a good protocol? Key criteria

With so many protocols, we need some criteria to judge them. Here are a few key ones I've collected:
1. **Efficiency**: is the protocol's communication overhead low enough? Is transfer fast enough? Does it stay efficient when exchanging large volumes of messages?
2. **Security**: how does the protocol keep data secure and control access? Does it have built-in authentication and authorization?
3. **Scalability**: when the number of agents jumps from ten to tens of thousands, can the protocol still run stably?
4. **Reliability**: is communication over the protocol stable? Can it keep service up when the network is unstable?
5. **Interoperability**: can agents from different systems and frameworks really cooperate seamlessly through the protocol?
6. **Extensibility**: can the protocol be improved and gain new features as needs change without breaking older systems?
7. **Operability**: is the protocol easy to implement, deploy and maintain? Is the documentation complete?


Of course, not every scenario needs top marks on every criterion; sometimes there are trade-offs.
### Conclusion

Today's AI agent protocol ecosystem is like the competition over internet standards in the early 1990s: many contenders and an uncertain future. What's certain is that as AI applications grow explosively, protocols will only matter more.

**1. In the short term (the next 1–2 years)**: we'll see more companies and organizations join in drafting protocols. Different protocols may compete with each other, but practice will quickly show which designs work and which don't, and security and privacy will be a key area throughout.

**2. In the medium term (the next 3–5 years):** as strong protocols stand out, complete ecosystems will gradually form. Protocols will no longer be just technical specs; governing bodies, test suites, developer communities and even app marketplaces will grow up around them.

**3. In the long term (5+ years):** if all goes well, I expect AI agent protocols to eventually converge into one, or at least a few mainstream standards. By then we may have a real agent internet, where new systems of methods emerge and different AIs form a distributed brain through protocols, with the ability to solve complex problems far beyond any single AI.
### References

Anthropic. (2024). _Model context protocol_. [https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)

Google. (2025). _A2A: Agent2Agent protocol_. GitHub. [https://github.com/google/A2A](https://github.com/google/A2A)

Yang, Y., Chai, H., Song, Y., Qi, S., Wen, M., Li, N., Liao, J., Hu, H., Lin, J., Chang, G., Liu, W., Wen, Y., Yu, Y., & Zhang, W. (2025). A Survey of AI Agent Protocols.

Yang, Y., Peng, Q., Wang, J., & Zhang, W. (2024). LLM-based Multi-Agent Systems: Techniques and Business Perspectives.
