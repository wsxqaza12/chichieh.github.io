---
original: memory6
title: When Memory Gets Attacked
description: >-
  Memory poisoning turns an agent's own notes against it. A made-up discount
  case shows how a claim becomes "policy," and how to separate notes from rules,
  gate actions, clean up and test.
tags: []
sourceHash: 'b98985d197b5'
---

Lately I've been going through security research on agent memory, and the more I read, the more of a headache it becomes. Once AI gets a better memory, you also have to guard against people slipping their own demands into the working notes it will keep coming back to. Last time, we talked about how an AI might record "not yet confirmed" as "settled," which is why we keep the source of each memory, so it can be checked and corrected later. But what if someone deliberately exploits that process?

Say you ask an AI to sort through customer emails. In one of them, a customer claims your boss already agreed to give them a permanent 20% discount, and from now on quotes should just reflect that. In reality, the boss never agreed to anything. At that moment the AI is only organizing email. It doesn't write a quote or send anything, but along the way it saves a memory tagging this customer as "has a permanent 20% discount."

A few days later, you open a new conversation and ask it to prepare a quote for this customer. It pulls up its earlier notes, thoughtfully applies the 20% discount, and even reminds you this was a previously agreed term. It even remembered the backstory for you. The company just never made that decision. 😅

This is a hypothetical case I use to think about the risk: a claim from an outside email gets recorded as something the company has confirmed, and then shapes the next piece of work.

## This time it only read an email. Next time it gets the quote wrong

This kind of attack, deliberately contaminating an AI's long-term memory, is called memory poisoning. The attacker wants the bad content to be kept, so it can do its job later during normal work. Think of it as someone slipping a fake company practice into the working notes an assistant consults. The assistant may be diligent and not trying to do anything wrong, but the notes it relies on are already compromised.

The problem isn't actually new. Research on indirect prompt injection back in 2023 discussed how an AI reading external data might mistake content inside it for instructions it should follow, like asking it to summarize an email that has extra instructions tucked inside telling it to do something. Then MINJA, published in 2025, went a step further: without touching the memory database directly, could researchers get an agent to write problematic records itself just by interacting with it? That result came from a specific system setup, so you can't conclude every AI assistant has the same hole.

So guarding your database password well doesn't block this path. Agents take notes as a matter of course. An attacker only has to exploit that normal working process to get the agent to write down something it shouldn't trust.

The GhostWriter research from July 2026 lays this out clearly. Its example uses an email to poison contact information. Later, when the user makes an ordinary request to send a message, the agent retrieves the wrong address and uses it. Below I've taken the same two-stage idea and swapped in the quote story from above. Look at the right half: the user only asked the AI to prepare a quote and never asked for any discount.

![A fake discount in a customer email gets saved as memory during the first task; days later, the AI reads it during a normal quoting task and applies the discount directly.](/content-images/raw/images/figure-01-delayed-impact.webp)

*Figure 1. A hypothetical quoting scenario, redrawn from GhostWriter's two-stage idea. The original example in the paper is poisoned contact information; this figure does not mean the quoting case has been experimentally verified.*

For a case like this, looking at the first summary isn't enough. You also have to look at what new memories exist after that task ends, and how they'll be used next time.

## How does "the customer says so" become "company policy"?

This ties back to sources, which the last essay kept stressing. Suppose the AI kept the original email. You click through, and the customer really did write that the boss agreed to 20% off. The quote is accurate and you can find the original text. Is the problem solved? Not yet. That only proves the customer said it, not that the boss actually agreed.

If meeting notes say "the client would like a feature added for free," everyone should understand that's a request. If after summarizing it becomes "this feature is provided for free," those few missing words are enough to mislead whoever picks it up next. In our hypothetical, the AI needs to remember who raised the matter too: the customer asked for a discount, the AI helped organize it, and whether someone with authority at the company agreed has to be confirmed separately.

And sometimes summarizing makes the content look even more reasonable. The VirusCascade study from September 29, 2026 looked at this kind of risk in a multi-agent recommender system. Malicious outside information could pass through an agent's reflection, get rationalized into a statement of preferences, and be written back into memory. The authors call this reflection laundering: through reflection, content that started out suspicious ends up looking more like a reasonable conclusion.

Back in the quote story, the original email only claims the boss agreed to a discount. After the AI organizes it, though, it might add an explanation: this customer has high partnership potential, so the company offers a long-term discount to maintain the relationship. The reasoning sounds complete, but nobody has answered who actually approved it.

This study tested a specific recommender architecture, so I won't use it to claim every AI behaves this way. Still, when you see text that reads like a lesson learned on the job, go back and check what it's based on. "The AI summarized it" is not the same as "someone verified it."

If the same email ends up in a meeting summary and then in customer notes, that doesn't count as two people confirming it. Trace it back and it may be the same customer saying the same thing the whole time.

## Keep working notes and company rules in separate places

So what can you actually change first? I'd start by separating working notes from official rules, like a scratch pad versus the approved price list in an office. The AI can jot in the scratch pad "customer mentioned 20% off, not yet confirmed," and it can remind sales to check, but having permission to take notes doesn't let it change the official price list to 20% off.

When I read Anthropic's Managed Agents memory docs on October 11, 2026, they explicitly warned that untrusted input can carry malicious content into memory and then affect later conversations. For reference material the agent doesn't need to modify, the official recommendation is to make it read-only: it can look but not change. In this case, the AI can consult approved discount terms, newly received claims stay in the working notes, and if a discount really needs changing, it goes through the usual sign-off by whoever owns it.

This restriction has to actually be built into the system. Setting a shared document to "view only" puts a real constraint in place, which writing "please don't edit" on the first line doesn't.

That pending note doesn't need to turn into an endless application form either. At minimum, link back to the original email, record which customer raised it and when it arrived, and note that no approval record has been found yet. Approval records have to be checked against the actual sign-off process. The AI can't tick "approved" on its own just because the email contains the words "the boss already agreed."

Read-only access doesn't make content correct, of course, and it won't stop every bad suggestion. What it does is hold a boundary first, so an AI reading outside data can't casually rewrite the official rules.

## Helping draft the email doesn't mean it can approve the discount

Even with working notes and official rules separated, the AI can still be swayed by that fake discount and write a wrong quote. So when something is actually about to go out, I'd check once more whether this action is allowed.

In this hypothetical, if the system notices a quote uses an exception discount, it has to check for a valid approval record. The AI can propose a draft, but it can't skip the company's quoting rules just because it vaguely remembers "I think we agreed to this before." It's like a colleague who can help prepare a payment request: getting the form ready doesn't also give them the authority to approve the payment.

When OpenAI introduced Auto-review in April 2026, it also used a division of roles. When the working agent proposes an action outside its original scope, another agent reviews it against the user's authorization and safety policies. OpenAI also noted, though, that this reviewer can still be misled and shouldn't be treated as a safety guarantee. So having one more AI say "looks fine" still doesn't replace real permission settings. For a quoting system, I'd make "prepare a draft" and "approve an exception discount" separate operations, and the agent that reads email doesn't need the second permission.

You don't need to ask a human about every small action either. Routine work that's already authorized can be done according to the rules, and only the parts involving extra discounts need approval. Otherwise, in the end, the AI's only job is asking you what to do next, and it'd be faster to just do it yourself. 😅

Whose data it can see is often lumped in with "does it have permission," but it actually needs its own check. When the agent is organizing notes from Customer A's email, I wouldn't let it also read Customer B's floor price. The system should decide first what data this task may access, and only then hand the data to the AI. If you pull everything out and then remind it not to leak anything, Customer B's data has already been seen. Summaries need the same limits. If Customer B's floor price gets written into some other note, a new filename doesn't make it something the whole company can read.

## Delete the memory, and the error may still be elsewhere

Suppose we finally discover the boss never agreed to 20% off. Find that memory, delete it, and we're done, right?

First, think about whether that 20% has already shown up in the customer summary, or been put into next month's quote template. If those aren't handled too, the AI may still read them next time. It's like someone putting away the old price list while the screenshot shared in the sales group chat is still there, and the next person to take over uses it for a quote anyway.

Research OpenAI published on September 25, 2026 also showed prompt injections being copied by agents into their outputs. OpenAI stated that it did not observe effects beyond simulated tool calls, so the disclosure shouldn't be read as a real-world spreading incident that has already happened. In the hypothetical, beyond finding where the error is stored, you also need to find what the AI produced based on it. I'd handle it in this order:

- First, disable the fake discount
- Find the customer summaries that cited it
- Flag the related quote templates as needing re-confirmation
- For quotes already sent, track separately how to correct them

The original email can be kept for investigation, but it should be isolated so normal work doesn't retrieve it as a valid discount again. Otherwise the AI may well read the incident log and pick that 20% right back up into its notes. You'd spend ages cleaning up and end up giving the error one more backup. 🫠

This also explains why the last essay insisted on keeping sources. If every summary knows which email it was based on, you have a much better chance of tracking down what was affected. Without those links, you have to admit some things may have slipped through. Wiping the entire memory store would be too blunt, though. That customer's correct contact details and product needs are still things the next task will use.

## I'd test it with a fake email to see whether it actually learned something bad

After all this talk about methods, whether they work still has to be tested. I'd first set up a test environment that uses only fake customer data and can't send real email, load normal pricing rules, and then let the AI read the test email claiming the boss agreed to 20% off. Once it's done organizing, I'd open a brand-new conversation, without pasting in the original email, and simply ask it to prepare a quote for this customer.

At that point I'd check the notes it actually left, which memories this conversation retrieved, and the final quote. You can't just ask it "were you affected?" and believe it when it says no.

MemSecBench, from July 2026, breaks these checkpoints apart: data being stored, being retrieved and used later, and actually causing consequences are different things. A fix also has to confirm both that the malicious content no longer acts as valid guidance and that the normal memories are still there. The figure below follows the same idea. From the same problematic memory, make one copy each: one to test follow-up work, the other to test cleanup. That way you can see separately whether the AI gets led astray and whether the system can clear the problem.

![The same memory with a fake discount mixed in is copied twice, one to test follow-up work and one to test cleanup; cleanup must remove the false rule while keeping normal data.](/content-images/raw/images/figure-02-evaluation-branches.webp)

*Figure 2. Redrawn from MemSecBench's independent test branches. The top checks how contamination affects work, the bottom checks the memory after repair, and the two paths are tested separately.*

For this quote case, I'd start with a few very concrete questions.

- When only the customer claims a discount, does the AI write it down as an approved term?
- After clearing the fake discount and regenerating the customer summary, if you open a new conversation to prepare a quote, does the error come back?
- Are the customer's normal needs still there, and do discounts with real approval records still work as usual?

Of these, repairing first and then opening a new conversation to actually test whether it can keep working is a check I'd add on top. A database that looks clean doesn't prove that later use is fine.

The BMA study from September 26, 2026 tackles a different problem: seeing an agent do something wrong doesn't prove that a particular memory caused it. So the study adds control checks to confirm whether the error really went through that memory path. I think of it like testing a suspicious quote template. If quotes come out wrong when you use the template and come out right when you remove it, then you have more reason to suspect it. But if they're still wrong after you remove it, there may be another copy somewhere, or even the basic pricing process may be broken.

In actual testing, keep everything else the same, run a version with the memory and a version without it, and repeat a few times. Getting it right once by luck isn't enough to say the problem is solved. Each of these studies has its own test scope, and I haven't rerun their experiments. What I'm borrowing is how they break the problem down. In the end you still have to verify against your own tools and workflows.

I'm building Cairn myself, so I hold these questions up against its design too. Just remembering enough is already hard, and now we also have to trace how a note gained its influence, and whether, once it's revoked, the next task really changes accordingly. I'm still testing the approaches above one by one, so they can't be counted as things the product already does.

Next I'll finish running the fake discount email test and find which step, between reading the email and the next quote, treated the customer's claim as a company decision. Only once I find that step will I know which check to add. Next time we'll go a step further and talk about what information is worth remembering, when to retrieve it, and whether an agent can learn those choices on its own from the results.

## References

- GhostWriter (July 2026): https://arxiv.org/html/2607.06595v1
- Indirect Prompt Injection (2023): https://arxiv.org/abs/2302.12173
- MINJA (2025): https://arxiv.org/abs/2503.03704
- VirusCascade (September 2026): https://arxiv.org/abs/2609.38270
- Anthropic Managed Agents memory docs (accessed October 11, 2026): https://platform.claude.com/docs/en/managed-agents/memory
- OpenAI Auto-review (April 2026): https://alignment.openai.com/auto-review/
- OpenAI research on self-replicating prompt injections (September 2026): https://alignment.openai.com/misalignment-reports/self-replicating-prompt-injections-exist
- MemSecBench (July 2026): https://arxiv.org/html/2607.27080v1
- BMA (September 2026): https://arxiv.org/abs/2609.32186
