---
original: ef839026207b
title: How to Download Models from Hugging Face
description: >-
  Two ways to download models from Hugging Face, clicking to download or cloning
  with Git, plus how to fetch only the large files you need with Git LFS.
tags:
  - hugging-face
  - llm
  - transformers
  - open-source
  - developer-guides
sourceHash: '1a12868b6867'
---

![](/assets/ef839026207b/0*8rzP9mHv37OBbisX.png)


Hugging Face is an innovative company leading the way in machine learning and AI, focused on natural language processing (NLP), and best known for its famous transformers library. Hugging Face is open source under the Apache-2.0 license, which means it's free and can also be used commercially. That has encouraged collaboration and knowledge sharing across the global community and made the community very strong.

Many LLMs today are released on Hugging Face, so if you want to play with LLMs, learning how to use Hugging Face is a must.
### Step 1. Find the repository you want to download

For example, I want to download a Chinese conversational model fine-tuned from Llama 2.


![](/assets/ef839026207b/1*HrrvMxiSfCQHwkxV5Y0ZcQ.png)

### Step 2. Click "Files and versions"


![](/assets/ef839026207b/1*B-GSbPKKadvmoPeF4VrNDg.png)

### Step 3. Download

There are two ways to download a model: download directly, or use Git clone. It depends on your needs and the nature of your project. If you only need part of the model or specific files, downloading directly is a good choice. If you plan to use it long term or need the full repository, Git clone is recommended.
### Method a). Click to download

Good if you only want one specific file: just click to download it.


![](/assets/ef839026207b/1*B9aDz_fjyK0mLV3aO-ptOw.png)

### Method b). Git clone

Use git to clone the repository. Click "Clone repository" to see how to download it.


![](/assets/ef839026207b/1*TM-IiaqFjScC5H1Guui_xg.png)



![](/assets/ef839026207b/1*z0m07qkkojzt8apK-5262Q.png)


Just enter the commands above to download it easily:
```bash
git lfs install
git clone https://huggingface.co/hfl/chinese-llama-2-7b
```

You can choose to use GIT_LFS_SKIP_SMUDGE=1. This downloads only the small files; large files stored with git lfs are saved as text pointer files instead. So when there are many large files and you want to choose which to download, or network transfer is a concern, you can use this approach:
- First clone the repository as before
- Manually pull the files you want. `--include="*.bin"` means download all .bin files; change it to suit your needs

```php
git lfs install
GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/hfl/chinese-llama-2-7b
git lfs pull --include="*.bin"
```
### Error

If you get the following error when cloning:
```bash
fatal: 'lfs' appears to be a git command, but we were not
able to execute it. Maybe git-lfs is broken?
```

you need to install git-lfs. The commands below will get it working:
```typescript
sudo apt install git-lfs
git lfs install
```

With these steps, you can successfully download the models you need from Hugging Face. Hugging Face not only offers a huge library of models; it has built a strong community that supports knowledge sharing and collaboration. Whether you're a researcher, a developer or an enthusiast interested in AI, learning to use Hugging Face effectively will greatly improve your productivity and creativity in machine learning.
### Support

If this article helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!


![](/assets/ef839026207b/1*QCQqlZr6doDP-cszzpaSpw.png)
