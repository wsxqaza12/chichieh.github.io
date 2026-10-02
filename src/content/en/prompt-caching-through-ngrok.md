---
original: ngrok
title: Rethinking Prompt Caching Through ngrok's Article
description: >-
  ngrok's article on prompt caching made me realize the real cost isn't the
  price per token. It's recomputing the same opening prompt hundreds of times a
  day.
tags: []
sourceHash: '31dd2d9542e4'
---

ngrok's article on prompt caching is well worth reading. When building products, I used to just calculate how much ten thousand tokens cost. Reading it made me realize that what really costs money is recomputing the same opening prompt hundreds of times a day.

It explains very clearly what gets cached inside a transformer. It's not some mysterious black magic: it stores the K/V results of attention, so the next time the same opening prompt comes in, attention doesn't have to run over it again.

For applications with long system prompts, long rules or long instructions, if you're willing to spend the time restructuring the prompt once so the reusable parts are saved, your token costs and latency can drop significantly.
Anyone building products has probably felt that helplessness: the model seems to be able to do it, but the cloud bill is just high. We've used a similar approach before, so I really recommend giving it a try. Treat low-level mechanisms like this as part of product design, instead of leaving it to the cloud provider to guess on your behalf.
https://ngrok.com/blog/prompt-caching
