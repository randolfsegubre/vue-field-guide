# 01 — Setup: Building a Vue.js Project From Nothing

This document covers the part that is easy to skip past when you're only
reading finished code: how a Vue.js project actually comes into existence,
and what every file the scaffolding tool generates is for.

## 1. Prerequisites

Vue.js itself is just a JavaScript library, but building and running a real
project needs a JavaScript runtime and a build tool around it:

- **Node.js** — the JavaScript runtime that runs the build tooling on your
  machine (this is not what runs in the browser; the browser gets plain
  JavaScript/HTML/CSS as output). This project was built against Node.js 24.
- **npm** (Node Package Manager) — installed automatically with Node.js. It
  downloads dependencies (listed in `package.json`) and runs the scripts
  defined there (`npm run dev`, `npm run build`, etc.).

Check both are installed:

```bash
node --version
npm --version
```

## 2. How this project was scaffolded

Vue.js's official way to start a new project is a Command Line Interface
(CLI) tool called `create-vue`, run through npm without installing it
permanently:

```bash
npm create vue@latest my-project-name
```

It asks a series of yes/no questions (add TypeScript? add a router? add a
state library? add a test runner?) and generates a working project skeleton
based on the answers. This project was created with the equivalent
non-interactive command:

```bash
npm create vue@latest vue-field-guide -- --default
```

`--default` accepts the bare minimum: Vue.js 3 with TypeScript, no router, no
state library, no test runner, no linter. Everything past that minimum
(components, composables, documentation) in this repository was written by
hand afterward — nothing here beyond the initial file skeleton was
auto-generated.

## 3. What each generated file is for

| File | Purpose |
|---|---|
| `index.html` | The one real Hypertext Markup Language (HTML) page the browser ever loads. It contains a single empty `<div id="app"></div>` and a `<script>` tag pointing at `src/main.ts` — everything else on screen is inserted into that div by Vue.js at runtime. This is what makes Vue.js a Single Page Application (SPA) framework: the browser never navigates to a second HTML page. |
| `src/main.ts` | The entry point. Creates a Vue.js application instance from the root component (`App.vue`) and mounts it onto the `#app` div from `index.html`. Three lines, and it is the only place `createApp()` is called. |
| `src/App.vue` | The root component — see [docs/03_ANATOMY.md](03_ANATOMY.md) for what it does in this specific app. |
| `package.json` | Lists dependencies (`vue` itself, plus build tooling) and defines the npm scripts (`dev`, `build`, `preview`) described below. |
| `vite.config.ts` | Configuration for **Vite**, the build tool this project uses. Vite runs the local development server with instant Hot Module Replacement (changed files appear in the browser in milliseconds without a full page reload) and bundles the production build. |
| `tsconfig*.json` | TypeScript compiler configuration — what syntax is allowed, how strict type-checking is, which files belong to which part of the build (application code vs. Node-only config files). |
| `env.d.ts` | Lets TypeScript understand `.vue` file imports (TypeScript does not natively know what a `.vue` file is; this declares the shape). |

## 4. Running the project

```bash
npm install    # downloads every package.json dependency into node_modules/
npm run dev    # starts Vite's local dev server (default: http://localhost:5173)
```

While `npm run dev` is running, every saved change to a file under `src/`
appears in the browser almost instantly, without losing the page's current
state — that live-reload behavior is Vite's Hot Module Replacement mentioned
above.

Other scripts defined in `package.json`:

```bash
npm run build     # type-checks the whole project, then produces an optimized
                   # production build in dist/
npm run preview   # serves that dist/ build locally, so you can sanity-check
                   # the production build before deploying it
```

## 5. Where to go next

With the project running, [docs/02_GUIDE.md](02_GUIDE.md) explains the
vocabulary you'll see throughout `src/`, and
[docs/03_ANATOMY.md](03_ANATOMY.md) maps out how this specific demo
application's pieces fit together.
