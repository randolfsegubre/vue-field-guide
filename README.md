# Vue Field Guide

A from-scratch, beginner-to-hero guide to Vue.js 3, written for a developer who
already reads code comfortably but has never set up or built with Vue.js
before. It pairs a small, fully working demo application (a task board) with a
documentation set that explains, at the level of individual function calls,
how every click in that application turns into a screen update.

This repository is meant to be read, not just run. Every source file under
[`src/`](src/) is commented to explain *why* a line exists, not just what it
does, and [`docs/`](docs/) walks through the same application from four
different angles: how to set it up, what the Vue.js terminology means, how
its pieces are laid out (an "anatomy diagram" of the app), and a click-by-click
trace of the code.

## Start here

| Document | What it answers |
|---|---|
| [docs/01_SETUP.md](docs/01_SETUP.md) | "How do I get a Vue.js project running from nothing?" — installing Node.js, scaffolding a project with `npm create vue@latest`, what each generated file does, and this project's own run/build commands. |
| [docs/02_GUIDE.md](docs/02_GUIDE.md) | "What do all these Vue.js terms mean?" — a beginner-to-hero glossary: reactivity, directives, components, props, custom events, composables, lifecycle hooks, template refs. |
| [docs/03_ANATOMY.md](docs/03_ANATOMY.md) | "What does this specific app's architecture look like?" — a diagram of every component in this demo, labeled like an anatomy chart: what it is, and what its one job is. |
| [docs/04_CODE_WALKTHROUGH.md](docs/04_CODE_WALKTHROUGH.md) | "When I click X, what actually happens?" — five traces (add a task, check it off, delete it, change the filter, autofocus on load), each one following a single user action through every function it touches, with exact file-and-line links. |

If you only read one document, read `docs/03_ANATOMY.md` first for the big
picture, then `docs/04_CODE_WALKTHROUGH.md` for the detail.

## The demo application

A minimal task board — add a task, check it off, filter by status, delete it.
It is deliberately small (7 source files, no backend, no router, no state
library) so that every Vue.js concept it demonstrates is visible in a single
sitting:

- Component structure — a Single File Component (an `.vue` file combining
  markup, logic, and styles in one place)
- Reactive state (`ref`, `computed`) and a shared "composable" that owns it
- One-way data flow: props down to children, custom events back up to parents
- Core template directives: `v-bind` (`:`), `v-on` (`@`), `v-if`/`v-else`,
  `v-for`, `v-model`
- A lifecycle hook (`onMounted`) and a template ref, used together to
  autofocus an input once it exists in the real page

What it looks like once running (text sketch, not an actual screenshot):

```
Vue Field Guide — Task Board
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

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173` address. See
[docs/01_SETUP.md](docs/01_SETUP.md) for the full explanation of what each of
those commands actually does.

## Project layout

```
vue-field-guide/
├── docs/                     the four guides described above
├── index.html                the single real HTML page Vue.js mounts into
├── src/
│   ├── main.ts                bootstraps Vue.js and mounts App.vue
│   ├── App.vue                root component — owns the shared task state
│   ├── composables/
│   │   └── useTasks.ts        the task list's state and all its operations
│   └── components/
│       ├── TaskForm.vue       text input that emits a new task's text
│       ├── TaskStats.vue      read-only total/remaining/done counters
│       ├── FilterTabs.vue     All / Active / Completed selector
│       ├── TaskList.vue       renders one TaskItem per visible task
│       └── TaskItem.vue       a single row: checkbox, text, delete button
├── package.json
└── vite.config.ts
```
