---
original: 2bfcc3ad8b54
title: 'Your First Open-Source Pull Request: A Beginner''s Guide'
description: >-
  From forking a project to submitting a pull request and keeping your fork in
  sync with the original. A step-by-step guide to your first open-source
  contribution.
tags:
  - open-source
  - pull-request
  - github
  - developer-guides
sourceHash: 'ad1635a58c44'
---

### Let's contribute to open source! Submitting your first PR, for beginners


![](/assets/2bfcc3ad8b54/1*GS6DD02acuBXekM1g7CQlQ.png)


A few months ago I was confused about how to start contributing to open-source projects, and I did a lot of research along the way. I've written up the whole process, from forking a project to finally submitting a pull request (PR), in the hope that it helps you submit your first PR smoothly.
### Step 1: Choose a project

First, choose an open-source project you're interested in. GitHub is a great place to find them. Choosing a beginner-friendly project matters a lot; many projects label issues `good first issue` and mention them in their `README`.
### Step 2: Fork the project

Forking means copying someone else's project into your own GitHub account, so you can make changes freely in your own version. Find the "Fork" button on the project's GitHub page and click it.


![](/assets/2bfcc3ad8b54/1*tknBGkjuzqkUxnWdmhYpNw.png)

### Step 3: Clone the project locally

Choose a working directory on your computer and clone the project you just forked with these commands:
```bash
git clone https://github.com/[your-username]/[project-name].git
cd [project-name]
```
### Step 4: Create a new branch

Before you start making changes, it's best to work on a new branch, which keeps the project tidy. Create and switch to a new branch with this command:
```css
git checkout -b [new-branch-name]
```
### Step 5: Make your changes

This is the most important step. At this stage you start actually contributing to the project. It might be fixing a bug, adding a new feature or improving the documentation. Before you start, make sure your fork is in sync with the original project; there's a guide to syncing at the bottom.
### Step 6: Commit your changes

When you're done, add your changes to your branch with the commands below. You can use
`git status` first to see which files you changed:
```sql
git add .
git commit -m "Describe your changes"
```
### Step 7: Push to your GitHub

Push your branch to GitHub with this command:
```css
git push origin [new-branch-name]
```
### Step 8: Submit a pull request

Most projects ask you to run their tests before submitting a PR. You can find the rules in the project's contributing guidelines, and it's worth reading them before you submit. Go back to the original project's GitHub page, and you'll see a button prompting you to submit a pull request. Follow these steps:
#### a) Click New Pull Request


![](/assets/2bfcc3ad8b54/1*rASXG0An110X9p5byGVTFg.png)

#### b) Choose compare across forks


![](/assets/2bfcc3ad8b54/1*KI8ejY006K6DHEDqL4Uyaw.png)

#### c) Choose your repo


![](/assets/2bfcc3ad8b54/1*GPdDqBK1ap4EBcBwoTqufQ.png)

#### d) Check your commits and click Create pull request
#### e) Fill in the issue you're solving and click Create pull request


![](/assets/2bfcc3ad8b54/1*IuXK2zBvuV7Q8re293h6Vg.png)


Once you click Create pull request, your PR is submitted to the project. Then you wait for the maintainers to review it, and there may be a few rounds of changes.
### Extra: syncing the latest code from the original project

Before you start contributing, it's important to keep your fork in sync with the original project. That avoids conflicts when your PR is merged. Here's how to sync:
#### a) Configure a remote upstream

First, set the original project as a new remote (upstream). In your forked project's directory, run the command below to add upstream. You can use `git remote -v` to check your remotes; a freshly forked project usually shows only your own origin.
```csharp
git remote add upstream https://github.com/[original-owner]/[original-project].git
```
#### b) Fetch changes from upstream

Fetch the latest changes from upstream with this command:
```sql
git fetch upstream
```
#### c) Merge into your local master branch

Make sure you're on your local master branch, then merge the upstream changes into it:
```bash
git checkout master
git merge upstream/master
```
#### d) Push the changes to your GitHub fork

Finally, push these changes to your GitHub fork:
```perl
git push origin master
```

And with that, your fork is in sync with the original project.
### Closing

Congratulations! You've just gone through submitting your first PR. The open-source community is built on mutual help and sharing, and every contribution means a lot to it. Don't be afraid of making mistakes; learning and growing are part of every open-source journey.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/2bfcc3ad8b54/1*QCQqlZr6doDP-cszzpaSpw.png)
