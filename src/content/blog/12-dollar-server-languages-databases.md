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
  - k6
  - testing
  - YouTube
ogImage: "../../assets/images/12-dollar-server-languages-databases.jpg"
description: "Arjay McCandless load-tested 8 backend languages and 4 databases on a $12 VPS. Rust and Go topped 6,500 users, but SQLite more than doubled what Postgres could do."
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

The load comes from **[k6](https://k6.io/)**, which simulates virtual users browsing the app: load the feed, wait a few seconds, open a post, sometimes like or create one, repeat. Each virtual user makes roughly one request every ten seconds, so 1,000 users is about 100 requests per second. Arjay keeps adding users until the server cracks. "Cracks" has a precise definition here: a stack passes a level only if it holds **p95 latency under 500 ms, p99 under 1 second, and errors under 1%** for a full five minutes. The API, the data, the Nginx setup and the server stay identical across every run. Only the language (and later, the database) changes.

If you haven't used k6 before, it is an open-source load testing tool from Grafana Labs. You write test scenarios in JavaScript, k6 runs them as virtual users, and when the run ends it reports latency percentiles, error rates and throughput. Pass/fail rules like Arjay's map directly onto k6 _thresholds_, so a test marks itself as failed when the server can't keep up:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};
```

That is only a sketch of the criteria, not Arjay's actual script, but it shows how little code it takes to turn "fast enough" into a test that passes or fails.

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
| 2    | Go (net/http)      | ~6,500               | 2.0×       |
| 3    | Java (Spring Boot) | ~5,100               | 1.6×       |
| 4    | C# (ASP.NET Core)  | ~4,400               | 1.4×       |
| 5    | Bun                | ~4,200               | 1.3×       |
| 6    | Node.js (Express)  | ~3,250               | baseline   |
| 7    | Python (FastAPI)   | ~2,150               | 0.66×      |
| 8    | PHP (Laravel)      | ~750                 | 0.23×      |

That is a **9× spread** between first and last place, on identical hardware, serving identical data. So yes, the language matters.

Arjay is clear that this is not a precise leaderboard, though. Results near the limit drifted between runs: Node passed at 3,250 users in the morning, but runs at the end of the day landed around 3,000. Assume about 10% fluctuation and read it as speed tiers: Rust and Go, then Java, C# and Bun, then Node, then Python, then PHP. And look closer, because the story gets more interesting.

### What the numbers are really saying

**Rust and Go are practically tied.** Rust wins by about 6%, which is well within "it depends on how you wrote it" territory. Arjay ran three tests at each peak level and saw enough run-to-run noise that he puts them in the same tier on this machine. Both compile to native code with very lean HTTP stacks, and as we'll see, both ran into the same wall.

**Java and C# are far from slow.** The JVM and .NET runtimes have a reputation for being heavy, and on 2 GB of RAM you would expect them to suffer. Instead Spring Boot and ASP.NET Core land comfortably ahead of Node. The JVM did peak at around 600 MB, a big slice of a 2 GB machine, but memory never became the bottleneck. Once their JIT compilers warm up, they run hot code very close to native speed.

C# also turned up one of the most interesting findings in the video. At saturation, the C# app used about a quarter of the CPU and Postgres about 60%. Digging into why, Arjay found that the Npgsql database driver resets every pooled connection with `DISCARD ALL`. In a sample of about 30% of traffic, he counted almost 10,000 `DISCARD ALL` commands for 10,000 feed queries. That is a driver default making the database do a lot of extra work, and he deliberately left it alone to keep every stack close to its defaults.

**Bun is the cheapest upgrade on the list.** Same JavaScript, same mental model, roughly **30% more users** than Node with Express. If you already have a Node API, this is about the lowest-effort performance win you can get: swap the runtime, run your tests, and see if anything breaks.

**Python is respectable, not fast.** FastAPI with three Uvicorn workers held 2,150 users at about 200 requests per second. Interestingly, it didn't fail on latency. At 2,300 users, 15% of requests errored out because they waited more than 5 seconds for a database connection from the pool and timed out. Two thousand concurrent users is still plenty for most side projects and a good number of real businesses.

**Laravel pays a tax on every request.** PHP's classic model boots the framework from scratch for each request: load the service container, register providers, resolve the route, and only then run your code. On a heavy page that overhead disappears into the noise. On a small JSON endpoint like "get a post and its like count," the boot cost _is_ most of the request. Arjay spotted it in the numbers: the cheapest endpoint, which loads a single post, managed about 109 requests per second, barely more than the 94 of the feed endpoint, which loads 20 posts and counts their likes. That is why Laravel sits at the bottom with ~750 users.

The video does not stop there, though. Arjay also tries **Laravel Octane**, which keeps the framework booted in memory between requests, and **bare PHP** without a framework. Octane raises raw throughput by about 50% and holds **at least 1,250 users**. Arjay stopped the test there, because even that seemed low. Dropping the framework altogether goes further: bare PHP reaches **~2,700 users**, roughly 3.6× the Laravel baseline and ahead of FastAPI. Keeping the framework warm attacks exactly the overhead described above, so if you run Laravel in production and haven't looked at Octane, this is your sign.

### The twist: the server wasn't busy running Go

When Arjay looked at what the CPU was actually doing during the Go and Rust runs, the application wasn't the main consumer. **PostgreSQL was eating roughly 60% of the CPU.**

That changes how you read the top of the table. Rust and Go didn't hit a language ceiling. They got so efficient that the database became the bottleneck. Making Rust any faster would barely move the number, because most of the CPU time wasn't spent in Rust.

So at the end of the video, Arjay replaced Postgres with **SQLite** (in WAL mode) for the top three languages and ran the tests again:

| Stack | PostgreSQL | SQLite  | Change |
| ----- | ---------- | ------- | ------ |
| Java  | ~5,100     | ~10,250 | 2.0×   |
| Go    | ~6,500     | ~11,750 | 1.8×   |
| Rust  | ~6,900     | ~14,050 | 2.0×   |

Rust on SQLite held **14,050 simultaneous users** for the full five minutes, at about 1,300 requests per second with a median latency around 5 ms, on one shared vCPU and 2 GB of RAM. It even outgrew the load test: 12,000 users was the most Arjay had planned for, so he had to extend the test to 15,000 (which failed) to find the ceiling.

He is clear that this isn't advice to move your app to SQLite, since the two databases come with very different trade-offs. That is exactly what the second video digs into.

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

For the second experiment, Arjay kept the **Go API**, the same data, the same SQL and the same $12 server, and swapped only the database. The application and the database share that one machine, with no dedicated database server, while k6 generates the load from a second server. The workload is realistic for a social app: load the feed, open a post, maybe like something, maybe create a post. Only about **8% of requests write** to the database. The pass criteria stayed the same: p95 under 500 ms, p99 under 1 second, under 1% errors, sustained for five minutes.

| Rank | Database          | Max concurrent users | vs PostgreSQL |
| ---- | ----------------- | -------------------- | ------------- |
| 1    | SQLite (WAL mode) | ~13,400              | 2.1×          |
| 2    | MariaDB           | ~9,300               | 1.5×          |
| 3    | MySQL             | ~6,650               | 1.05×         |
| 4    | PostgreSQL        | ~6,350               | baseline      |

PostgreSQL lands close to the ~6,500 users Go managed in the first video, a decent sanity check that the two experiments are comparable. Go on SQLite does better here (~13,400) than in the first video (~11,750), a reminder to treat all of these as rough figures rather than precise scores. SQLite's number is really a floor: at 13,400 users, the machine generating the load started to run out of resources.

### Why did SQLite win?

The three "real" databases are all **separate server processes**. Every query from the Go API has to be serialised, sent over a socket to the database process, parsed, executed, and the result sent back the same way. On a machine with one shared vCPU, the operating system also has to keep switching between the API process and the database process, and every switch costs time.

**SQLite has none of that.** It is a library compiled into the application. A query is a function call into the same process, reading a file on the same disk. No network round trip, no inter-process communication, no context switching between two busy programs fighting over one core.

The CPU numbers show it. At Postgres's limit, Postgres itself used about 60% of the CPU and the Go API about 23%. At SQLite's limit, about 70% of the CPU sat in the Go process, and that already includes all of the SQLite work.

**WAL (write-ahead logging) mode** is the other half of the trick. By default SQLite locks the whole database file while writing, which blocks readers. In WAL mode, writes go to a separate log file, so readers keep reading while a write happens. For a read-heavy app like a social feed, that removes most of the lock contention.

If you want to try it, it is a one-line setting:

```sql
PRAGMA journal_mode = WAL;
```

### The MariaDB surprise

MariaDB started life as a fork of MySQL, and the API talked to both through the very same MySQL-compatible Go driver. Yet MariaDB served **about 40% more users** than MySQL. To see why, Arjay compared the two at the same 2,000-user load: MariaDB used roughly **24–29% less database CPU per request** and wrote **9–14× less data to disk**, about 56 KB/s against MySQL's 701 KB/s.

The likely culprit is defaults, not engine quality. MySQL enables `performance_schema` out of the box, while the MariaDB install on this server had it disabled, and the two handle disk I/O slightly differently by default. Arjay is careful not to call MariaDB universally faster. But on a single shared vCPU, every bit of background work comes straight out of the budget for serving users, so out-of-the-box settings are worth a look.

### Before you migrate everything to SQLite

The headline numbers come from a mostly read workload, so Arjay ran more tests that tend to expose SQLite's weaknesses. Here are all the results side by side:

| Database                        | Read-heavy | Write-heavy | 10× data   |
| ------------------------------- | ---------- | ----------- | ---------- |
| SQLite (`synchronous = NORMAL`) | ~13,400    | ~6,800      | ~14,500    |
| SQLite (`synchronous = FULL`)   | ~10,000    | ~1,550      | not tested |
| MariaDB                         | ~9,300     | ~5,000      | ~8,000     |
| MySQL                           | ~6,650     | ~3,150      | ~6,000     |
| PostgreSQL                      | ~6,350     | ~3,850      | ~5,000     |

**Write-heavy.** Every virtual user now likes posts and half of them create posts, which takes writes from 8% to 43% of requests. The bottleneck moves from the CPU to waiting on the disk, and every database loses a big chunk of its capacity. SQLite still comes out on top, but with an asterisk.

**The durability asterisk.** The default SQLite setup ran in WAL mode with `synchronous = NORMAL`. Committed transactions survive an application crash, but a sudden power loss can lose the most recent commits. Postgres, MySQL and MariaDB, on the other hand, were configured to fsync on every commit. Switching SQLite to `synchronous = FULL` gives it the same guarantee. The read-heavy workload still reaches an impressive ~10,000 users, but the write-heavy run **collapses to ~1,550**, last place by a wide margin, with the server spending almost 40% of its time waiting on I/O.

That is SQLite's fundamental trade-off: it allows only one writer at a time, and with full durability that writer may wait for a disk sync on every single commit. The server databases use **group commit**, where several transactions share a single flush to disk.

**10× the data.** To check the results weren't just a side effect of a tiny database, Arjay scaled up to 500,000 users, 5 million posts and 20 million likes, about 1.6 GB instead of 155 MB. The order stayed the same: SQLite even edged up, and the server databases lost roughly 10–20%. Database size still matters in general, but for this workload, going to 1.6 GB caused no collapse.

The bigger caveat is the setup itself. Everything runs on one machine, which plays straight to SQLite's main strength: there is no separate server process. Postgres, MySQL and MariaDB solve a different problem. They are database servers built to be shared across machines: Postgres can replicate to standby servers and fail over when the primary dies, MySQL has group replication and NDB Cluster, and MariaDB has replication and Galera Cluster. That machinery adds overhead that doesn't help in a single-box benchmark, but it is usually what you want once your app outgrows one server. SQLite is an excellent fit for a single-server app, and a poor fit the moment you need several app servers writing to the same database.

## Key takeaways

**Defaults and drivers matter as much as the language.** Laravel versus Octane, Express versus Bun, MySQL versus MariaDB, Postgres versus SQLite: the biggest jumps in these experiments came from _how_ code runs (framework lifecycle, runtime, database access) rather than _which_ language it was written in.

**The bottleneck moves, and it moves fast.** On a slow stack, your application code is the bottleneck. Speed it up and the bottleneck shifts to the database, then to I/O and the network between processes. Profile before you rewrite. If Postgres is using 60% of your CPU, a Rust rewrite will not save you.

**Architecture beats hardware.** A single $12 VPS served thousands of concurrent users with nearly every stack tested, and around fourteen thousand with the right database choice. Most projects will never see that kind of traffic. Before you reach for Kubernetes, managed databases and a bigger bill, check whether a well-chosen stack on one small box already covers you.

**Pick boring and fast enough.** Unless your traffic is truly huge, the best stack is still the one your team knows well. These numbers just show that "fast enough" covers a lot more ground than people assume, and that a few config choices can matter more than the language war.

All credit for the experiments goes to Arjay McCandless. Both videos are worth watching in full, especially the parts where he explains _why_ each stack behaves the way it does.
