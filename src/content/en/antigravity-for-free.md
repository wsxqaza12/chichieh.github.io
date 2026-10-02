---
original: antigravity白瞟
title: A New Way to Use Antigravity for Free
description: >-
  After Antigravity stopped allowing OAuth accounts, I wrote a skill that lets
  coding agents like Antigravity, Claude Code and Cursor maintain your OpenClaw
  setup, saving me about $25 a day.
tags: []
sourceHash: '6376bcc4322e'
---

Antigravity stopped letting people use the OAuth account feature a while back, and I was one of the casualties. So I recently worked out a new way to get a free ride again... using coding agents like Antigravity, Claude Code and Cursor to maintain or improve your OpenClaw setup.

The idea is simple:
Just open your coding agent in the OpenClaw directory, ~/.openclaw. Lots of people already do this.

But coding agents don't understand how OpenClaw's architecture works, so I wrote a skill that teaches a coding agent how to operate OpenClaw:
1. How to operate OpenClaw
2. Where to find the logs
3. How to schedule cron jobs and tasks
4. How to troubleshoot
5. How to modify the skills you've written yourself

That way, next time your OpenClaw breaks, or you want to change a skill, or review your cron jobs each day, you can open Antigravity with this skill and save a ton of money.

In my own testing: I bought Antigravity around Christmas last year and have two accounts, plus the daily quota from AMP Code ($10–15 a day of free Opus 4.6, though it now seems you have to wait once the spots run out). All my maintenance goes through these now, which saves me about $25 a day. After all, I've already spent over $400. I know all too well what it feels like to burn Opus 4.6 😭

And with this workflow, maintaining and improving OpenClaw runs on the full power of Opus 4.6 the whole way. For everyday conversations with OpenClaw I mostly use Sonnet, which saves quite a bit of money each day.

The skill's GitHub link is in the comments. Take it and use it.
I plan to keep maintaining it, either me or my little lobster helping out.
If I've missed anything, feel free to open an issue or just send a PR 🙏

![Opening a coding agent in the OpenClaw directory](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-12.webp)
![The skill for maintaining OpenClaw](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-13.webp)
