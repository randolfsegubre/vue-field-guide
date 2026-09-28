// useTasks.ts
//
// This is a "composable" — plain Vue terminology for a function whose name starts
// with `use` and that packages up reactive state plus the logic that changes it,
// so any component can call it and get its own independent copy of that state.
// Think of it as the equivalent of a small, focused service class in C#: it owns
// data and the methods that mutate that data, and it hands both out together.
//
// Every exported `ref`/`computed` here is REACTIVE: Vue tracks which parts of the
// template read `.value` from them, and re-renders only those parts when the
// value changes. That tracking is the whole reason App.vue never manually calls
// anything like "re-render now" after addTask()/toggleTask()/removeTask() run.

import { ref, computed } from 'vue'

/** Shape of a single to-do item. */
export interface Task {
  id: number
  text: string
  completed: boolean
}

/** The three ways the task list can be narrowed down for display. */
export type TaskFilter = 'all' | 'active' | 'completed'

// Module-scoped counter (not `ref` — it never needs to trigger a re-render by
// itself, it only ever feeds an id into a Task object). Incrementing it here
// means every task created anywhere in the app gets a unique id.
let nextId = 1

/**
 * Creates one independent task list plus every operation allowed on it.
 * Called exactly once, from App.vue, so the whole app shares a single list —
 * see docs/03_ANATOMY.md for why that call site matters.
 */
export function useTasks() {
  // STEP 1 of 5 — reactive state.
  // `ref()` wraps a plain value/array in a reactive container. Inside <script>
  // you must write `tasks.value` to read or write it; inside a <template>,
  // Vue automatically unwraps it, so templates just write `tasks`.
  const tasks = ref<Task[]>([
    { id: nextId++, text: 'Learn Vue.js component anatomy', completed: false },
    { id: nextId++, text: 'Understand props vs. state', completed: false },
    { id: nextId++, text: 'Trace one click from template to composable', completed: false },
  ])

  const activeFilter = ref<TaskFilter>('all')

  // STEP 2 of 5 — derived state.
  // `computed()` is a read-only value recalculated automatically whenever any
  // reactive value it reads (here, `tasks.value` or `activeFilter.value`)
  // changes. It is cached: re-reading `filteredTasks.value` twice without an
  // intervening change does not re-run this function body twice.
  const filteredTasks = computed(() => {
    if (activeFilter.value === 'active') return tasks.value.filter((t) => !t.completed)
    if (activeFilter.value === 'completed') return tasks.value.filter((t) => t.completed)
    return tasks.value
  })

  const stats = computed(() => ({
    total: tasks.value.length,
    completed: tasks.value.filter((t) => t.completed).length,
    remaining: tasks.value.filter((t) => !t.completed).length,
  }))

  // STEP 3 of 5 — mutations.
  // These are plain functions. There is no special Vue API for "a function that
  // changes state" — you just reassign or mutate a `ref`'s `.value`, and every
  // computed()/template that depends on it updates on the next tick.
  /**
   * Appends a new task. Called by TaskForm.vue's submit handler.
   * @param text raw text typed into the form's input field.
   */
  function addTask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    tasks.value.push({ id: nextId++, text: trimmed, completed: false })
  }

  /**
   * Flips one task's completed flag. Called by TaskItem.vue via an event that
   * bubbles up through TaskList.vue — see docs/04_CODE_WALKTHROUGH.md.
   * @param id the task to toggle.
   */
  function toggleTask(id: number) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.completed = !task.completed
  }

  /**
   * Removes a task permanently. Called by TaskItem.vue's delete button.
   * @param id the task to remove.
   */
  function removeTask(id: number) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  /**
   * Changes which subset of tasks `filteredTasks` returns. Called by
   * FilterTabs.vue when a tab is clicked.
   * @param filter the new filter to apply.
   */
  function setFilter(filter: TaskFilter) {
    activeFilter.value = filter
  }

  // STEP 4 of 5 — nothing runs yet. Composables set state up; they don't render
  // anything themselves. Rendering only happens once a component's <template>
  // reads these returned values.

  // STEP 5 of 5 — return everything the caller (App.vue) needs to hand down to
  // child components as props, and to wire up as event handlers.
  return {
    tasks,
    activeFilter,
    filteredTasks,
    stats,
    addTask,
    toggleTask,
    removeTask,
    setFilter,
  }
}
