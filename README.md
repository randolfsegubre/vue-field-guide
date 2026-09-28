# Vue Field Guide

A from-scratch, beginner-to-hero guide to Vue.js 3, written for a developer who
already reads code comfortably but has never set up or built with Vue.js
before. It pairs a small, fully working demo application (a task board, with
a Vue Router-driven Tutorial page and a real ASP.NET Core Web API companion)
with a documentation set that explains, at the level of individual function
calls, how every click turns into a screen update — or a network request.

This repository is meant to be read, not just run. Every source file under
[`src/`](src/) is commented to explain *why* a line exists, not just what it
does, and [`docs/`](docs/) walks through the same application from five
different angles: how to set it up, what the Vue.js terminology means, how
its pieces are laid out (an "anatomy diagram" of the app), a click-by-click
trace of the code, and how the frontend and the .NET backend actually talk
to each other.

## Start here

| Document | What it answers |
|---|---|
| [docs/01_SETUP.md](docs/01_SETUP.md) | "How do I get a Vue.js project running from nothing?" — installing Node.js, scaffolding a project with `npm create vue@latest`, what each generated file does, and running both halves of this repo. |
| [docs/02_GUIDE.md](docs/02_GUIDE.md) | "What do all these Vue.js terms mean?" — a beginner-to-hero glossary: reactivity, directives, components, props, custom events, composables, lifecycle hooks, template refs, Vue Router, and async data fetching. |
| [docs/03_ANATOMY.md](docs/03_ANATOMY.md) | "What does this specific app's architecture look like?" — a diagram of every page and component in this demo, labeled like an anatomy chart: what it is, and what its one job is. |
| [docs/04_CODE_WALKTHROUGH.md](docs/04_CODE_WALKTHROUGH.md) | "When I click X, what actually happens?" — five traces (add a task, check it off, delete it, change the filter, autofocus on load), each one following a single user action through every function it touches, with exact file-and-line links. |
| [docs/05_API_INTEGRATION.md](docs/05_API_INTEGRATION.md) | "How does Vue.js talk to my ASP.NET Core API?" — CORS, environment variables, and a full request trace from a click in the browser to the .NET handler and back. |

If you only read one document, read `docs/03_ANATOMY.md` first for the big
picture, then `docs/04_CODE_WALKTHROUGH.md` for the detail.

## The demo application

Three pages, reached through Vue Router — no full page reloads between them:

- **Task Board** (`/`) — add a task, check it off, filter by status, delete
  it. State lives only in the browser tab (a Vue.js composable).
- **Tutorial** (`/about`) — the in-app version of this README/`docs/` set,
  for reading without leaving the running app.
- **API Demo** (`/api-demo`) — the *exact same* task board components,
  driven instead by real HTTP requests to the ASP.NET Core Web API in
  [`server/VueFieldGuide.Api/`](server/VueFieldGuide.Api/).

Concepts it demonstrates, across those three pages:

- Component structure — a Single File Component (an `.vue` file combining
  markup, logic, and styles in one place)
- Reactive state (`ref`, `computed`) and a shared "composable" that owns it
- One-way data flow: props down to children, custom events back up to parents
- Core template directives: `v-bind` (`:`), `v-on` (`@`), `v-if`/`v-else`,
  `v-for`, `v-model`
- A lifecycle hook (`onMounted`) and a template ref, used together to
  autofocus an input once it exists in the real page
- **Vue Router** — multi-page navigation without a server round trip
- **Calling a real backend** — `async`/`await`, loading and error states,
  Cross-Origin Resource Sharing (CORS), and Vite environment variables

What the Task Board looks like once running (text sketch, not an actual
screenshot):

```
Vue Field Guide          Task Board   Tutorial   API Demo
──────────────────────────────────────────────────────────
Task Board
[ Add a task and press Enter… ] [Add]

  4      3      1
 TOTAL REMAINING DONE

 [All] [Active] [Completed]

 ☑ Learn Vue.js component anatomy      ✕
 ☐ Understand props vs. state          ✕
 ☐ Trace one click from template       ✕
 ☐ Verify the click-to-render loop     ✕
```

## Quick start

The Task Board and Tutorial pages need only the frontend:

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173` address.

The **API Demo** page additionally needs the .NET backend running, in a
second terminal:

```bash
cd server/VueFieldGuide.Api
dotnet run
```

See [docs/01_SETUP.md](docs/01_SETUP.md) for the full explanation of what
each command does, and [docs/05_API_INTEGRATION.md](docs/05_API_INTEGRATION.md)
for how the two halves connect.

## Project layout

```
vue-field-guide/
├── docs/                          the five guides described above
├── index.html                     the single real HTML page Vue.js mounts into
├── .env                           VITE_API_BASE_URL for the API Demo page
├── src/
│   ├── main.ts                     bootstraps Vue.js + Vue Router, mounts App.vue
│   ├── App.vue                     shell: nav bar + <router-view>
│   ├── router/
│   │   └── index.ts                 maps each URL path to a view component
│   ├── views/
│   │   ├── TaskBoardView.vue        the local-state task board (was App.vue)
│   │   ├── AboutView.vue            in-app Tutorial page
│   │   └── ApiDemoView.vue          API-backed task board
│   ├── composables/
│   │   ├── useTasks.ts              local task list: state + operations
│   │   └── useApiTasks.ts           same operations, over fetch() instead
│   └── components/
│       ├── TaskForm.vue             text input that emits a new task's text
│       ├── TaskStats.vue            read-only total/remaining/done counters
│       ├── FilterTabs.vue           All / Active / Completed selector
│       ├── TaskList.vue             renders one TaskItem per visible task
│       └── TaskItem.vue             a single row: checkbox, text, delete button
├── server/
│   └── VueFieldGuide.Api/          ASP.NET Core Web API (.NET 10, minimal APIs)
│       ├── Program.cs               endpoints, CORS, middleware pipeline
│       ├── Models/TaskItem.cs       the task shape, mirroring the frontend's
│       └── Services/TaskStore.cs    in-memory task list
├── package.json
└── vite.config.ts
```
