---
original: 6ac4201a4cbe
title: A Guide to Prompt Engineering Techniques
description: >-
  New LLM techniques appear almost every month. A guide to 29 prompt engineering
  techniques across 12 categories, from zero-shot and chain-of-thought to
  reducing hallucination and code generation, each with its paper and diagram.
tags:
  - prompt
  - llm
  - paper
  - research
sourceHash: '2ad8405aca93'
---

### LLM techniques: a complete guide to prompt engineering

LLM optimizations and techniques keep coming, with new methods and methodologies proposed almost every month. This article introduces the various prompt engineering techniques for LLMs in different situations, each with a link to its paper and an architecture diagram for quick review, in the hope of helping you understand the latest progress and trends in prompt engineering.

The outline is shown below. Based on the recent work of [Sahoo et al. (2024)](https://arxiv.org/abs/2402.07927), it's divided into 12 parts, and I'll introduce the techniques in each:


![Sahoo et al. (2024) A Systematic Survey of Prompt Engineering in Large Language Models: Techniques and Applications.](/assets/6ac4201a4cbe/0*NiV5pUfgtxkHnPih.png)

Sahoo et al. (2024) A Systematic Survey of Prompt Engineering in Large Language Models: Techniques and Applications.
### 1. New Tasks Without Extensive Training
### 1.1 Zero-Shot Prompting

Zero-shot prompting is an important innovation in LLMs. Proposed by [Radford et al. (2019)](https://paperswithcode.com/paper/language-models-are-unsupervised-multitask), it lets us guide a model to perform new tasks through cleverly designed prompts, without large amounts of specialized training data. The model receives a description of the task rather than specific training labels or data for it. The technique relies on the model's own knowledge base, which it can draw on to respond to and make predictions about new tasks. Here's an example:

Input:
```
Classify the text into neutral, negative or positive.
Text: I think the vacation is okay.
Sentiment:
```

Output:
```
Neutral
```
### 1.2 Few-Shot Prompting

Few-shot prompting was proposed by [Brown et al. (2020)](https://arxiv.org/abs/2005.14165). Compared with zero-shot prompting, it helps the model learn a specific task by providing a few input-output examples. The paper describes how carefully selected high-quality examples can significantly improve the model's performance on complex tasks, especially compared with having no examples at all. Still, because it needs more input tokens, this approach can run into trouble with long texts. And the choice of examples is crucial to the model's final performance; poorly chosen examples can lead the model to learn imprecise or biased information.

Input:
```
A "whatpu" is a small, furry animal native to Tanzania. An example of a sentence that uses
the word whatpu is:
We were traveling in Africa and we saw these very cute whatpus.
To do a "farduddle" means to jump up and down really fast. An example of a sentence that uses
the word farduddle is:
```

Output:
```
When we won the game, we all started to farduddle in celebration.
```
### 2. Reasoning and Logic

Reasoning and logic have seen the birth of many innovative techniques that let LLMs carry out deeper, more complex thinking. Techniques like chain-of-thought (CoT), automatic chain-of-thought (Auto-CoT), self-consistency and logical CoT all aim to get models to process information in a more structured, logical way, improving the accuracy and depth of problem solving.
### **2.1 Chain-of-Thought (CoT) Prompting LLMs**

To overcome LLMs' limits on complex reasoning tasks, [Wei et al. (2022)](https://arxiv.org/abs/2201.11903) proposed an innovative method called CoT. It introduces a special prompting strategy designed to get the model to think in a more continuous, step-by-step way. Compared with traditional prompting, its main contribution is eliciting structured, carefully considered answers from LLMs more effectively.

Across a series of experiments, the technique proved uniquely useful for getting models to carry out logical reasoning, especially for deeper understanding of problems. For example, it can lay out in detail the logical steps needed to solve a complex math problem, a process very similar to how people solve problems. Using CoT, the researchers reached unprecedented accuracy, as high as 90.2%, on math and commonsense reasoning tests with the PaLM 540B model.


![Wei et al. (2022) Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.](/assets/6ac4201a4cbe/1*t3DX50EEwM2Vxe8sHIWSxA.png)

Wei et al. (2022) Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.
### 2.2 Automatic Chain-of-Thought (Auto-CoT) Prompting

Writing CoT examples by hand can improve a model's reasoning, but it's time-consuming and inefficient. To solve this, [Zhang et al. (2022)](https://arxiv.org/abs/2210.03493) proposed Auto-CoT. It automatically generates "let's think step by step" style prompts to help large language models form chains of reasoning. It focuses especially on avoiding errors that can occur within a single chain, improving overall robustness through diverse sample generation. It can produce several distinct reasoning chains for various questions and combine them into a final set of examples. This automated, diversified sampling effectively lowers error rates, makes few-shot learning more efficient and avoids the tedium of building CoT by hand. With this technique, on arithmetic and symbolic reasoning tasks with GPT-3, accuracy improved by 1.33% and 1.5% respectively over traditional CoT.


![Zhang et al. (2022) Automatic Chain of Thought Prompting in Large Language Models.](/assets/6ac4201a4cbe/1*RxFRDDE1N_8XZ6Eugn6_RA.png)

Zhang et al. (2022) Automatic Chain of Thought Prompting in Large Language Models.
### 2.3 Self-Consistency

[Wang et al. (2022)](https://arxiv.org/abs/2203.11171) proposed a new decoding strategy, self-consistency, aimed at "replacing the naive greedy decoding used in chain-of-thought prompting." Self-consistency draws several different reasoning paths from the language model's decoder, producing a variety of possible reasoning chains, then finds the most consistent answer by combining them. The strategy rests on the idea that problems requiring deep analysis usually have more reasoning paths, which increases the chance of finding the right answer.

Combining self-consistency with CoT clearly improved accuracy on several standard tests: up 17.9% on GSM8K, 11.0% on SVAMP, 12.2% on AQuA, 6.4% on StrategyQA and 3.9% on the ARC challenge.


![Wang et al. (2022) Self-Consistency Improves Chain of Thought Reasoning in Language Models.](/assets/6ac4201a4cbe/1*DPh_WlWge_EIFp0S8qhlGQ.png)

Wang et al. (2022) Self-Consistency Improves Chain of Thought Reasoning in Language Models.
### 2.4 Logical Chain-of-Thought (LogiCoT) Prompting

For LLMs, the ability to reason logically is key to answering complex, multi-step questions across domains. LogiCoT, proposed by [Zhao et al. (2023)](https://arxiv.org/abs/2309.13339), introduces a new framework compared with earlier step-by-step reasoning methods (like CoT). It draws on the essence of symbolic logic to strengthen reasoning in a more structured, orderly way. In particular, LogiCoT uses proof by contradiction, checking and correcting the model's reasoning steps by showing that a step is wrong if it leads to a contradiction. This "think-verify-revise" loop effectively reduces logical errors and incorrect assumptions. In tests with Vicuna-33b and GPT-4, LogiCoT improved reasoning significantly over traditional CoT, raising accuracy by 0.16% and 1.42% respectively on GSM8K, and by 3.15% and 2.75% on AQuA.


![Zhao et al. (2023) Enhancing Zero-Shot Chain-of-Thought Reasoning in Large Language Models through Logic.](/assets/6ac4201a4cbe/1*7-BGSDgg7Tqn6iMdJC4wGQ.png)

Zhao et al. (2023) Enhancing Zero-Shot Chain-of-Thought Reasoning in Large Language Models through Logic.
### 2.5 Chain-of-Symbol (CoS) Prompting

LLMs often struggle with tasks involving complex spatial relationships, partly because they rely on natural language, which can be vague and biased. To overcome this, [Hu et al. (2023)](https://arxiv.org/abs/2305.10276) proposed a new method, CoS. Instead of natural language, it uses simplified symbols as prompts. The advantage is that prompts become clearer and more concise, significantly improving the model's ability to handle spatial problems and making the model's workings easier for people to understand.

But CoS still faces challenges in scalability, scope of application, integration with other techniques and the interpretability of symbol-based reasoning. Notably, with CoS, ChatGPT's accuracy on the Brick World spatial task jumped from 31.8% to 92.6%. And simplifying the prompts reduced the number of symbols needed by as much as 65.8%, improving efficiency while keeping accuracy high.


![Hu et al. (2023) Chain-of-Symbol Prompting Elicits Planning in Large Langauge Models.](/assets/6ac4201a4cbe/1*iGJvAbmOExRvgqRX1fUDdQ.png)

Hu et al. (2023) Chain-of-Symbol Prompting Elicits Planning in Large Langauge Models.
### 2.6 Tree-of-Thoughts (ToT) Prompting

[Yao et al. (2023)](https://arxiv.org/abs/2305.10601) and [Long (2023)](https://arxiv.org/abs/2305.08291) proposed a new prompting framework called ToT, designed to strengthen models on complex tasks that need deep exploration and thinking ahead. ToT extends existing prompting methods by building a tree of intermediate reasoning steps, called "thoughts." Each thought is a coherent sequence of language that moves toward the final answer. This structure lets the language model deliberately evaluate thoughts based on its progress on the problem. By combining the generation and evaluation of thoughts with search algorithms (like breadth-first or depth-first search), ToT explores the reasoning process systematically. The model can expand on promising solutions or backtrack when it hits an error. On the Game of 24, ToT was especially effective, with a success rate of 74%, far above the 4% of traditional methods. It also did well on word-level tasks, with a 60% success rate, clearly above the 16% of traditional methods.


![Yao et al. (2023) Tree of Thoughts: Deliberate Problem Solving with Large Language Models.](/assets/6ac4201a4cbe/1*-uqZQkXlDuYx84DD7Mzlmw.png)

Yao et al. (2023) Tree of Thoughts: Deliberate Problem Solving with Large Language Models.
### 2.7 Graph-of-Thoughts (GoT) Prompting

Our thinking is often nonlinear rather than proceeding one step after another, which challenges methods based on traditional ToT. To address this, [Yao et al. (2023)](https://arxiv.org/abs/2305.16582) proposed an innovative graph-of-thoughts (GoT) prompting method. It simulates the nonlinear thinking of the human brain by building a graph of thoughts, letting the model jump freely between paths of thought, backtrack and integrate information. That makes it possible to think from multiple angles, breaking through the limits of linear thinking. GoT's core innovation is treating reasoning as a directed graph and supporting diverse transformations of thoughts through flexible, modular design. It not only resembles human thinking more closely but also significantly strengthens the model on complex problems. In practice, GoT shows significant gains over traditional chain-of-thought (CoT) prompting on several tasks. On GSM8K, for example, accuracy for the T5-base and T5-large models rose by 3.41% and 5.08% respectively. On ScienceQA, accuracy rose by 6.63% and 1.09% over the most advanced multimodal CoT methods.


![Yao et al. (2023) Beyond Chain-of-Thought, Effective Graph-of-Thought Reasoning in Large Language Models.](/assets/6ac4201a4cbe/1*w4EchJ6ConTlElM_JC2DfA.png)

Yao et al. (2023) Beyond Chain-of-Thought, Effective Graph-of-Thought Reasoning in Large Language Models.
### 2.8 System 2 Attention (S2A) Prompting

In LLM applications, soft attention sometimes latches onto irrelevant information, which can lower the accuracy of the model's answers. To overcome this, [Weston and Sukhbaatar (2023)](https://arxiv.org/abs/2311.11829) proposed an innovative method called S2A. By restructuring the input context, it lets the model focus on the most critical information, significantly improving the quality of information processing and the relevance of responses. S2A improves attention and answer quality through a two-stage process: first regenerating the context, then generating the answer from this refined context. It was tested on several tasks, including factual question answering, long-form generation and math problems. On factual QA, S2A reached a high accuracy of 80.3%, clearly improving factual accuracy; on long-form generation, it also improved objectivity, scoring 3.82 out of 5.


![Weston and Sukhbaatar (2023) System 2 Attention (is something you might need too).](/assets/6ac4201a4cbe/1*QABwiZ38wTsP8ylv8EuS8g.png)

Weston and Sukhbaatar (2023) System 2 Attention (is something you might need too).
### 2.9 Thread of Thought (ThoT) Prompting

ThoT, proposed by [Zhou et al. (2023)](https://arxiv.org/abs/2311.08734), is designed to improve LLMs' reasoning in complex, chaotic contexts. It imitates human thinking, analyzing a complex situation step by step by breaking it into smaller, more manageable parts. It uses a two-stage strategy: first summarizing and examining each part, then refining the information further to reach a final answer. ThoT's flexibility is a highlight, letting it serve as a versatile "plug-and-play" component that effectively improves reasoning across a range of models and prompting techniques. Tested on question-answering and conversation datasets, especially in chaotic contexts, ThoT showed significant improvements of 47.20% and 17.8% respectively.


![Zhou et al. (2023) Thread of Thought Unraveling Chaotic Contexts.](/assets/6ac4201a4cbe/1*87Uf0z4Vv5MhEeFNifvk9Q.png)

Zhou et al. (2023) Thread of Thought Unraveling Chaotic Contexts.
### 2.10 Chain-of-Table Prompting

Traditional methods like CoT, PoT and ToT mostly show their reasoning steps as free text or code, which often struggles with complex tabular data. To address this, [Wang et al. (2024)](https://arxiv.org/abs/2401.04398) developed an innovative chain-of-table prompting method. It performs table reasoning dynamically through step-by-step SQL/DataFrame operations on the table, with each iteration aiming to improve the intermediate result, strengthening the LLM's ability to predict using a chain of logical reasoning. Notably, chain-of-table prompting achieved significant gains of 8.69% and 6.72% on two standard table datasets, TabFact and WikiTQ.


![Wang et al. (2024) Chain-of-Table: Evolving Tables in the Reasoning Chain for Table Understanding.](/assets/6ac4201a4cbe/1*2pnsiQ6OU2wUIf1AnwTWNA.png)

Wang et al. (2024) Chain-of-Table: Evolving Tables in the Reasoning Chain for Table Understanding.
### 3. Reduce Hallucination

Reducing hallucination is a key challenge for LLMs. Techniques like retrieval-augmented generation (RAG), ReAct prompting and chain-of-verification (CoVe) all aim to reduce cases where LLMs produce unfounded or inaccurate output. They do this by bringing in external information retrieval, strengthening the model's ability to check itself, or adding verification steps.
### 3.1 Retrieval Augmented Generation (RAG)

LLMs have made breakthrough progress in text generation, but their reliance on limited, fixed training data limits their ability to answer accurately on tasks that need broad external knowledge. Traditional prompting can't overcome this, and retraining the model is costly. Facing this challenge, [Lewis et al. (2020)](https://arxiv.org/abs/2005.11401) proposed an innovative method called retrieval-augmented generation (RAG), offering a new solution by seamlessly integrating information retrieval into the prompting process. RAG analyzes the user's input, generates targeted queries, retrieves relevant information from a prebuilt knowledge base, then weaves the retrieved snippets into the original prompt as background context. It not only improves the novelty and accuracy of answers but, thanks to its flexibility, breaks through the limits of traditional models, bringing significant improvements to tasks that depend on up-to-date knowledge. On standard ODQA tests, RAG models outperformed seq2seq models and task-specific architectures, with exact-match scores of 56.8% on TriviaQA and 44.5% on Natural Questions.

For a detailed [introduction](../fced76fdb8b9/) to RAG and an [implementation](../d6838febf8c4/), see my other articles.
### 3.2 ReAct Prompting

Unlike earlier research that treated reasoning and acting as separate elements, [Yao et al. (2022)](https://arxiv.org/abs/2210.03629) proposed ReAct, which gives LLMs the ability to take actions as well as generate reasoning. This integrated approach creates stronger synergy between reasoning and acting, letting the model draft, track and update its action plans more effectively when something unexpected happens. ReAct has been applied to various language-processing and decision-making tasks, outperforming current state-of-the-art methods. In question answering (HotpotQA) and fact checking (Fever) in particular, ReAct interacted with a Wikipedia API to effectively counter fabricated information and error propagation, providing clearer solution paths. On interactive decision-making tasks like ALFWorld and WebShop, ReAct also performed excellently, with success rates of 34% and 10% respectively, achieved with minimal in-context examples.


![Yao et al. (2022) ReAct: Synergizing Reasoning and Acting in Language Models.](/assets/6ac4201a4cbe/1*5IFSuGyJMn-HugviFTmSDg.png)

Yao et al. (2022) ReAct: Synergizing Reasoning and Acting in Language Models.
### 3.3 Chain-of-Verification (CoVe) Prompting

To tackle hallucination, [Dhuliawala et al. (2023)](https://arxiv.org/abs/2309.11495) proposed a method called CoVe. It has four main steps:
1. Generate an initial answer
2. Plan verification questions to check the work
3. Answer those questions independently
4. Revise the initial answer based on the verification results


CoVe imitates how people verify things, improving the consistency and accuracy of large language model output. On tasks like list questions, question answering and long-form generation, CoVe effectively reduces fabricated information while ensuring the information provided is true. Through carefully designed verification questions, the model can identify and correct its own mistakes, significantly improving accuracy.


![Dhuliawala et al. (2023) Chain-of-Verification Reduces Hallucination in Large Language Models.](/assets/6ac4201a4cbe/1*scHHZJHnjpQZ_IkE48vzIw.png)

Dhuliawala et al. (2023) Chain-of-Verification Reduces Hallucination in Large Language Models.
### 3.4 Chain-of-Note (CoN) Prompting

Retrieval-augmented language models (RALMs) integrate external knowledge to reduce fabrication, but that external information isn't always accurate and can sometimes even mislead the answer. Faced with judging whether available knowledge is sufficient, standard RALMs often struggle to answer "I don't know" when precise information is missing. To solve these problems, [Yu et al. (2023)](https://arxiv.org/abs/2311.09210) proposed a new method designed to make RALMs more robust by effectively managing noisy and irrelevant documents and handling unknown scenarios accurately. CoN systematically evaluates how relevant documents are, focusing on filtering out critical, reliable information while excluding irrelevant content. That lets the model give answers that are more precise and closely tied to the context. Experiments on several open-domain QA datasets showed that CoN significantly improved exact-match scores on noisy documents, by 7.9 points on average, and raised the rate of correctly declining questions beyond the pretrained knowledge by 10.5 points, a clear gain in both performance and reliability.


![Yu et al. (2023) Chain-of-Note: Enhancing Robustness in Retrieval-Augmented Language Models.](/assets/6ac4201a4cbe/1*uVxx3RSwob30TeblzGEPtg.png)

Yu et al. (2023) Chain-of-Note: Enhancing Robustness in Retrieval-Augmented Language Models.
### 4. User Interface

This section explores how active prompting can improve interaction with users. It involves designing prompts that encourage users to provide more helpful feedback or information, for a more efficient and satisfying interaction.
### 4.1 Active Prompting

Active prompting, developed by [Diao et al. (2023)](https://arxiv.org/abs/2302.12246), aims to help LLMs adapt more effectively to various complex reasoning tasks. It introduces task-specific example prompts and CoT to improve the model's performance on complex question answering. Unlike traditional CoT, which relies on fixed samples, active prompting uses a new strategy focused on identifying and selecting the most uncertain questions, the ones most helpful to the model's progress, for annotation. Inspired by uncertainty-based active learning, it optimizes question selection by evaluating different uncertainty metrics. Across eight complex reasoning tasks, active prompting clearly outperformed the self-consistency strategy, with average improvements of 7.0% and 1.8% on the text-davinci-002 and code-davinci-002 models respectively, showing its leading results.


![Diao et al. (2023) Active Prompting with Chain-of-Thought for Large Language Models.](/assets/6ac4201a4cbe/1*Zmg55jo2aBTN54Fh3phyHQ.png)

Diao et al. (2023) Active Prompting with Chain-of-Thought for Large Language Models.
### 5. Fine-Tuning and Optimization

This part covers how to optimize the model's performance, including using machine learning to discover and apply the most effective prompting strategies, further improving LLM efficiency and accuracy.
### 5.1 Automatic Prompt Engineer (APE)

Generally, designing effective prompts for LLMs takes careful work by experts and is a complex task. But APE, proposed by [Zhou et al. (2022)](https://arxiv.org/abs/2211.01910), opens a new path for creating and selecting instructions automatically. APE breaks through the limits of manual, fixed prompts, dynamically generating and selecting the most effective prompts for a specific task. It first analyzes the user's input, designs a set of candidate instructions, then selects the best prompt through reinforcement learning, and can adapt to different situations in real time. In extensive tests on the diverse BIG-Bench suite and CoT tasks, APE proved highly effective, beating human-written prompts in most cases (19 of 24 tasks) and significantly strengthening LLM reasoning. APE's innovations give LLMs a more efficient, flexible way to handle a wider range of tasks, maximizing their potential across applications.


![Zhou et al. (2022) Large Language Models Are Human-Level Prompt Engineers.](/assets/6ac4201a4cbe/1*HY28LI5uz4CVA-Eic1g8-g.png)

Zhou et al. (2022) Large Language Models Are Human-Level Prompt Engineers.
### 6. Knowledge-Based Reasoning and Generation
### 6.1 Automatic Reasoning and Tool-use (ART)

LLMs are limited on complex tasks by their limited reasoning ability and their inability to use external tools. To address this, ART, proposed by [Paranjape et al. (2023)](https://arxiv.org/abs/2303.09014), gives LLMs the ability to reason through multi-step processes and seamlessly integrate external knowledge. ART effectively makes up for gaps in reasoning, letting LLMs handle more complex problems far beyond simple text generation. By integrating external expertise and computational tools, ART brings LLMs unprecedented versatility and practicality, letting them contribute in fields like scientific research, data analysis and decision support. ART automates reasoning steps through structured programs, removing the need for tedious manual design, and its dynamic tool integration ensures smooth cooperation with external tools. In empirical tests on two challenging benchmarks, BigBench and MMLU, ART showed excellent results, not only beating traditional prompting techniques but in some cases matching carefully hand-crafted demonstrations.


![Paranjape et al. (2023) ART: Automatic multi-step reasoning and tool-use for large language models.](/assets/6ac4201a4cbe/1*86xbBXmOt6NKb71hYk00hg.png)

Paranjape et al. (2023) ART: Automatic multi-step reasoning and tool-use for large language models.
### 7. Improving Consistency and Coherence
### 7.1 Contrastive Chain-of-Thought (CCoT) Prompting

Traditional CoT often misses an important piece: learning from mistakes. To address this, [Chia et al. (2023)](https://arxiv.org/abs/2311.09277) proposed CCoT. It guides the model by providing both correct and incorrect reasoning examples, like exploring a map that marks both the right path and the wrong turns, which is what makes CCoT distinctive. This two-sided approach was validated on reasoning benchmarks like SQuAD and COPA, prompting LLMs to reason step by step and improving by 4% to 16% over traditional CoT on strategic and mathematical reasoning. Combined with self-consistency, performance improved by about another 5%. The technique still faces challenges, though, like how to automatically generate contrasting examples for different questions, and whether it applies to natural-language tasks beyond reasoning.


![Chia et al. (2023) Contrastive Chain-of-Thought Prompting.](/assets/6ac4201a4cbe/1*kuZsftz9ZfdbfbOJ3zSlZg.png)

Chia et al. (2023) Contrastive Chain-of-Thought Prompting.
### 8. Managing Emotions and Tone
### 8.1 Emotion Prompting

LLMs show excellent performance on many tasks, but their ability to understand psychological and emotional cues still has room to improve. To address this, [Li et al. (2023)](https://arxiv.org/abs/2307.11760) proposed EmotionPrompt. Inspired by psychological research on how language affects human emotional performance, it adds 11 emotionally stimulating sentences to prompts, aiming to strengthen LLMs' emotional intelligence. Experiments show that adding these sentences significantly improves LLM performance across tasks. Specifically, EmotionPrompt achieved an 8% performance gain on instruction-learning tasks and a striking leap of up to 115% on BIG-Bench tasks, demonstrating its effectiveness in improving how LLMs handle emotional cues. In addition, an evaluation with 106 participants showed that, compared with standard prompts, EmotionPrompt improved performance, truthfulness and responsibility on creative tasks by 10.9% on average.


![Li et al. (2023) Large Language Models Understand and Can be Enhanced by Emotional Stimuli.](/assets/6ac4201a4cbe/1*peBtbEzqoxE1zKdPGeQ_Kg.png)

Li et al. (2023) Large Language Models Understand and Can be Enhanced by Emotional Stimuli.
### 9. Code Generation and Execution
### 9.1 Scratchpad Prompting

Transformer-based LLMs do well at writing code for simple programming tasks but struggle with complex, multi-step algorithmic computations that need precise reasoning. To address this, [Nye et al. (2021)](https://arxiv.org/abs/2112.00114) proposed a new approach that focuses on task design rather than modifying the model itself, introducing the idea of a "scratchpad." This strategy lets the model produce a series of intermediate steps before giving a final answer. With scratchpad prompting, the model's success rate on MBPP-aug reached 46.8%. Combined with CodeNet and single-line datasets, the model performed best, with 26.6% of final outputs correct and 24.6% of execution traces perfect. Scratchpad prompting has limits, though, including a fixed context window capped at 512 steps and heavy reliance on supervised learning to use the scratchpad effectively.


![Nye et al. (2021) Show Your Work: Scratchpads for Intermediate Computation with Language Models.](/assets/6ac4201a4cbe/1*jh44t6yGb80zzb22XH8HdQ.png)

Nye et al. (2021) Show Your Work: Scratchpads for Intermediate Computation with Language Models.
### 9.2 Program of Thoughts (PoT) Prompting

LLMs tend to make arithmetic errors, struggle with complex equations and express complex iterative processes inefficiently. To strengthen LLMs' numerical reasoning, [Chen et al. (2022)](https://arxiv.org/abs/2211.12588) proposed PoT, which encourages using an external language interpreter for the computation steps. With this approach, models like Codex can show their reasoning by executing Python programs, improving performance by about 12% on average over traditional CoT prompting on datasets including math word problems and financial questions.


![Chen et al. (2022) Program of Thoughts Prompting: Disentangling Computation from Reasoning for Numerical Reasoning Tasks.](/assets/6ac4201a4cbe/1*016SQVgVvegUyNSUr7iqYg.png)

Chen et al. (2022) Program of Thoughts Prompting: Disentangling Computation from Reasoning for Numerical Reasoning Tasks.
### 9.3 Structured Chain-of-Thought (SCoT) Prompting

The CoT approach commonly used by LLMs for code generation first produces intermediate reasoning steps in natural language before generating code. That's very effective for natural-language generation, but less accurate for code generation tasks. To address this, [Li et al. (2023)](https://arxiv.org/abs/2305.06599) proposed an innovative prompt designed specifically for code generation: SCoT. By bringing program structures (sequences, branches and loops) into the reasoning steps, SCoT significantly improves LLMs' ability to generate structured source code. It emphasizes considering requirements from the perspective of the source code, improving the efficiency of code generation markedly over traditional CoT. Its effectiveness was validated on three benchmarks (HumanEval, MBPP and MBCPP) with ChatGPT and Codex, outperforming CoT prompting by up to 13.79%.


![Li et al. (2023) Structured Chain-of-Thought Prompting for Code Generation.](/assets/6ac4201a4cbe/1*2PykGf21gFHCsa5b-I3-1Q.png)

Li et al. (2023) Structured Chain-of-Thought Prompting for Code Generation.
### 9.4 Chain-of-Code (CoC) Prompting

CoT does well at improving LLMs' semantic reasoning, but it falls short on problems that need numerical or symbolic reasoning. To address this, [Li et al. (2023)](https://arxiv.org/abs/2312.04474) proposed CoC, which aims to strengthen the model's reasoning on logical and semantic tasks through programming. CoC encourages LLMs to turn semantic subtasks into flexible pseudocode, which not only lets an interpreter identify and handle undefined behavior but also allows simulated execution through an "LMulator." Experiments show CoC beat CoT and other baselines on BIG-Bench Hard with 84% accuracy, a 12% improvement.


![Li et al. (2023) Chain of Code: Reasoning with a Language Model-Augmented Code Emulator.](/assets/6ac4201a4cbe/1*IwRmQNV8336DWxpAwonPHQ.png)

Li et al. (2023) Chain of Code: Reasoning with a Language Model-Augmented Code Emulator.
### 10. Optimization and Efficiency
### 10.1 Optimization by Prompting (OPRO)

In every field, finding the best solution usually takes constant trial and error. [Yang et al. (2023)](https://arxiv.org/abs/2309.03409) proposed an innovative idea: using LLMs to help find solutions, a method called OPRO. Its distinctive feature is that it uses LLM prompts to search for solutions step by step based on a description of the problem, letting it adapt quickly to different problems and adjust its search as needed. Through case studies of classic problems like linear regression and the traveling salesman problem, the research shows LLMs' huge potential for finding solutions. It also explores how to optimize prompts for the highest accuracy on natural-language tasks, further demonstrating how sensitive LLMs are. Prompts optimized with OPRO beat human-designed prompts by up to 8% on GSM8K and by up to 50% on some of the more challenging Big-Bench tasks.


![Yang et al. (2023) Large Language Models as Optimizers.](/assets/6ac4201a4cbe/0*u591nf0LTsVDJyqg.png)

Yang et al. (2023) Large Language Models as Optimizers.
### 11. Understanding User Intent
### 11.1 Rephrase and Respond (RaR) Prompting

[Deng et al. (2023)](https://arxiv.org/abs/2311.04205) point out that when using LLMs, we often overlook the difference between how people think and how LLMs think. To bridge this gap, they proposed a new method called RaR. It lets the LLM rephrase and expand the question within the prompt, improving its understanding of the question and the accuracy of its answer. By combining rephrasing and responding, RaR's two-step approach achieved significant gains across all kinds of tasks. The research found that, compared with questions posed casually by people, rephrased questions convey meaning more clearly and reduce ambiguity. These findings offer valuable insights for understanding and improving LLMs' effectiveness across applications.


![Deng et al. (2023) Rephrase and Respond: Let Large Language Models Ask Better Questions for Themselves.](/assets/6ac4201a4cbe/1*f1QSSBsAT3OeGDq8kN3sDA.png)

Deng et al. (2023) Rephrase and Respond: Let Large Language Models Ask Better Questions for Themselves.
### 12. Metacognition and Self-Reflection
### 12.1 Take a Step Back Prompting

To tackle complex multi-step reasoning, [Zheng et al. (2023)](https://arxiv.org/abs/2310.06117) proposed take-a-step-back prompting for advanced language models like PaLM-2L. This innovation lets the model think at a high level of abstraction, drawing basic principles and high-level concepts from specific cases. It uses a two-step process of abstraction and reasoning, and extensive experiments show that applying it to reasoning-intensive tasks like STEM, knowledge QA and multi-step reasoning significantly improves PaLM-2L's reasoning. On MMLU physics and chemistry, TimeQA and MuSiQue in particular, performance rose by 7%, 27% and 7% respectively.


![Zheng et al. (2023) Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models.](/assets/6ac4201a4cbe/1*s5KSd3fAOwOiArdeO7yz-A.png)

Zheng et al. (2023) Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models.
### Conclusion

In LLMs, prompt engineering has become a game-changing force, offering new ways to unlock what LLMs can do. Above we've gathered 29 different prompting techniques, organized by their distinct goals, in the hope of helping you understand them and choose the right prompt for you.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/6ac4201a4cbe/1*QCQqlZr6doDP-cszzpaSpw.png)
