---
original: 龍蝦-line-經驗
title: Four Pitfalls of Connecting OpenClaw to LINE
description: >-
  Connecting a new OpenClaw agent to a LINE channel took me through four big
  pitfalls, from broken multi-account routing to a model silently switching to
  Opus and a provider stuck restarting. What happened and how to avoid them.
tags: []
sourceHash: 'f750ac8483ab'
---

Last time I shared the Telegram IPv6 networking pothole. This time it's LINE's turn 😂 Over the past few days I built a new agent on OpenClaw for a LINE channel, and stepped into so many potholes I started questioning my life choices. Here are the four problems I hit, in the hope of saving anyone else connecting LINE a bit of debugging time... and some money...

---

🐛 Pitfall 1: multi-account webhook routing breaks, and every message goes to the main agent

This was fixed early on, but I still ran into the same problem, which was frankly supernatural. Reinstalling the gateway finally fixed it.

I set up two LINE bots, one default and one secondary, each bound to a different agent. The webhook paths were split too (/line/webhook and /line/secondary). The logs showed both providers starting correctly, and the webhooks were receiving messages.

But no matter which bot you messaged, the session was always created on :main, and the default agent always replied. The weirdest part: the reply really was sent from the secondary bot's LINE account (the right token was used), but the agent's personality and workspace were all the default's.

Simply put, the accountId was passed correctly on the LINE API side, but when OpenClaw internally resolved the agent route, the accountId never got passed in, so it always fell back to the default main agent.

---

🐛 Pitfall 2: the model on LINE silently switches, and the bill takes off 💸

Reinstalling the gateway fixed the problem above, but I hit another one. Talking to the same session through WebChat, the model was correct (GPT-5-nano, which I'd set in the agent). But as soon as the conversation came in through LINE, the model silently switched back to main's default, Opus 4.6. The prompt was fine, though.

This one is really hard to spot, because OpenClaw's replies sound right (the prompt hadn't drifted), while underneath it's actually running the main agent's default model. In my case main defaulted to Opus, I'd left it for my family to play with, and by noon I checked the bill and it had shot up to $15 before I realized something was wrong 😱

⚠️ If your OpenClaw starts replying strangely, the first thing to check is whether the session's model setting has switched. The path is usually:

```
.openclaw/agents/<your-agent>/sessions/sessions.json
```

Check that the model field is the one you set. Honestly, I still don't know why this happens. My current guess is that I'd been telling the LINE agent to use tool-use approaches like Gemini CLI, which GPT-5-nano doesn't support, so it changed the model setting on its own. After switching to GPT-5-mini it hasn't happened again, but I changed quite a few other things in between, so I'm not sure that's the reason.

---

🐛 Pitfall 3: mentionPatterns does nothing in groups

I added OpenClaw to a LINE group and wanted it to reply only when someone @mentioned it or used a particular keyword, so I set requireMention and mentionPatterns.

But no matter who said what in the group, OpenClaw jumped in to reply, completely ignoring the mention settings 😅
A smarter model can tell whether it's being addressed, but every one of those judgments burns tokens. That's how the bill flew all the way to $25. Even with historyLimit=10 set, it didn't help: every time someone spoke in the LINE group, token usage kept stacking up, until a single message cost $0.50.

When I traced the cause, there were two layers to the problem. First, LINE wasn't registered in the channel DOCKS object at all, so the framework didn't know LINE supports mention gating. Second, LINE's inbound message flow skipped the mention-check logic entirely when handling group messages.

If you only use it one-on-one in private messages, it doesn't matter. But if you want to drop OpenClaw into a group as an assistant and the model isn't smart enough, it becomes the group's chatterbox, replying to every message, and your groupmates will lose their minds 🤣 So will you, when you see the bill...

📌 Issue: https://github.com/openclaw/openclaw/issues/16975

---

🐛 Pitfall 4: the LINE provider restarts forever and is unusable

This was the most troublesome and the strangest. After the LINE channel starts, there's no error at all, but the log keeps showing:

```
[line] [default] starting LINE provider (Bot Name)
[line] [default] auto-restart attempt 1/10 in 5s
[line] [default] auto-restart attempt 2/10 in 11s
...
```

The provider keeps restarting, with exponential backoff waiting longer and longer. LINE mostly works fine, though; it just keeps restarting.

The root cause is that OpenClaw's gateway framework expects startAccount to return a "long-lived" Promise (one that doesn't resolve until shutdown). Telegram's long-polling naturally blocks, but LINE uses webhooks: once the HTTP route is set up, the function returns right away (in about 4 ms), so the gateway thinks "the provider died" and triggers an automatic restart.

I eventually found an issue where someone had submitted a PR to fix it. The fix adds an await in monitorLineProvider that waits for the abortSignal before resolving, keeping the Promise pending until the gateway actively sends a shutdown signal. It hasn't been merged into a release yet.


📌 Issue: https://github.com/openclaw/openclaw/issues/20573
📌 PR (fixed): https://github.com/openclaw/openclaw/pull/23621

---


Overall, LINE has fewer users, and its integration in OpenClaw isn't as mature as Telegram's, so the odds of hitting potholes are pretty high. The good news is the community is still very active: all of these problems have issues tracking them, and some already have PRs fixing them.

If you're also connecting OpenClaw to LINE, a few suggestions:
1. The multi-account routing problem is officially fixed, but the model switching still happens. Check the model setting in sessions.json regularly.
2. Mention gating in groups doesn't work for LINE right now. Don't add OpenClaw to groups yet, or it'll turn into a message-bombing machine.
3. The infinite provider restarts already have a PR fixing them. Keep an eye on whether it's merged, or patch it by hand.
4. Most important: keep an eye on the bill when raising your lobster. Opus really does burn money once it gets going 🔥

That's raising a lobster for you: it looks cool, but there are plenty of potholes 😂 If you've hit other problems connecting LINE, come share in the comments!
