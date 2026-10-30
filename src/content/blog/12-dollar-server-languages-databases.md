---
author: Nikola Ovcharski
pubDatetime: 2026-10-30T18:00:00Z
title: "Pick Your Stack, Not Your Server: 8 Languages, 4 Databases, 1 Tiny VPS"
postSlug: 12-dollar-server-languages-databases
featured: false
draft: false
tags:
  - backend
  - performance
  - databases
  - YouTube
description: "Arjay McCandless load-tested 8 backend languages and 4 databases on a $12 VPS. Rust and Go topped 6,500 users, but SQLite nearly doubled what Postgres could do."
---

Every few months the internet reignites the same argument: _which backend language is fastest?_ Benchmarks fly, Rust fans and Go fans trade charts, and someone inevitably reminds everyone that PHP still runs half the web.

Most of those benchmarks, though, run on beefy machines with a "hello world" endpoint. That tells you very little about the thing you actually care about: **how many real users can my app serve before it falls over, and how much does my choice of stack change that number?**

Developer and YouTuber **Arjay McCandless** decided to answer it the hard way. He took one of the cheapest servers you can rent, a **$12 a month VPS**, and threw thousands of simulated users at it. Twice. First to pit eight programming languages against each other, then to find out whether the database was the real culprit.

## Table of contents

## The arena

The hardware is deliberately modest:

| Resource | Spec          |
| -------- | ------------- |
| CPU      | 1 shared vCPU |
| RAM      | 2 GB          |
| Storage  | 50 GB         |
| Price    | $12 / month   |

On top of it runs a **Twitter-style API**, seeded with a realistic amount of data:

- **50,000** users
- **500,000** posts
- **2,000,000** likes

The load comes from **[k6](https://k6.io/)**, which ramps up virtual users browsing the app until the server cracks. "Cracks" has a precise definition here: a stack passes a level only if it holds **p95 latency under 500 ms, p99 under 1 second, and errors under 1%** for a full five minutes. The API, the data, the Nginx setup and the server stay identical across every run. Only the language (and later, the database) changes.

So, can a $12 box really handle thousands of concurrent users? Spoiler: yes, comfortably. The more interesting question is _which_ thousands, and why the answer has less to do with your favourite language than you might think.

## Round 1: the language showdown

<div style="position: relative; aspect-ratio: 16 / 9; width: 100%;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/sQXFhh_PiG4"
    title="Which Programming Language Can Handle the Most Users on a $12 Server? by Arjay McCandless"
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
    loading="lazy"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen></iframe>
</div>

Eight backends, each built with a popular framework and run with its default, out-of-the-box configuration, all talking to the same PostgreSQL database. Here is how many concurrent users each one held before breaking the latency or error limits:

| Rank | Stack              | Max concurrent users | vs Node.js |
| ---- | ------------------ | -------------------- | ---------- |
| 1    | Rust (Axum, SQLx)  | ~6,900               | 2.1×       |
| 2    | Go                 | ~6,500               | 2.0×       |
| 3    | Java (Spring Boot) | ~5,100               | 1.6×       |
| 4    | C# (ASP.NET Core)  | ~4,400               | 1.4×       |
| 5    | Bun                | ~4,200               | 1.3×       |
| 6    | Node.js (Express)  | ~3,250               | baseline   |
| 7    | Python (FastAPI)   | ~2,150               | 0.66×      |
| 8    | PHP (Laravel)      | ~750                 | 0.23×      |

That is a **9× spread** between first and last place, on identical hardware, serving identical data. So yes, the language matters. But look closer and the story gets more interesting.

### What the numbers are really saying

**Rust and Go are practically tied.** Rust wins by about 6%, which is well within "it depends on how you wrote it" territory. Both compile to native code, both have very lean HTTP stacks, and both use tiny amounts of memory per request. On a 2 GB box that last part matters a lot.

**Java and C# are far from slow.** The JVM and .NET runtimes have a reputation for being heavy, and on 2 GB of RAM you would expect them to suffer. Instead Spring Boot and ASP.NET Core land comfortably ahead of Node. Once their JIT compilers warm up, they run hot code very close to native speed.

**Bun is the cheapest upgrade on the list.** Same JavaScript, same mental model, roughly **30% more users** than Node with Express. If you already have a Node API, this is about the lowest-effort performance win you can get: swap the runtime, run your tests, and see if anything breaks.

**Python is respectable, not fast.** FastAPI is async and modern, but it still runs on CPython, and a single shared vCPU gives the interpreter nowhere to hide. Two thousand concurrent users is still plenty for most side projects and a good number of real businesses.

**Laravel pays a tax on every request.** PHP's classic model boots the framework from scratch for each request: load the service container, register providers, resolve the route, and only then run your code. On a heavy page that overhead disappears into the noise. On a small JSON endpoint like "get a post and its like count," the boot cost _is_ most of the request. That is why Laravel sits at the bottom with ~750 users.

The video does not stop there, though. Arjay also tries **Laravel Octane**, which keeps the framework booted in memory between requests, and **bare PHP** without a framework. [TODO Nik: add the Octane and bare PHP numbers from the video.] Keeping the framework warm attacks exactly the overhead described above, so if you run Laravel in production and haven't looked at Octane, this is your sign.

### The twist: the server wasn't busy running Go

When Arjay looked at what the CPU was actually doing during the Go and Rust runs, the application wasn't the main consumer. **PostgreSQL was eating roughly 60% of the CPU.**

That changes how you read the top of the table. Rust and Go didn't hit a language ceiling. They got so efficient that the database became the bottleneck. Making Rust any faster would barely move the number, because most of the CPU time wasn't spent in Rust.

Which raises the obvious follow-up question.

## Round 2: the database showdown

<div style="position: relative; aspect-ratio: 16 / 9; width: 100%;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/_M2-Dw4DpsE"
    title="I Ran 4 Databases on the Same $12 Server by Arjay McCandless"
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
    loading="lazy"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen></iframe>
</div>

For the second experiment, Arjay kept the **Go API**, the same data, the same SQL and the same $12 server, and swapped only the database. The pass criteria stayed the same: p95 under 500 ms, p99 under 1 second, under 1% errors, sustained for five minutes.

| Rank | Database          | Max concurrent users | vs PostgreSQL |
| ---- | ----------------- | -------------------- | ------------- |
| 1    | SQLite (WAL mode) | ~11,750              | 1.8×          |
| 2    | PostgreSQL        | ~6,500               | baseline      |
| 3    | MySQL             | ~5,750               | 0.88×         |
| 4    | MariaDB           | ~5,250               | 0.81×         |

The PostgreSQL number lines up exactly with Go's result from the first video, which is a nice sanity check that the two experiments are comparable.

### Why did SQLite nearly double everyone else?

The three "real" databases are all **separate server processes**. Every query from the Go API has to be serialised, sent over a socket to the database process, parsed, executed, and the result sent back the same way. On a machine with one shared vCPU, the operating system also has to keep switching between the API process and the database process, and every switch costs time.

**SQLite has none of that.** It is a library compiled into the application. A query is a function call into the same process, reading a file on the same disk. No network round trip, no inter-process communication, no context switching between two busy programs fighting over one core.

**WAL (write-ahead logging) mode** is the other half of the trick. By default SQLite locks the whole database file while writing, which blocks readers. In WAL mode, writes go to a separate log file, so readers keep reading while a write happens. For a read-heavy app like a social feed, that removes most of the lock contention.

If you want to try it, it is a one-line setting:

```sql
PRAGMA journal_mode = WAL;
```

### Before you migrate everything to SQLite

The headline number comes from a mostly read workload. The rest of the video puts SQLite through the tests that usually expose its weaknesses: a **write-heavy** workload (SQLite still allows only one writer at a time), its **durability** settings, and a run with **10× the data**. [TODO Nik: summarise what those tests showed.] Watch those chapters before you rewrite your data layer. In general, SQLite is an excellent fit for a single-server app, and a poor fit the moment you need several app servers writing to the same database.

Among the client-server databases, **PostgreSQL** comes out ahead of **MySQL** by about 13%, and MySQL ahead of its fork **MariaDB** by about 10%. Those gaps are real but small, and default settings play a big part. None of the three was tuned for a 2 GB machine, so treat the order as "out of the box on a tiny VPS," not a final verdict.

## Key takeaways

**Defaults and drivers matter as much as the language.** Laravel versus Octane, Express versus Bun, Postgres versus SQLite: the biggest jumps in these experiments came from _how_ code runs (framework lifecycle, runtime, database access) rather than _which_ language it was written in.

**The bottleneck moves, and it moves fast.** On a slow stack, your application code is the bottleneck. Speed it up and the bottleneck shifts to the database, then to I/O and the network between processes. Profile before you rewrite. If Postgres is using 60% of your CPU, a Rust rewrite will not save you.

**Architecture beats hardware.** A single $12 VPS served thousands of concurrent users with nearly every stack tested, and almost twelve thousand with the right database choice. Most projects will never see that kind of traffic. Before you reach for Kubernetes, managed databases and a bigger bill, check whether a well-chosen stack on one small box already covers you.

**Pick boring and fast enough.** Unless your traffic is truly huge, the best stack is still the one your team knows well. These numbers just show that "fast enough" covers a lot more ground than people assume, and that a few config choices can matter more than the language war.

All credit for the experiments goes to Arjay McCandless. Both videos are worth watching in full, especially the parts where he explains _why_ each stack behaves the way it does.
