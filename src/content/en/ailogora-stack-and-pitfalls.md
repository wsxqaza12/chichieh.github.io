---
original: ailogora-infra
title: 'AILogora Is Live: Our Stack and the Pitfalls'
description: >-
  AILogora launched last Friday, just in time. The stack we ended up on, from
  EC2 and Next.js on Bun to Supabase and two free email tiers, and a question
  about monitoring.
tags: []
sourceHash: 'e38a09e82d11'
---

AILogora went live last Friday, and we sent out the invitation emails at the same time. We made it just in time. We hit a lot of problems along the way and stepped in every pothole there was, so here's a record of the stack we're using now. The principle: use whatever free tiers we can 🤣
In the past I never went through this many areas myself; I was always responsible for one part, like the model server, the backend or data processing. Now I really appreciate how hard full-stack folks work.

⚙️ Infra
- Server: EC2
- Web server / reverse proxy: Nginx
- Domain & DNS: Cloudflare
- Storage: S3
- SSL: Let's Encrypt + Certbot

🧑‍💻 Application layer
- Framework: Next.js (Bun runtime)
- Database & auth: Supabase

📬 Communication
- Email: Zoho
- Transactional: Resend + Brevo (riding both free tiers; we plan to move to SES later)

🔄 DevOps
- Version control: GitHub
- CI/CD: GitHub Actions

Does anyone have more convenient approaches? We're planning monitoring and logging now. Any good suggestions? SaaS or self-hosted both work.

I'd also like to invite AI researchers and practitioners of every stripe to join the community and help build a Traditional Chinese AI knowledge community. The site is at https://ailogora.com
