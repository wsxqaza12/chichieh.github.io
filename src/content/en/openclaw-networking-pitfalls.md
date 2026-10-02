---
original: openclaw網路
title: The Networking Pitfalls Beneath OpenClaw
description: >-
  If OpenClaw's Telegram channel suddenly can't send or receive and the logs say
  "Network request failed," IPv6 may be to blame. Why Node.js 22 triggers it,
  and the workaround.
tags: []
sourceHash: '8cea214de475'
---

These past few days I ran into a networking pothole deep inside OpenClaw, and I've seen others in the community hit the same thing. I'm writing it up for anyone setting up agents or automated workflows, to save you some debugging time and some money... This is the story of me paying $20 to have Opus 4.6 fix it 🤣

If you've been connecting OpenClaw's Telegram channel recently and found that messages suddenly won't send or arrive, with "Network request failed" filling the logs, don't rush to swap your token or doubt your code. It may well be IPv6's fault.

🔍 What happened?
Tracing it down, the main cause is that Node.js 22+ turns on autoSelectFamily=true by default, which makes the system try an IPv6 connection "first" when sending requests.
In practice, though, the VPSes we commonly rent (Vultr and the like) often can't reach Telegram's IPv6 endpoints. So the system sits there waiting for the IPv6 timeout before grudgingly falling back to IPv4, causing severe message delays or simply erroring out and giving up.

💡 Why is this so annoying?
When you actually put something into production, you're not chasing the flashiest architecture. Stability, maintenance cost and failure rate are what decide whether a workflow can keep running for the long haul. A low-level network timeout like this often comes with no obvious error message. If you don't dig deep into the logs, you'll be questioning your life choices. It took Opus 4.6 ages of digging to find the cause and fix it.

For people like me who run daily operations with agents as a virtual team (I've built a virtual COO, CTO and so on with OpenClaw), silent connection failures like this are a real headache.

🛠️ Current fix and workaround
If your environment happens to be stuck here, the temporary fix is to disable IPv6 at the system level:

sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1

After restarting the gateway, it should clear up instantly.

⚠️ But be careful: this is strong medicine... If your machine runs network services that rely heavily on IPv6, like Tailscale, disabling IPv6 may have side effects. So I decided to turn Tailscale off for now 🫠

There are already plenty of issues about this on OpenClaw's GitHub. I hope it pushes OpenClaw to add a family: 4 network option to its config soon, so people can specify IPv4 cleanly.

If you're also deploying your own agent team, keep an eye out for this networking pothole. And if you've been through something similar, come commiserate below 😂
