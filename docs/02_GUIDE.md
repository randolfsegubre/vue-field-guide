# 02 — Guide: Vue.js Terminology, Beginner to Hero

This is the vocabulary layer. If you can already read the code in `src/` but
some of the words in it (reactive, computed, directive, emit, composable,
lifecycle hook) don't yet have a clear meaning attached, this document is
for you. Every term below is illustrated with the actual line in this
repository that uses it, not a generic example.

Read it top to bottom the first time — each section builds on the one
before it.

## Level 1 — What Vue.js is

Vue.js is a JavaScript library for building user interfaces by describing
**what the screen should look like for a given piece of data**, and letting
Vue.js figure out how to update the real page when that data changes. You
almost never write code that directly finds an element and edits it (no
`document.getElementById(...).innerText = ...`); instead you write a
template that says "show this value here," and Vue.js keeps that promise
automatically, forever, as the value changes.

That one idea — describe the desired result, not the update steps — is
called **declarative rendering**, and it is the foundation everything else
in this guide is built on.

## Level 2 — Single File Components

A **component** is a self-contained, reusable piece of a user interface —
one checkbox row, one form, one button group. Vue.js components are usually
written as **Single File Components**: one `.vue` file with three sections:

```vue
<script setup lang="ts">
  // logic: state, functions, imports
</script>

<template>
  <!-- markup: what gets rendered -->
</template>

<style scoped>
  /* styles: CSS that only applies to this component */
</style>
```

Every file under [`src/components/`](../src/components/) follows this exact
shape. `scoped` on `<style>` means the Cascading Style Sheets (CSS) rules
inside only affect elements in that one component's own template — a `.tab`
class defined in `FilterTabs.vue` cannot accidentally style something in
`TaskItem.vue`.

`<script setup>` is the modern syntax used throughout this project (the
**Composition API**). An older syntax called the **Options API** exists too
(you may see it in tutorials or job postings), where you export an object
with `data`, `methods`, and `computed` keys instead of writing plain
functions. Both compile to the same thing; `<script setup>` is simply more
concise and is what new Vue.js code is written with today.

## Level 3 — Reactive state

**State** is any value a component needs to remember that can change over
time (the current draft text in a form, whether a task is checked off). Vue.js
makes a value **reactive** by wrapping it in `ref()` or `reactive()`, which
lets Vue.js *track* every place that value is read, so it can *re-render*
exactly those places automatically when the value changes.

```ts
// src/composables/useTasks.ts, line 41
const tasks = ref<Task[]>([...])
```

- Inside `<script>`, a `ref` must be read/written through `.value`:
  `tasks.value.push(...)`.
- Inside a `<template>`, Vue.js automatically unwraps it, so you write
  `tasks`, never `tasks.value`.

`reactive()` is the alternative for objects — it makes every property of an
object reactive without a `.value` wrapper — but this project uses `ref()`
throughout for consistency (it works for any value type, not just objects).

**Computed values** are read-only state *derived* from other reactive state:

```ts
// src/composables/useTasks.ts, line 54
const filteredTasks = computed(() => { ... })
```

A computed value automatically recalculates when anything it reads inside
its function changes, and is cached in between — reading it twice without an
intervening change does not re-run the calculation twice. This is the Vue.js
equivalent of a calculated property or a Language Integrated Query (LINQ)
expression re-evaluated only when its source changes.

## Level 4 — Directives: how templates react to data

A **directive** is a special attribute in a template, always starting with
`v-`, that tells Vue.js to do something dynamic with that element. This
project uses:

| Directive | Shorthand | What it does | Example in this repo |
|---|---|---|---|
| `v-bind` | `:` | Binds an element attribute to a JavaScript expression | `:class="{ completed: task.completed }"` in [`TaskItem.vue`](../src/components/TaskItem.vue) |
| `v-on` | `@` | Attaches an event listener | `@click="handleRemove"` in `TaskItem.vue` |
| `v-if` / `v-else` | — | Renders (or removes) an element based on a condition | `v-if="tasks.length === 0"` in [`TaskList.vue`](../src/components/TaskList.vue) |
| `v-for` | — | Repeats an element once per item in an array | `v-for="task in tasks"` in `TaskList.vue` |
| `v-model` | — | Two-way binding: keeps a form input and a `ref` in sync in both directions | `v-model="draftText"` in [`TaskForm.vue`](../src/components/TaskForm.vue) |

The shorthand forms (`:` and `@`) are what you'll see in almost all real
Vue.js code — `v-bind:class` and `v-bind:` are functionally identical to
`:class`, just longer to type.

**Text interpolation** — `{{ someValue }}` inside a template — is technically
not a directive but works on the same principle: it re-renders automatically
whenever `someValue` changes. See `{{ stats.total }}` in
[`TaskStats.vue`](../src/components/TaskStats.vue).

## Level 5 — Props and custom events (component communication)

A component cannot directly read or change a sibling or parent component's
state — Vue.js enforces a strict, one-directional flow, often summarized as
**"props down, events up."**

- **Props** are how a parent passes data *down* into a child. The child
  declares what it accepts with `defineProps<{ ... }>()` — see
  [`TaskItem.vue`, line 9](../src/components/TaskItem.vue#L9). A prop is
  read-only from the child's side; a child is never allowed to reassign its
  own prop.
- **Custom events** (often just called "emits") are how a child sends
  information *up* to whichever parent is listening. The child declares
  what it might emit with `defineEmits<{ ... }>()` and fires one with
  `emit('eventName', payload)` — see
  [`TaskItem.vue`, line 27-29](../src/components/TaskItem.vue#L27-L29). The
  parent listens the same way it listens to a native Document Object Model
  (DOM) event, just with a custom name:
  `@toggle="emit('toggle', $event)"` in
  [`TaskList.vue`](../src/components/TaskList.vue).

This is the single most important structural rule in the entire codebase.
[docs/03_ANATOMY.md](03_ANATOMY.md) diagrams exactly which prop and which
event connects every pair of components in this app, and
[docs/04_CODE_WALKTHROUGH.md](04_CODE_WALKTHROUGH.md) traces five real
clicks through that chain end to end.

## Level 6 — Composables: sharing logic (and state) between components

A **composable** is a plain function, conventionally named `use*`, that
packages up reactive state plus the logic that operates on it, so multiple
components can share the same behavior — or, as in this app, the same
*state* — without duplicating code.

```ts
// src/composables/useTasks.ts, line 36
export function useTasks() {
  const tasks = ref<Task[]>([...])
  // ...
  return { tasks, addTask, toggleTask, ... }
}
```

Calling `useTasks()` more than once would create two *separate* independent
task lists, because each call runs the function body fresh. This app calls
it exactly **once**, in `App.vue`, which is precisely what makes the state
shared across every component: they all receive references to the same
`ref` objects, passed down as props. See
[`App.vue`, line 18](../src/App.vue#L18).

If you've used React, a composable plays a similar role to a custom Hook.
If you're coming from an object-oriented background, it's closest to a
small, focused service object: it owns some data and the operations allowed
on it, and hands both out together.

## Level 7 — Lifecycle hooks and template refs

A **lifecycle hook** is a function that registers a callback to run at a
specific point in a component's existence — when it's about to be created,
right after its markup is attached to the real page, right before it's
removed, and so on. The one used in this project is `onMounted`:

```ts
// src/components/TaskForm.vue, line 48
onMounted(() => {
  inputEl.value?.focus()
})
```

A **template ref** is a direct handle to a real DOM element or child
component instance, obtained by adding `ref="someName"` to an element in the
template and declaring a matching `ref()` in `<script>`:

```vue
<!-- src/components/TaskForm.vue, line 70 -->
<input ref="inputEl" ... />
```

Template refs are only populated *after* Vue.js has actually created that
element in the real page — which is exactly why `TaskForm.vue` calls
`.focus()` on it inside `onMounted` rather than at the top of `<script
setup>`: at that earlier point, the `<input>` does not exist yet, so
`inputEl.value` would still be `null`.

## Level 8 — Where "hero" starts: what this app deliberately leaves out

Once the concepts above feel natural, the next layer most real Vue.js
applications add — and this one intentionally does not, to stay small — is:

- **Vue Router** — for apps with more than one page/view (this app has one).
- **Pinia** — a shared state library, for state that needs to live outside
  any single component tree, or persist across route changes (this app's
  composable pattern is the simpler tool that covers small-to-medium apps).
- **Slots** — a way for a parent to pass *markup*, not just data, into a
  child component (useful for building generic wrapper/layout components).
- **`watch`/`watchEffect`** — running a side effect in response to a
  reactive value changing, for cases `computed()` doesn't fit (for example,
  calling an Application Programming Interface (API) whenever a search box
  changes).

Each of those is a natural next step once "props down, events up" and
reactive state feel like second nature — which is exactly what
[docs/04_CODE_WALKTHROUGH.md](04_CODE_WALKTHROUGH.md) is meant to cement, by
tracing every one of this app's user interactions through real code.
