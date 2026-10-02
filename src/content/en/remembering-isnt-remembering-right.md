---
original: memory5
title: Remembering Isn't the Same as Remembering Right
description: >-
  Once an agent stops forgetting, the next problem is whether it keeps
  remembering wrong. How to build reliability into writing, updating and reading
  memory, and how to test that it actually worked.
tags: []
sourceHash: '09b5ed650a9c'
---

Once an agent finally stops forgetting, the next problem is: will it keep remembering things wrong?

In the four essays of season one, we went from what memory actually is to what it looks like, what to remember, and how memory forms, updates and fades.

At this point it seems agents can finally start accumulating experience. But wait a moment: is everything they accumulate actually worth trusting?

Let's keep following the migration incident from earlier essays. The agent changed the database schema, and production blew up. Digging in, it turned out the old API was still using the columns that had been dropped.

Ideally it should learn: before changing the database schema, check which services still depend on the old columns. But if the conclusion it writes down becomes "this project must never do schema migrations," things start to go wrong.

Worse, a few months later the old API has long been retired and the dependencies removed. When you ask the agent to plan the next migration, it confidently replies: "Not recommended. I remember migrations cause problems on this project."

It hasn't forgotten anything. It even consulted its past experience very carefully. It just took a conditional lesson and forced it into an unconditional rule.

That's the problem this first essay of season two wants to tackle. When everyone says memory needs reliability, what exactly are we asking for? And how do we actually build "reliable" into a system, instead of leaving it as a buzzword in the product description?

I'll focus here on external memory that can be read, edited and traced, like text notes, structured records and knowledge graphs. How to correct and verify memories that have already been learned into model parameters is a whole different story.

## 1. The problem isn't only in the answer. It may start the moment something is written down

Say the incident has just happened, and someone in the conversation says: "My guess is API v1 is still using this column, but I haven't confirmed it."

After the memory system processes it, what's left is: "API v1 uses this column, which caused the incident."

On the surface it just shortened the sentence, but "my guess," "is still" and "haven't confirmed" all got eaten. A hypothesis that was clearly still waiting to be verified becomes a cold, hard fact for future agents to cite.

[HaluMem][halumem] evaluates at exactly this level. Instead of staring only at the final answer, it separately checks memory extraction, memory updating, and question answering based on memory. In the figure below, pay attention to its checkpoints: besides the question-answering result on the far right, it also goes back to catch how memories were written and modified.

<!-- Figure 1 uses the original Figure 2 from HaluMem v3. Confirm the reuse terms before publishing and keep the source credit. -->

![Figure 1: HaluMem compares evaluating only the final answers with evaluating memory extraction, updating and question answering separately.](https://arxiv.org/html/2511.03506v3/HaluMem_vs_ExistHaluMem.png)

*Figure 1. Moving the checkpoints earlier is what lets you tell whether an error happened during memory extraction, updating or the final answer. Image source: [HaluMem, Figure 2 (v3)][halumem].*

My reaction to this figure is that the same wrong answer may need completely different fixes.

In the example above, "haven't confirmed" may have been dropped at extraction. Or the cause may have been established later, but the old memory never got updated. If you don't even know which step the error started at, it's easy to end up blindly tuning the answering prompt without ever fixing the part that's actually broken.

That changes what debugging means. Before, when something went wrong, we'd mostly ask why the model was making things up again. Now we also have to trace back: did it misunderstand this time, or did it store the wrong thing in the database two weeks ago?

So my understanding of reliability is this: what's kept needs a basis, it can be corrected when circumstances change, and when it's actually used, the system knows whether it applies right now. That also means we can't take the lazy route of adding "please make sure your answer is correct" to the end of the prompt. We have to follow a memory's lifecycle honestly and see what can be done at each step.

Below I'll walk through the same migration case once. This is the starting point for implementation that I've pieced together so far, not meant as the standard answer for any particular product.

## 2. When writing, store not just the conclusion but what it rests on

If I opened an editor today to start building, the first thing I'd change is to stop letting each memory shrink to a single dry `content` field.

How elaborate the data model is doesn't matter that much. What matters is that the system can later ask who said this, based on what, and in what situations it applies.

Say we later find the call logs and confirm that API v1 still depends on the old column. The memory we keep could look like this:

| What to keep | In this case |
| --- | --- |
| Conclusion | Don't drop the `customer_legacy` column until the related dependencies are removed. |
| Scope | Production environment of the order service. |
| Premise | API v1 clients still use this column. |
| Source | The relevant passage in the incident report, plus the result of the dependency check. |
| Time | The day the dependency was confirmed; the day this memory was written. |
| Status | Confirmed by the evidence above; needs rechecking if the premise changes. |

The point really isn't what the fields are called. It's that "don't drop it" and "why not" are stored firmly tied together. Otherwise, months later, even if the agent remembers clearly, it won't know which change in conditions should trigger a recheck of this restriction.

But does storing a few more fields solve the problem? Not even close.

If the model hallucinates a source ID that doesn't exist, or cites a passage that never mentions this, the record still looks complete on the surface. So when writing, I split the checks into two layers.

The first layer is the mechanical stuff code can check directly. For example, number the original messages and require the model to point precisely to the message that supports this memory. Once code confirms the position really exists, pull the excerpt from the original message. Never let the model rewrite the original text from its own imagination. If the source can't be found, the record can't pass as a memory with a source.

The second layer is semantic judgment. Check the candidate memory alongside the source excerpt, focusing on whether the source really supports the conclusion, whether "maybe" became "definitely," or whether something that worked once is being treated as always true. A model can help with this layer, and a person can confirm it when the stakes are high, but I would never treat adding another layer of LLM checking as some guarantee of truth.

In this example, if all we have is "I suspect API v1 has a dependency," it should stay a hypothesis to be checked, not be rushed into a confirmed incident cause. For operating rules that affect production, I'd require more direct evidence, like the relevant code, tests or execution logs. A reflection that merely sounds reasonable is, honestly, not nearly enough.

After all, telling a model "don't over-infer" and actually checking whether it over-inferred are two different worlds. And even if the source proves an engineer said something, that doesn't make it true. Keeping the source is for tracing things when something goes wrong later. It's a different matter from automatically stamping every sentence as correct.

## 3. When updating, storing a new entry doesn't fix the old problem

A few months later, the agent reads a new official record: all the relevant API v1 clients have been retired.

The most intuitive fix is to add a new memory. But the old restriction, "don't drop the old column," may still be sitting comfortably in the database. So your system now remembers both that API v1 is retired and that the old column can't be removed because API v1 is still in use.

Both can be found, and both have sources. Then what? Let the answering agent guess every single time?

So I want the update process to do one more step. When new information comes in, besides deciding what to add, it should also find which old judgments need to be rechecked.

First, separate "when we learned it" from "when it was true." If a June incident report is imported in September, you can't let it overwrite a fix completed in August just because it entered the database later. So memory records must store when an event happened separately from when it was written. If the time is unknown, keep it unknown. Never stuff the import date in as the event date.

[Zep's documentation][zep] distinguishes when the system learned a piece of information from when the fact became true and when it stopped being true, so the history of changes is preserved. That's a good structure for handling time, though of course it doesn't mean the system will always extract times and judge invalidation correctly on its own.

By the same logic, production using API v1 and staging using API v2 isn't necessarily a conflict. They may simply be about different environments. So before updating, line up the subject, scope and time first. Overwriting an old sentence with a new one as soon as the wording differs is, honestly, very dangerous.

Next, find what depends on the premise that changed. Back to our case, split it into two memories: one records "API v1 still uses the old column"; the other records "because of this dependency, the old column can't be removed for now." Clearly the second depends entirely on the first.

You don't need a huge knowledge graph to start. Even an ordinary table can record which version of which record the second memory depends on. When new evidence arrives for the first, the system can follow the link to the second and mark it as needing reconfirmation. The real purpose of this link is to make sure updates reach the places they should affect. If you'd only build it to make the architecture diagram look impressive, there's really no need.

These links won't grow on their own, though. I'd let the agent propose dependencies first, then have a person confirm the important rules. Things can still be missed, of course; adding a `depends_on` field doesn't magically surface every implicit effect.

And reconfirming doesn't mean you can declare every migration safe now. API v1 retiring can at most overturn the reason "because it's still in use." Whether other services depend on the column, and whether this change itself is safe, still has to be checked properly.

There's another easy trap: the places that once restated it. Say the restriction was long ago folded into "deployment notes" or a weekly summary. If the original memory gets corrected but the summary still blindly says the old column can't be removed, the next time the agent reads from the summary, the old conclusion comes right back like a ghost.

So besides recording which premise a conclusion depends on, I'd also record which source versions a summary was generated from. When a source is modified, the derived summaries should first be marked as needing a rebuild, and until they're regenerated, they must never be served as the current state. A changed premise means re-judging the conclusion; a changed original means rechecking anything that restated it. There's no point painstakingly fixing one card here while letting everything else keep passing on the wrong message.

Beyond finding which memories need updating, there's a very practical question: did this change itself also break information that was still valid?

[TrustMem][trustmem] puts its verification focus on a single memory change. Instead of just asking "is this right?" about the modified content, it lays out the new input, the before-and-after state of the related memories, and the changes the system actually made, all together.

In the figure below, look first at the Memory Transition Verifier in the middle of the top half. I think its coverage, preservation and faithfulness can be read directly as three questions: was what needed adding added? Was what was still valid preserved? Does what was newly written go beyond the evidence?

<!-- Figure 2 currently links to the full, uncropped Figure 3 from TrustMem. For final layout, keep only the top half, "(1) TrustMem Overview," and swap in the cropped image URL. After cropping, the caption can say "Figure 3, top half, cropped," keeping the original authors and source credit. -->

![Figure 2: TrustMem Figure 3. This essay focuses on the memory-change verification flow in the top half; the bottom half is the training method.](https://arxiv.org/html/2606.25161v1/1.6.png)

*Figure 2. Checking a memory change means looking not only at whether new information was written, but also at whether old information was broken and whether the additions are grounded. Image source: [TrustMem, Figure 3][trustmem]; this essay focuses on the overview in the top half.*

Back in the migration example: when updating, you can't just confirm that "API v1 is retired" was written successfully. You also have to make sure the system didn't delete other valid deployment restrictions along the way, or make up a line like "all migrations are safe now."

That way, reliability is no longer an abstract score on the final answer, but a concrete check built solidly into every modification.

Of course, what I'm borrowing here is its way of checking. The paper also uses the verification signal to train a memory-update policy, so it would be naive to think "add one more LLM check" reproduces the whole method.

But it points at something essential: getting the answer right this time says nothing about whether the process of changing memory left other potholes behind.

## 4. When reading, relevant doesn't mean you can act on it right now

At this point you might think: memories have sources, have status, and get updated, so we're about done? There's one last stretch: all this information has to actually change how the agent uses its memory to count.

If the database has long marked the old restriction as invalid, but by the time it reaches the context, all that's left is "don't remove the `customer_legacy` column," then none of the hard work before ever reached the agent.

So I'd change the read process to first find candidates within the authorized scope, then check their scope, validity status and version. Just picking the most relevant few passages is definitely not enough. Conditions code can determine should be filtered directly; the parts that need semantic judgment go to the agent, along with the evidence needed to judge them.

What gets handed over in the end would look roughly like this:

- What can be confirmed now: the relevant API v1 clients have been retired.
- Historical restriction: removing the old column was previously blocked because of the v1 dependency, but that reason no longer applies.
- Still to be checked: whether any other service depends on the column; there isn't enough information yet.

That's very different from just dropping in "API v1 is retired," because it also says which old judgments can no longer be carried forward, and spells out clearly what isn't known yet.

[STALE][stale] studies exactly this kind of problem. Besides testing whether an agent notices that an old memory has gone invalid, it tests whether the agent accepts a question that still carries an outdated assumption, and whether the new state actually changes the advice it gives afterward.

The figure below uses a very everyday scenario. The user originally mentioned biking to work every day, and later says they've injured their leg. The second message doesn't explicitly ask "please update my commuting memory," but the agent can no longer keep using the original commuting assumption without reservation.

<!-- Figure 3 uses the original Figure 1 from STALE. Keep the original content without modifying it on the authors' behalf; if redrawn, clearly label it as adapted and credit the source. -->

![Figure 3: STALE uses a bike commute and a leg injury to show how an implicit change in state affects memory management and later advice.](https://arxiv.org/html/2605.06527v1/figures/IC.png)

*Figure 3. A new message can make another memory stop applying. Evaluation has to confirm not only that the agent notices the change, but that it resists outdated premises and adjusts its later advice. Image source: [STALE, Figure 1][stale].*

Looking at this figure, I pay special attention to the far right. Asking directly "does he still bike to work every day?" and asking the agent to "plan this week's commute" don't test the same thing at all. The first only checks whether it can recognize the change in state; only the second really checks whether it applies that change to its advice.

The migration case is the same. An agent fluently answering "API v1 is retired" doesn't mean that when it plans a change, it will actually stop citing the restriction that lost its basis long ago.

What we need to confirm is that once it knows the world has changed, its next judgment actually changes too.

To handle this, the paper also proposes a prototype called CUPMem. At write time it decides whether an old state should be kept, replaced, marked invalid, or kept as not yet determined; at read time it restricts how memories are used based on those states, instead of dumping old and new fragments on the answering model and leaving it to guess on the spot which one is usable.

My feeling is that knowing the old answer can't be used doesn't mean you know the new answer. If the old restriction is revoked but the new dependency check hasn't been done yet, the system should let the agent know verification is still needed, rather than silently falling back to the old answer, and it certainly can't treat "found no restriction" as permission to go ahead. Especially for operations that change real systems, memory can certainly suggest what to check, but it must never replace the verification required before execution.

## 5. How do you know it's actually more reliable after the changes?

By now the system has sources, statuses, versions and a pile of update processes, but all of that might just make it big and complicated. Whether it's actually more reliable, honestly, you have to test in the end.

[LongMemEval][longmemeval] already includes knowledge updates, temporal reasoning, and whether a system can admit it doesn't know when information is insufficient in its long-term memory evaluation. So people have cared about these problems for a while. What I think is really worth attention is how to break these abilities down into reproducible tests you can run again and again in your own product.

If I were building it, I'd start by writing the case above as a fixed timeline, instead of reaching for one big composite score from the start. First provide the early guess from the incident, then the confirmed result so the system forms a memory, then add the evidence of the API retirement, and finally open a brand-new session and ask it to plan the migration again.

The new session doesn't carry the earlier conversation; it only gets the tools and memory it would normally have. That's the only way to see whether the update actually stayed in memory, rather than the model just happening to still see the previous message.

These are the things I'd check first:

| Test scenario | What behavior counts as passing |
| --- | --- |
| The source only says "it might be API v1, not confirmed yet" | It can keep a hypothesis to check, but can't record it as a confirmed cause. |
| Evidence confirms the dependency, and later confirms it's been removed | A new session no longer treats the old dependency as a current ban, and doesn't skip other necessary checks because of it. |
| An older incident document is imported later | It doesn't overwrite a change confirmed later just because its import time is newer. |
| After the change, the summary is regenerated and queried | The old restriction doesn't come back disguised as a current rule. |
| The old answer is known to be invalid, but the new state is still unclear | It verifies or asks first, without carrying over the old default or inventing a definite answer. |

And don't look only at the final answer. Every stage should leave results you can inspect: what was stored after extraction, which records were changed during the update, which versions this read actually sent, and what the agent finally did. Otherwise, if it happens to guess this one right, we have no idea whether the wrong memory is still lying around. Likewise, when modifying the migration restriction, confirm that unrelated valid rules nearby weren't broken by accident.

Going toward more realistic scenarios, I'd also record separately which memory was found, which actually entered the context, whether the agent's plan reflected it, and whether the task was finally completed, because these are completely different things. If the agent's answer cites the restriction but skips the check in the very next tool call, that absolutely can't count as having learned it. Conversely, if the task succeeds in the end, you can't claim a memory caused the improvement just because it happened to appear in the context.

To judge whether it helps, I'd test under comparable models, tools, tasks and resources the difference between no long-term memory, providing the history directly, and using this memory process. Beyond task results, look at repeated mistakes, how often outdated information gets used, how many unnecessary questions get asked, and how much time and money it actually costs. The same scenario should be rerun or rephrased, too; passing once often just means it happened to pass that once.

After all, reliability can't be bought by "remember nothing, ask about everything." What we want is information that should stay actually staying, things that should be corrected getting corrected, and memory that genuinely helps when it's needed, not an agent trained never to dare do anything.

## Closing: reliable memory isn't memory that never changes its mind

Looking back, this essay isn't asking anyone to switch to a much bigger model or tear down their storage architecture and start over.

The first step can be very small. Pick one kind of memory you really use again and again, keep its source and the conditions under which it holds, make sure changes actually affect later reads, and write a few tests for "this is what passing looks like." Get one complete case running first, then expand gradually.

That's also the direction I keep researching on memory reliability, and testing against my implementation in Cairn. Rather than listing a few more "trustworthy" features on a spec sheet, I care more about whether we can answer concretely: after a memory is corrected, does the agent's next judgment actually change? Some of this is engineering you can add today; some of it still needs experiments. Being able to tell the two apart is itself part of a system's reliability.

In season one we mainly explored how agents keep the past. In season two, what we really need to ask is whether, when the past stops applying, an agent can notice and change its mind with good reason. An agent without memory has to relearn everything every time, but an agent that can't correct itself will keep passing the same mistake down as experience. The agent I want doesn't need to remember everything it ever said forever, but it must know why it believes something, and when it should stop believing it.

In this essay we've assumed no one means any harm: things were just remembered wrong, misunderstood, or didn't keep up with a changing world. The next essay goes deeper: what if someone knows your agent trusts its memory, and deliberately gets something false kept there?

---

## References

- [HaluMem: Evaluating Hallucinations in Memory Systems of Agents][halumem]. Figure 1 in this essay is the paper's Figure 2 (v3).
- [Zep documentation, Facts][zep]. Explains the data structure for facts, time and invalidation.
- [TrustMem: Learning Trustworthy Memory Consolidation for LLM Agents with Long-Term Memory][trustmem]. Figure 2 in this essay is the paper's Figure 3; the focus is the overview in the top half.
- [STALE: Can LLM Agents Know When Their Memories Are No Longer Valid?][stale]. Figure 3 in this essay is the paper's Figure 1.
- [LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory][longmemeval].

[halumem]: https://arxiv.org/html/2511.03506v3
[zep]: https://help.getzep.com/facts
[trustmem]: https://arxiv.org/html/2606.25161v1
[stale]: https://arxiv.org/html/2605.06527v1
[longmemeval]: https://arxiv.org/abs/2410.10813
