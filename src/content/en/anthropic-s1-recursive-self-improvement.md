---
original: anthropic-s1-rsi
title: Anthropic's IPO Filing Warns About Recursive Self-Improvement
description: >-
  Anthropic's S-1/A warns that future models may soon speed up AI R&D on their
  own. Here's why that risk factor reads like a flex, and whether a public company
  with a ~$895B compute bill could really hit pause.
tags:
  - Anthropic
  - AI
  - AI Agents
  - IPO
  - AI Trends
sourceHash: '8a4ff8a1b519'
---

I've been reading the amended S-1/A prospectus Anthropic filed with the US SEC ahead of its IPO, and one risk disclosure in it really stuck with me.

When a tech company writes the "Risk Factors" section of a prospectus, it usually covers financial and operational issues: fierce competition, a concentrated supply chain, cloud costs that are too high. But in a risk section nearly ninety pages long, Anthropic included a warning you'd normally only find in science fiction or on an AI safety forum. Based on their internal estimates, it says, future models may "imminently" reach what their Responsible Scaling Policy (RSP) defines as dramatic acceleration of R&D driven by AI. In other words, what people usually call Recursive Self-Improvement (RSI).

Let me be clear about what the filing actually says and where the lines are, so this doesn't turn into clickbait. Anthropic specifically states that none of the models it has released so far have crossed this threshold, and the estimate is about future models still to come. But in the same risk factors, they also admit to a very real engineering blind spot. Because they rely more and more on Claude internally to write software and handle R&D tasks, model capabilities are sometimes advancing faster than human teams can fully understand them and run safety checks. There have even been times in the past when R&D speed suddenly jumped and the team only realized it "after the fact" 😅

I just went through the "only realized afterwards that we were moving too fast" thing myself a little while ago, when I used AI agents to give Cairn a big overhaul. Back when I built features myself, my time went into typing out the code line by line, so my understanding kept pace with how fast the code grew. Now agents open branches and send PRs for me and finish a module in a few minutes. The whole bottleneck instantly moved to testing and review at the end, to the point that I dragged out the old PC I built for gaming twelve years ago to help run CI. When you let an agent change the next version of your system and it produces output faster than you can read line by line, you get this uneasy feeling. Things look like they work, but you're no longer sure which underlying assumption has quietly been changed. It's just that inside Anthropic, the thing being amplified is the next generation of the model itself.

And because this passage sits in an SEC prospectus rather than a research blog post, there's an extra, subtle layer of absurdity to it. Under US securities law, the risk factors in a prospectus are the company's body armor. The more alarming and thorough the worst cases are, the better. If a model ever really does get out of control, or a safety issue forces them to pause commercial use and the stock tanks, the company can point to this page and say, "We warned you shareholders before we went public." But in the AI industry, legal language meant to discourage investors and limit liability ends up sounding to Wall Street like the strongest possible flex of technical muscle. Telling the market in a legally binding document that "our models are about to be able to speed up their own R&D" is a safety warning that, on the capital markets, drives FOMO harder than any press release could, honestly.

The more practical conflict comes in the financial pages that follow. Anthropic is set up as a public benefit corporation (PBC), and its risk section honestly reminds investors that if a future model triggers a high-risk safety threshold, the company is obligated to pause training or delay commercial deployment, even if that directly hurts short-term revenue and the stock price. But flip ahead to the financial section of the same document, and you'll see that to support its coming compute needs, it has signed long-term purchase and lease commitments totaling about US$895.4 billion, running all the way into the 2030s and 2040s. Of that, nearly US$69.8 billion comes due in the next twelve months alone, and the minimum committed spend for Google Cloud and TPUs is over US$121.3 billion 🫠

Back when it was a private lab, the investors were a handful of VCs and tech giants, and calling a pause was already hard enough. Once it's listed, it faces public market price swings every day, has to report earnings every quarter, and carries a compute bill of nearly US$900 billion that it can't walk away from. When "self-accelerating models" make R&D run faster and faster, and every day of compute depreciation burns real money, can a public company really reach out and hit the pause button on its own just because an internal safety metric got triggered?

It reminds me of Wall Street risk management departments before the financial crisis. Every investment bank back then also had very rigorous risk models and stop-loss limits, all written into their public financial reports. But with a bull market charging ahead and every competitor piling on leverage, no chief risk officer dared to actually pull the plug on the trading floor. What usually happened in the end was that they loosened how the risk metrics were calculated a bit and let the machine keep running.

I've always really admired how much Anthropic invests in safety research. A lot of the early ideas behind the agent permissions and memory governance we're building in Cairn grew out of their research. But once this machine is so big that it has to be fed by public markets and nearly US$900 billion in compute contracts, whether they'll still be willing to hit the brakes when the time comes will be a test that goes well beyond the safety rules inside a lab. Since bringing agents into your own work, has there been a moment when you also felt "this is moving too fast, and I'm not sure I've actually looked at every line that changed"? I'd love to hear about your experiences below 🤔
