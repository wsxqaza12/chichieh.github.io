---
original: memory7
title: Can an Agent Learn to Manage Its Own Memory?
description: >-
  Remembering correctly isn't enough if the agent can't pick, tidy and weigh its
  notes. What recent research says about learned memory policies, and how to
  test them against the next real task.
tags: []
sourceHash: '211e02526b28'
---

The last two essays were about memory going wrong. Essay #5, "Remembering Isn't the Same as Remembering Right," looked at how an AI might record "not yet confirmed" as "settled," which is why every memory should keep its source, so it can be checked and corrected later. Essay #6, "When Memory Gets Attacked," went one step further: when someone deliberately exploits that process, a customer email claiming the boss agreed to 20% off can turn into an official term in the next quote. So working notes and company rules have to live in separate places, and permissions need one more check before anything goes out.

I'm still taking apart the fake discount email test from last time, looking at the checkpoints between reading the email and writing the quote. While testing, I've also been thinking about the next question. Suppose this time nobody has bad intentions, and every note left behind is well founded. The memory is correct and it's protected. Does the AI then become an assistant that gets easier to work with the longer you work together?

Let's keep using the same customer as our hypothetical case. Once the 20% misunderstanding is cleared up, both sides set up a meeting to confirm the next phase of the partnership. You ask the AI assistant you've worked with for months to help you prepare. It diligently digs up the past records and puts together a complete summary, down to what colors were changed on the slides last time. But where exactly the customer got stuck last time, and what has to be confirmed first this time, you still have to dig out of the summary yourself. Preparing for the meeting still ends up on your plate. 😅

If we keep working together, I'd expect it to gradually catch on to what matters and know which material to pull out before this kind of meeting. Some details don't need to come up all the time, as long as they can be found when something needs checking. Other questions deserve a spot on the prep checklist, so you don't have to ask them all over again every time. That's what this essay is about: can an agent learn to manage these memories so the next piece of work actually gets easier?

## You don't need the whole filing cabinet for today's meeting

Which slide colors the customer liked last year really does relate to this customer. So do the payment terms you couldn't agree on last time. But when you walk into the meeting room today to make decisions, those two things carry very different weight. If I asked an assistant for help, I'd never want them to haul every document that mentions this customer onto the table for me to wade through. I'd want them to first ask what we're discussing this time, then pick out the material we'll actually use.

That's the first trade-off in memory management. Whether a piece of information is worth saving and whether it should come out for today's meeting can be decided separately.

MemComposer, from October 2026, studies exactly this layer. It keeps the agent that does the work fixed and trains a separate model to assemble memory, deciding which of the candidate experiences to pick, how many, and in what order to put them in. It's trained with reinforcement learning: the model first tries different selections, then looks at whether the task turned out well, and adjusts its selection strategy accordingly.

The way I understand it, the person running the meeting hasn't changed and the old material is still there. There's just one more person learning how to pack the material for this particular meeting. The study tests specific tasks and doesn't directly verify anything like a customer meeting, but it points to a very practical place to start: even with the memory store already built, there's a lot of room to improve how you pick and order things.

Back in our meeting, the assistant this time first brings out the unconfirmed payment terms, then adds the previous version of the proposal and the related email threads. The color preferences stay in the folder until someone actually needs to edit the slides. Not appearing in this meeting's prep material doesn't mean that record should be deleted.

I make a point of keeping this distinction clear, because otherwise any talk of "learning to forget" easily turns into teaching the AI to do a big clean-out. "Not needed this time" can actually mean three ways of handling things, with completely different consequences.

- Leave it out of this meeting's prep material and grab it next time if needed
- Move it from the everyday notes to an archive, where it isn't brought up proactively but can still be found
- Delete the original record, so it can never be recovered

![The same customer's data split into three layers: what goes on the meeting table this time, what moves to the archive, and what gets its original record deleted.](/content-images/raw/images/figure-01-three-layers.webp)

*Figure 1. For the same customer's data, putting it on the table this time, moving it to the archive, and deleting the original record have very different reach.*

The first two still keep the data and only change where it shows up. Only the third actually wipes it out. We'll keep coming back to this line later when we talk about tidying up and evaluation. What we want the AI to learn today may simply be not to haul the whole filing cabinet into the meeting room.

## After a while, the notes need tidying too

Picking more accurately each time isn't enough on its own, though. Picking assumes the notes themselves are useful, and how notes get written after each piece of work is another trade-off.

After every meeting, the assistant has to decide what to keep. New information gets a new entry, anything that conflicts with older notes gets updated, things confirmed as void get deleted, and most of the small talk doesn't need recording at all. Memory-R1, from 2025, splits these into add, update, delete and no-op, uses reinforcement learning to train a dedicated memory manager to make those decisions, and then looks at how well later questions get answered to adjust the way it takes notes.

Even if each meeting gets recorded reasonably well, after a few months of working together the same matter easily ends up scattered across several notes. One time it says "payment terms to be confirmed," another time it adds the other side's internal process, and later it records a special arrangement agreed for one particular project. Each note is fine on its own, but to piece together the full context next time, a person still has to go through everything from the start.

At that point, I'd want it to go back and put together one useful customer note. For everyday meeting prep you read that one first, and when you need to confirm a detail, you follow the source back to the original record. While tidying, it can merge duplicate content and boil recurring work down into a checklist. Before this kind of meeting, for example, always confirm first what the other side needs to decide this time and which terms are still open.

But a special arrangement for one project can't become the standing practice for every future project just because it got tidied up. Even if the 20% discount from last time had been real, it would only be an exception approved for a single project. If tidying shrinks it to "this customer gets a permanent 20% discount," the exact same mistake is back, and this time it didn't even take a malicious attack.

Auto-Dreamer, from May 2026, separates day-to-day recording from consolidation across many tasks. It trains a consolidator that compares older memories with the original task logs and rewrites them into a leaner version. Figure 2(A)(B) in the paper is a good way to see this split. Block A on the left saves records during each task, and block B on the right goes back afterward to tidy up what has accumulated. When you look at the figure, just get the relationship between these two blocks. You don't need to remember the tool names inside.

![Blocks A and B of Auto-Dreamer's Figure 2: on the left, day-to-day recording for each task; on the right, offline consolidation across many tasks.](/content-images/raw/images/figure-02-auto-dreamer-ab.webp)

*Figure 2. Day-to-day recording and after-the-fact tidying are two different jobs. Original figure from Ye et al., Auto-Dreamer, Figure 2(A)(B), 2026, CC BY 4.0.*

This is a lot like how we normally work. During the meeting you get things written down clearly, and at the end of the month you go back and tidy the customer folder. The two jobs never had to be squeezed into the same moment, and duplicate problems you can't see on the spot become more obvious after they pile up a few times. In its experiments, though, Auto-Dreamer runs a round of consolidation at a fixed interval of a few tasks. It hasn't also learned *when* to consolidate, so you can't yet treat it as something you can leave to maintain any memory store on its own.

Also, not all data is a good fit for being squeezed into one short note up front. If the customer suddenly asks next month why a certain partnership term was changed back then, the back-and-forth details you never normally need become critical. So I'd still keep the original records available to look things up, and never let the tidied note become the only version.

JAM (Just-In-Time Agent Memory), from September 2026, goes in this direction. It keeps the full history, uses only a short index to help locate things, and waits until a question actually comes up to dig through and assemble what's needed. Some data is worth tidying in advance, and some details can be left as they are and read closely when needed, but you have to count the cost on both sides. Do less tidying up front and you spend more effort digging at query time. On the other hand, tidying too diligently up front can waste compute on details nobody will ever ask about. Whichever side you pick, if preparing for a meeting ends up slower than before and the only gain is neater-looking notes, honestly, it hasn't really helped.

## Tidying versus learning to tidy

At this point someone might ask: couldn't you get all this by writing a prompt that tells the AI to run it regularly? Why make a point of "learning"? True, we can just instruct it to delete duplicates and merge similar notes every week, and cobble together an automatic tidying workflow.

Approaches like this, where a person writes the rules in advance, are often called a hand-coded memory policy in the research. If it tidies by the same standard every time, and the tidying doesn't adjust even when later work gets harder or the situation changes, then all we can say is that it "does tidy." We can't say it has learned a better way to tidy.

Imagine asking an assistant to condense the customer material into one page every week. They deliver every time, and the layout looks great, but important exception terms often get cut in the condensing. As long as our acceptance criterion is still "did it fit on one page," they'll keep doing the same thing very neatly, and you'll keep fighting fires before every meeting. 🫠

For the management method to actually improve, the feedback has to connect to the results of later work. Which essential piece of information disappeared in this round of tidying? Which prep document actually saved someone from searching their email a few more times? Next time a similar meeting comes up, should the selection change? Moving from fixed rules to a learned memory policy that adjusts based on results, the real difference is whether that feedback loop gets connected back.

![On the left, tidying by fixed rules ends once it's done; on the right, the results of the next task feed back to adjust the next round of tidying and selection.](/content-images/raw/images/figure-03-feedback-loop.webp)

*Figure 3. The difference between fixed rules and management that adjusts based on results is whether the results of the next task get fed back.*

This line of research has actually been moving for a while. MemGPT, from 2023, started trying to let agents manage different tiers of memory themselves, deciding what stays in front of them and what goes into external storage for now. Memory-R1, mentioned earlier, takes another step and uses feedback from task results directly to train those decisions. In our scenario, beyond opening the folder, the assistant starts to have a chance to correct its own tidying habits based on how things went in practice.

One thing is easy to mix up here, though: notes that keep getting updated don't mean the management strategy itself keeps getting trained. Take Auto-Dreamer. It learns its way of tidying during training. Once deployed, it uses that already-trained consolidator to update memory, and the model parameters don't keep changing with each round of tidying. So when I see a system claim it tidies memory automatically, I first ask: is it running a method that's already been written or trained, or is there a process that keeps revising the method based on usage results? Both designs are useful. They just set different expectations for how much it can improve.

I also don't read "self-managing" as meaning nobody needs to set boundaries anymore. The assistant can figure out on its own how best to prepare customer material, but how long official contracts are kept and who can approve discounts still have to follow the company's hard rules. The line from last time, "the agent that reads email can't approve discounts on its own," doesn't get removed just because memory management has started learning.

## How do you know which trade-off helped?

Say we really do want to feed work results back to the assistant as feedback. How should we score it? The meeting went well and the deal was signed, so every note that got pulled out earns points, and if it fell through they all lose points? Train it like that and the system will probably learn the wrong lessons fast. The customer may not have signed simply because their budget was suddenly cut this year. If the assistant then judges this round of preparation a failure, next time it might drop steps it originally got right.

From the other direction, a note being read many times doesn't prove it's valuable either. It may just happen to keep ranking at the top of search results. If the system then gives it extra points for being read and ranks it even higher, what we end up seeing is just an ordinary note repeatedly boosting its own visibility.

Rather than looking at surface counts, I'd prefer to run a controlled experiment: temporarily hide a few notes, have the assistant redo the same test task, and see what changes in the result. Auto-Dreamer's Figure 2(D) uses exactly this kind of masking comparison to estimate whether each piece of tidied content actually helps the task, then feeds that signal into training. Content whose removal makes performance worse gets a high score, duplicate content whose removal makes no difference gets a low score, and content whose removal actually makes performance better gets penalized. This is pretty similar to how we went looking last time for the memory that made the quote go wrong. The numbers in the figure only illustrate the method. They don't mean a certain type of memory always gets that score.

![Block D of Auto-Dreamer's Figure 2: temporarily masking part of memory and comparing task results to estimate each piece's contribution.](/content-images/raw/images/figure-04-auto-dreamer-d.webp)

*Figure 4. Temporarily mask part of memory and watch how the test results change. Original figure from Ye et al., Auto-Dreamer, Figure 2(D), 2026, CC BY 4.0.*

Bring this back to meeting prep. Suppose that when you mask the reminder "payment terms not yet confirmed," the assistant keeps missing this must-ask question while preparing the prep material. That's evidence the note really is helping. On the other hand, if removing the duplicate slide color records doesn't affect the preparation at all, you can consider merging them or lowering their priority.

But making no difference when removed in one test doesn't mean it's useless forever. Take a termination clause that rarely comes into play and wasn't mentioned at all in this routine meeting. We can't delete the original record just because it didn't help score points this time. That's why I keep stressing that "doesn't need to be read this time" and "the original data doesn't need to be kept" are separate questions. Notes also often cover for each other. When note A is hidden, note B happens to say the same thing. Or the reverse: neither one means much on its own, and only side by side do they show the full constraint. So a masking comparison gives you a clue, and in practice you still need to run several rounds across different situations.

This kind of test also only belongs in an environment you can rerun. You can't deliberately leave out an important explanation in front of a real customer just to study which note works best. I'd start with the outputs the assistant is directly responsible for, such as whether the prep material lists every term still to be confirmed, and whether the draft proposal respects existing constraints. These metrics reflect the effect of the memory management approach more cleanly than whether the deal eventually closed.

## Start by grading it on the next task

At this point, there's no need to rush into training your own memory management model from scratch. Just connecting the way you tidy to the results of the next task already gives you plenty to work on. If I were trying this on my own system today, I'd first pick a recurring task, like preparing for customer meetings, and back up the memory store before any tidying.

Step one is testing selection. Leave the memory store's data untouched and keep the same working agent, and simply compare the original way of retrieving with our newly adjusted selection. Only by locking down the variables can you tell what caused the difference. Otherwise you've swapped the model, changed the data and reworked the workflow all at once, and whether things get better or worse, nobody can say which step did it.

Step two is testing maintenance. Copy the same memory store into two: one stays as is, and the other goes through the tidying process to be merged and rewritten. When tidying is done, test both against the same batch of new meeting requests. These test questions can't be leaked in advance to the model doing the tidying, or it can simply save answers for those specific questions. The new conversations you open for testing should only get the memory and tools that would normally be available, without bringing in the discussion from the tidying session. After all, sounding convincing while tidying and actually being able to find things in a fresh conversation next time are two completely different things.

![The same memory store is copied twice, one kept as is and one handed to the tidying process, then the same batch of meeting requests is run in new conversations to compare results.](/content-images/raw/images/figure-05-evaluation-copies.webp)

*Figure 5. The unchanged and tidied memory stores run the same batch of meeting requests in new conversations. The approach builds on the branch testing in Figure 2 of the last essay.*

After running the comparison, I'd look at roughly three things.

- Is meeting prep more complete, is any essential information missing, and how many times does a person still have to go back and dig through material
- Are special terms and exceptions preserved, and when something needs verifying, can you follow the links back to the original records
- Adding up the time and cost of tidying in advance and searching afterward, does the whole workflow actually get easier

Running the acceptance checks on a copy first means that if this round of tidying fails, you can always roll back to the previous version without rushing to overwrite the notes in actual use. If you find certain types of work getting worse, you can also compare the two memory stores directly and pinpoint which key piece of information got washed out in the condensing. If you later want the system to keep learning how to select memories, these comparison records are the most basic starting point. We first have to record which candidate data was available, which was actually picked, and how the work turned out, so the system can learn how to choose next time. Just telling it "nice job this time" won't teach it anything.

I'm also holding this acceptance process up against Cairn: starting with one recurring task, seeing whether memory selection and tidying really cut down on redoing work, and then gradually widening the scope. After all, adding an auto-tidy button to the interface doesn't answer this question by itself. I'm still testing the approaches above one by one, so they can't be counted as things the product already does.

Back to that customer meeting from the start, the change I'm hoping for is actually simple. Next time I ask the AI to prepare meeting material, I won't have to dig the decisions we actually need to make today out of its long summary myself. And when a special exception does come up, it has left a trail so I can always look up how it was agreed back then.

Thinking one step further: if sales, finance and customer support each have their own agent, and each one tidies up a set of customer notes it finds most useful, what happens when those memories are shared within the same team? In the final essay, we'll talk about what happens when memory goes from "mine" to "ours."

## References

Research accessed October 27, 2026. Each study's capabilities and results are limited to its own experimental setup.

- MemComposer (October 2026): https://arxiv.org/abs/2610.21091
- Auto-Dreamer (May 2026), Figures 2 and 4 are from its Figure 2, PDF page 5: https://arxiv.org/abs/2605.20616v1
- JAM / Just-In-Time Agent Memory with Runtime Agentic Research (September 2026): https://arxiv.org/abs/2609.34385
- MemGPT (2023): https://arxiv.org/abs/2310.08560
- Memory-R1 (2025): https://arxiv.org/abs/2508.19828
