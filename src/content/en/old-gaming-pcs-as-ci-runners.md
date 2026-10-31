---
original: ci電腦
title: My Old Gaming PCs Are Now CI Runners
description: >-
  AI agents made my PRs so fast that CI became the bottleneck and GitHub Actions
  got expensive, so I pulled my twelve-year-old gaming PC and other old machines
  back into service as a home CI pool.
tags: []
sourceHash: 'ff56edf7cff0'
---

Recently I dug out the PC I built twelve years ago for gaming and put it to work running automated tests for my code.

It started because I've been using AI agents to give Cairn a big overhaul. With an agent writing code for me, opening branches and sending PRs has become ridiculously fast. Features that used to take half a day of hand-crafting now get done in a few minutes, and as a result the whole development bottleneck has flipped to CI at the end of the line. Every change has to run the automated tests and the build to make sure nothing got broken, and as the PRs piled up, GitHub Actions was sometimes burning through more than US$25 in a single day. Then I pulled my home computers in to help with the runs, and even my main machine ended up moonlighting, which meant my own development kept getting slowed down 😅

Looking for somewhere to run the tests, I started eyeing my old computers. I didn't actually keep them myself. Every time I upgraded, I handed the retired machine down to my brother, and over the years he ended up with two or three of them. Because he was looking after them, these parts I bought for gaming more than a decade ago never got thrown out or sold, and they've survived all the way to now.

I love games. Back then, every time I built a PC I kept the budget under NT$30,000, picking the CPU, graphics card and memory within that limit. Spending the money exactly where it counted was a joy in itself. The first PC I ever picked the parts for myself, twelve years ago, had an i5-4690, an R9 270 and 32GB of RAM. When I brought it back from my brother's this time, the cooler still had a sticker on it reading "103.06.08". Seeing a date in year 103 of Taiwan's Minguo calendar (that's 2014) made me pretty nostalgic. I never imagined back then that it would last this long.

Luckily my brother had kept using it. I only meant to plug it in and see what happened, but I installed Ubuntu 26.04 LTS and it booted straight into the system, none of that old-machine misery where every click hangs forever. Watching a gaming rig I built twelve years ago for under NT$30,000 run a modern OS and take on CI jobs for me is a really strange feeling. It's like getting to be happy about it all over again just because it still works. Pay once, enjoy it twice 🙌

Besides that one, I also brought out the Ryzen 5 3600 I built seven years ago. That PC lives in a be quiet! case. The parts inside have been swapped out a few times, but I've kept using the case to this day, and it was also my first time with Noctua fans XD. It was retired at the end of 2024 when the motherboard died, and only early last year did I switch my main machine to an R7 7700 on the AM5 platform. I probably never expected that, because I'm now short on compute, I'd spend NT$2,500 on momo (a big Taiwanese online store) for a B550M motherboard to bring that still-working 3600 back to work, and have it run two runners at the same time.

Once I'd sorted all this out, I realized I'd somehow put together a family-size CI worker pool. Counting it up, I've got the i5-4690, a rescued R5 3600, a Mac mini M4, an N100 mini PC with a dual-boot setup, plus my moonlighting main machine, the R7 7700. I'm building products with AI, and somehow I've ended up worrying about how to split the work across this many computers 🤣

I used to pick computers based only on whether games ran smoothly. Now what I look at is which tests a machine is suited for, whether it has enough memory to run two jobs at once, and whether I can stop tying up my main machine. That said, whether the GitHub Actions cloud bill I'm saving will all just turn into time spent hunting for parts and maintaining environments is still hard to say. Just these past few days of installing systems and wrangling environments have already made that very real 🫠

As for my newly freed-up main machine, I actually just bought a Ryzen 9 9950X to put in it. That's a whole other saga, and I'll share it with you all later!

![My twelve-year-old gaming PC](/content-images/raw/images/26d32bcf-ac1b-448e-9387-8e82eb7f8914.webp) ![An old PC back in service](/content-images/raw/images/2cccefe0-e94b-4e1d-be16-68f7773c3880.webp) ![Inside one of the old machines](/content-images/raw/images/04185179-cf4c-488a-9ffd-1ef971118bcc.webp) ![Part of the home CI pool](/content-images/raw/images/a294e157-7ce6-4597-aced-11dd50fe138a.webp)
