# 04 — Code Walkthrough: Five Traces, Click to Render

This is the "very small logical details" document. Each section below picks
one real user action in the demo app and follows it through **every**
function it passes through — which function runs, where it is defined, what
argument(s) it receives and where those come from, what it does with them,
and how the result ends up back on screen. Line numbers refer to this
repository at the time this document was written; if the source changes, the
concepts still apply even where an exact line shifts.

Read [docs/02_GUIDE.md](02_GUIDE.md) first if any term below (ref, computed,
prop, emit, directive) is unfamiliar — this document assumes that vocabulary
and focuses purely on tracing execution.

---

## Trace 1 — Adding a task

**User action:** types text into the input in `TaskForm.vue`, then presses
Enter (or clicks "Add" — both trigger the same path, because both are ways
of submitting an HTML `<form>`).

1. Every keystroke updates local state through **two-way binding**.
   `v-model="draftText"` on the `<input>` —
   [`TaskForm.vue:71`](../src/components/TaskForm.vue#L71) — keeps the
   `draftText` ref — declared at
   [`TaskForm.vue:13`](../src/components/TaskForm.vue#L13) — in sync with
   whatever is typed, character by character. No function call is involved
   here; `v-model` is compiled by Vue.js into a value binding plus an
   `input`-event listener automatically.

2. Pressing Enter inside a `<form>` fires the browser's native `submit`
   event. The template listens for it with
   `@submit.prevent="handleSubmit"` —
   [`TaskForm.vue:60`](../src/components/TaskForm.vue#L60). The `.prevent`
   modifier calls `event.preventDefault()` for you, which is why
   `handleSubmit` never needs to touch the raw event object at all — the
   browser's default "reload the page on submit" behavior is suppressed
   before `handleSubmit` even runs.

3. `handleSubmit` runs —
   [`TaskForm.vue:33-40`](../src/components/TaskForm.vue#L33-L40). It takes
   **no parameters**; it reads `draftText.value` directly out of closure
   scope (line 38), because `draftText` is declared in the same
   `<script setup>` block. It calls
   `emit('add', draftText.value)`, then immediately resets
   `draftText.value = ''` (line 39), which — because of the same `v-model`
   binding from step 1 — instantly clears the visible input text too.

4. `emit(...)` sends the string up to whichever parent used `<TaskForm>`.
   That is `App.vue`, which wrote `@add="addTask"` —
   [`App.vue:38`](../src/App.vue#L38). Vue.js calls `addTask` with exactly
   the one argument `emit('add', ...)` was called with: the task text.

5. `addTask` is not defined in `App.vue` — it is one of the functions
   `useTasks()` returned, destructured at
   [`App.vue:18`](../src/App.vue#L18). Its real definition is
   [`useTasks.ts:74-78`](../src/composables/useTasks.ts#L74-L78):
   ```ts
   function addTask(text: string) {
     const trimmed = text.trim()
     if (!trimmed) return
     tasks.value.push({ id: nextId++, text: trimmed, completed: false })
   }
   ```
   It trims whitespace, bails out silently on an empty string (so pressing
   Enter on a blank input does nothing), and otherwise pushes a new task
   object onto the shared `tasks` array.

6. **This is where the render happens, and no code in this repository
   triggers it explicitly.** `tasks` is a `ref` — Vue.js's reactivity system
   already knows every place that reads `tasks.value` (including inside the
   `filteredTasks` and `stats` computed functions). The moment `.push(...)`
   mutates the array, Vue.js marks both of those computed values as
   "stale" and schedules a re-render of anything that reads them.

7. `filteredTasks` — [`useTasks.ts:54-58`](../src/composables/useTasks.ts#L54-L58)
   — re-evaluates. If the current filter is `'all'`, the new task is
   included. `stats` —
   [`useTasks.ts:60-64`](../src/composables/useTasks.ts#L60-L64) —
   re-evaluates too, recalculating `total`/`remaining`/`completed`.

8. Both are passed to child components as props: `filteredTasks` to
   `TaskList` via `:tasks="filteredTasks"` —
   [`App.vue:60`](../src/App.vue#L60) — and `stats` to `TaskStats` via
   `:stats="stats"` — [`App.vue:46`](../src/App.vue#L46). Vue.js re-renders
   both children with the new prop values.

9. Inside `TaskList.vue`, `v-for="task in tasks"` —
   [`TaskList.vue:39`](../src/components/TaskList.vue#L39) — sees one more
   entry than before. Because `:key="task.id"` —
   [`TaskList.vue:40`](../src/components/TaskList.vue#L40) — gives every
   task a stable identity, Vue.js creates exactly **one** new `TaskItem`
   instance for the new task, and does not touch the existing ones.

10. That new `TaskItem` renders its `task` prop:
    `{{ task.text }}` — [`TaskItem.vue:60`](../src/components/TaskItem.vue#L60)
    — shows the typed text, and `:checked="task.completed"` —
    [`TaskItem.vue:57`](../src/components/TaskItem.vue#L57) — renders an
    unchecked box, since the new task object was created with
    `completed: false`.

11. Inside `TaskStats.vue`, the three `{{ stats.xxx }}` interpolations —
    [`TaskStats.vue:30,34,38`](../src/components/TaskStats.vue#L30) — update
    to the new counts.

One typed-and-submitted task, one `emit`, one composable function call, two
recomputed `computed` values, two re-rendered child components. No manual
"refresh the list" step anywhere.

---

## Trace 2 — Checking a task off

**User action:** clicks the checkbox next to a task.

1. The checkbox is rendered with `:checked="task.completed"` and
   `@change="handleToggle"` —
   [`TaskItem.vue:57`](../src/components/TaskItem.vue#L57). Note it is
   deliberately **not** `v-model="task.completed"` — a child component is
   not allowed to write directly into its own prop (`task` came in from
   `TaskList`), so it can only *ask* for the change via an event.

2. Clicking fires the native `change` event, which runs `handleToggle` —
   [`TaskItem.vue:27-29`](../src/components/TaskItem.vue#L27-L29):
   ```ts
   function handleToggle() {
     emit('toggle', props.task.id)
   }
   ```
   It takes no parameters from the event itself; it reads the task's `id`
   off of `props.task` (declared at
   [`TaskItem.vue:9`](../src/components/TaskItem.vue#L9)) and emits just
   that number.

3. `TaskList.vue` rendered this `TaskItem` with
   `@toggle="emit('toggle', $event)"` —
   [`TaskList.vue:42`](../src/components/TaskList.vue#L42). `$event` here
   *is* the id `TaskItem` just emitted — Vue.js exposes whatever payload an
   event was fired with as `$event` inside an inline template expression.
   `TaskList` immediately re-emits it under its own `toggle` event (declared
   at [`TaskList.vue:15-18`](../src/components/TaskList.vue#L15-L18)) —
   this relay step is what "event forwarding" means (see
   [docs/03_ANATOMY.md](03_ANATOMY.md#tasklistvue--the-distributor)).

4. `App.vue` wired `<TaskList ... @toggle="toggleTask" />` —
   [`App.vue:60`](../src/App.vue#L60) — so `toggleTask` runs with that same
   id, unchanged since step 2.

5. `toggleTask` — [`useTasks.ts:85-88`](../src/composables/useTasks.ts#L85-L88):
   ```ts
   function toggleTask(id: number) {
     const task = tasks.value.find((t) => t.id === id)
     if (task) task.completed = !task.completed
   }
   ```
   Finds the matching task object inside the shared array and flips one
   boolean property on it, in place.

6. Because `tasks` holds an array of objects, and `ref()` makes its
   contents deeply reactive, Vue.js also tracks reads of `task.completed`
   itself, not just reads of the array — so this single property write is
   enough to trigger every dependent recomputation and re-render, exactly
   like the array mutation did in Trace 1.

7. `filteredTasks` recomputes — if the active filter is `'active'` or
   `'completed'`, this specific task may now disappear from the visible
   list entirely, since its `completed` value changed. `stats` recomputes
   its `completed`/`remaining` counts.

8. The `TaskItem` for this exact task re-renders its
   `:class="{ completed: task.completed }"` binding —
   [`TaskItem.vue:49`](../src/components/TaskItem.vue#L49) — adding the
   `completed` CSS class, which applies the strikethrough style defined at
   [`TaskItem.vue:88-91`](../src/components/TaskItem.vue#L88).

---

## Trace 3 — Removing a task

**User action:** clicks the ✕ button on a task row.

1. `@click="handleRemove"` —
   [`TaskItem.vue:67`](../src/components/TaskItem.vue#L67) — runs
   `handleRemove` — [`TaskItem.vue:36-38`](../src/components/TaskItem.vue#L36-L38),
   which emits `remove` with `props.task.id` — the same "read from props,
   emit just the id" shape as `handleToggle` in Trace 2.

2. `TaskList.vue` forwards it: `@remove="emit('remove', $event)"` —
   [`TaskList.vue:43`](../src/components/TaskList.vue#L43).

3. `App.vue` wired `@remove="removeTask"` —
   [`App.vue:60`](../src/App.vue#L60).

4. `removeTask` — [`useTasks.ts:94-96`](../src/composables/useTasks.ts#L94-L96):
   ```ts
   function removeTask(id: number) {
     tasks.value = tasks.value.filter((t) => t.id !== id)
   }
   ```
   Unlike `toggleTask`, this **reassigns** `tasks.value` to a brand-new
   filtered array, rather than mutating the existing one. Either style
   triggers Vue.js's reactivity — a `ref`'s reactivity is driven by its
   `.value` setter being invoked (for reassignment) or by mutating a
   reactive-proxied object/array in place (for `.push`/property writes);
   both are tracked.

5. `filteredTasks` and `stats` recompute against the shorter array.
   `TaskList`'s `v-for` — driven by `:key="task.id"` — removes exactly the
   one `<TaskItem>` whose key no longer exists in the array; sibling items
   are left untouched in the DOM rather than being torn down and rebuilt.

---

## Trace 4 — Changing the filter

**User action:** clicks the "Active" (or "Completed", or "All") tab.

1. Each tab button is rendered by
   `v-for="option in options"` —
   [`FilterTabs.vue:52`](../src/components/FilterTabs.vue#L52) — with
   `@click="selectFilter(option.value)"` —
   [`FilterTabs.vue:57`](../src/components/FilterTabs.vue#L57). Note the
   explicit argument in the template: because it says
   `selectFilter(option.value)` and not just `selectFilter`, Vue.js calls
   `selectFilter` with exactly that one value baked in from the loop — the
   native click event is not passed at all.

2. `selectFilter` — [`FilterTabs.vue:32-34`](../src/components/FilterTabs.vue#L32-L34)
   — emits `change` with that filter value, unchanged.

3. `App.vue` wired `<FilterTabs :active-filter="activeFilter" @change="setFilter" />`
   — [`App.vue:53`](../src/App.vue#L53) — so `setFilter` runs with the new
   filter.

4. `setFilter` — [`useTasks.ts:103-105`](../src/composables/useTasks.ts#L103-L105)
   — sets `activeFilter.value = filter`.

5. `filteredTasks` — which reads `activeFilter.value` on its very first line
   — [`useTasks.ts:55`](../src/composables/useTasks.ts#L55) — recomputes to
   the newly selected subset. `TaskList`'s `v-for` reconciles to match.

6. Separately, `activeFilter` (the ref itself, not just the derived list) is
   passed back down as a prop to `FilterTabs` —
   `:active-filter="activeFilter"` at
   [`App.vue:53`](../src/App.vue#L53) — so `FilterTabs`'s own
   `:class="{ active: option.value === activeFilter }"` —
   [`FilterTabs.vue:56`](../src/components/FilterTabs.vue#L56) — re-evaluates
   for every tab, moving the highlighted-tab style to the one just clicked.

---

## Trace 5 — Autofocus on page load (a lifecycle hook, not a click)

**Trigger:** the page finishing its initial load — included here because it
is the only behavior in this app driven by a lifecycle hook instead of a
user-initiated event, and it's easy to misread as "just happening."

1. [`src/main.ts`](../src/main.ts) calls `createApp(App).mount('#app')`,
   which builds `App.vue`'s component tree, including one `TaskForm.vue`
   instance.

2. Vue.js creates the real `<input>` element for
   [`TaskForm.vue:69-75`](../src/components/TaskForm.vue#L69-L75) and, because
   it carries `ref="inputEl"`, assigns that live element into the
   `inputEl` ref declared at
   [`TaskForm.vue:25`](../src/components/TaskForm.vue#L25).

3. Only *after* that element is attached to the real page does Vue.js
   invoke the callback registered with `onMounted` —
   [`TaskForm.vue:48-50`](../src/components/TaskForm.vue#L48-L50):
   ```ts
   onMounted(() => {
     inputEl.value?.focus()
   })
   ```

4. `inputEl.value` is now a real `HTMLInputElement`, so `.focus()` is a
   direct, ordinary Document Object Model (DOM) method call — the browser
   moves keyboard focus into the input, and a user can start typing a task
   immediately without clicking into the field first.

The `?.` (optional chaining) guards against the rare case where the
component were somehow unmounted before this callback ran; in normal usage
`inputEl.value` is guaranteed to be non-null by the time `onMounted` fires.
