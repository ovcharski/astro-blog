---
author: Nikola Ovcharski
pubDatetime: 2023-01-20T15:22:00Z
title: What is Playwright
postSlug: what-is-playwright
featured: false
draft: false
tags:
  - playwright
  - testing
  - javascript
  - typescript
  - automation
ogImage: ""
description:
  Playwright is a testing framework that lets you automate Chromium, Firefox, and WebKit with a single API. You can use it to write End-to-End (E2E) and Integration tests
---

## Playwright

Playwright is a testing framework that lets you automate Chromium, Firefox, and WebKit with a single API. You can use it to write End-to-End (E2E) and Integration tests across all platforms. Test on Windows, Linux, and macOS, locally or on CI, headless or headed with native mobile emulation of Google Chrome for Android and Mobile Safari.

![Playwright](/images/playwright-testing.png)

## Table of contents

## Installation

Playwright has its own test runner for end-to-end tests - Playwright Test

The easiest way to get started with Playwright Test is to run the init command.

```ts
npm init playwright@latest
```

Or create new project.

```ts
npm init playwright@latest new-project
```
This will create a configuration file, optionally add examples, a GitHub Action workflow and a first test `example.spec.ts`.

The `playwright.config` file is where you can add configuration for Playwright including modifying which browsers you would like to run Playwright on. If you are running tests inside an already existing project then dependencies will be added directly to your `package.json`.

## Running example test

The tests folder contains a basic example test to help you get started with testing. You can run a single test, a set of tests or all tests. Tests can be run on one browser or multiple browsers. By default tests are run in a headless manner meaning no browser window will be opened while running the tests and results will be seen in the terminal.

```ts
npx playwright test
```

Running tests in headed mode:

```ts
npx playwright test --headed
```

## HTML test report

Once your test has finished running a HTML Reporter will have been created which shows you a full report of your tests allowing you to filter the report by browsers, passed tests, failed tests, skipped tests and flaky tests.

```ts
npx playwright show-report
```

## VS Code Extension

An [official extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) integrates Playwright into your VS Code workflow. This extension works with Playwright version v1.19+ or newer. It can:

- Run tests with a single click
- Run Multiple Tests
- Show browsers
- Pick locators
- Debug step-by-step, explore locators
- Tune locators
- Record new tests
- Record at cursor

## Debugging test

Since Playwright runs in Node.js, you can debug it with your debugger of choice, inside your IDE or directly in VS Code with the VS Code Extension.

```ts
npx playwright test --debug
```

## How does Playwright work

Playwright uses CDP (Chrome DevTools Protocol) which allows automation directly in the browser and it's supported by all the modern ones. It needs external process to run it - Node.

## Capabilities

- Auto-wait: Playwright waits for elements to be actionable prior to performing actions
- Web-first assertions: Checks are automatically retried until the necessary conditions are met
- Tracing: Configure test retry strategy, capture execution trace, videos and screenshots to eliminate flakes
- Browser contexts: Playwright creates a browser context for each test. Browser context is equivalent to a brand new browser profile. This delivers full test isolation with zero overhead. Creating a new browser context only takes a handful of milliseconds.

## Tooling

- Codegen: Generate tests by recording your actions
- Playwright inspector: Inspect page, generate selectors, step through the test execution, see click points and explore execution logs
- Trace Viewer: Capture all the information to investigate the test failure. Playwright trace contains test execution screencast, live DOM snapshots, action explorer, test source and many more

## Languages

Playwright supports TypeScript, JavaScript, Python, .NET and Java.

## Running Playwright on Continuous Integration (CI)

When installing Playwright you are given the option to add a GitHub Actions. This creates a `playwright.yml` file inside a `.github/workflows` folder containing everything you need so that your tests run on each push and pull request into the main  branch.

```ts
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Documentations

https://playwright.dev/

## Support

Community support in these platforms:

- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
- [Slack](https://playwright.slack.com/)
- [Discord](https://aka.ms/playwright/discord)
- [Twitter](https://twitter.com/playwrightweb)


## Creator

Playwright is created by Microsoft. It has Apache License 2.0.

## Videos

<iframe width="100%" height="400" src="https://www.youtube.com/embed/Xz6lhEzgI5I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

`Let's get started with Playwright using the VS Code Extension. In this video we will walk though how to install the extension, then install Playwright and browsers needed, and go over what was installed. Then we will take a look at the example test and run the test while viewing it in the browser, and then learn how to run our tests in different browsers.`

<iframe width="100%" height="400" src="https://www.youtube.com/embed/LM4yqrOzmFE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

`Let’s take a look at how to generate a test based on your user actions and then write some assertions. Then we can use the pick locator option in VS Code to pick the locator we want and the record at cursor option to record a test from a specific place in our code.`

