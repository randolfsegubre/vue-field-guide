<script setup lang="ts">
// App.vue is the ROOT component — the one Vue mounts into <div id="app"> in
// index.html (see src/main.ts). In the anatomy analogy used throughout
// docs/03_ANATOMY.md, this file is the "torso": it is the only place that
// calls useTasks(), so it is the only place that owns the task list. Every
// child component below is "limbs" that receive data through props and
// report actions back up through emitted events — they hold no task data
// of their own.
import { useTasks } from './composables/useTasks'
import FilterTabs from './components/FilterTabs.vue'
import TaskForm from './components/TaskForm.vue'
import TaskStats from './components/TaskStats.vue'
import TaskList from './components/TaskList.vue'

// Calling the composable here (once) is what makes the state shared: every
// destructured value below is the SAME reactive ref/computed instance, no
// matter which child component ends up reading or triggering it.
const { filteredTasks, stats, activeFilter, addTask, toggleTask, removeTask, setFilter } =
  useTasks()
</script>

<template>
  <main class="board">
    <header class="board-header">
      <h1>Vue Field Guide — Task Board</h1>
      <p class="subtitle">
        A tiny Vue 3 app built to be read, not just run. See
        <code>docs/</code> in the repository root for the full walkthrough.
      </p>
    </header>

    <!--
      TaskForm only needs to emit a string upward; it has no idea a `tasks`
      array even exists. Vue convention: v-on:add is written @add.
      `addTask` is the composable's function, imported above — TaskForm never
      sees it, it only ever fires the `add` event and Vue routes it here.
    -->
    <TaskForm @add="addTask" />

    <!--
      TaskStats gets a plain object of numbers computed by useTasks(). It is a
      pure "display" component: no emits section at all, because it never
      needs to talk back up. That absence is itself meaningful — see
      docs/03_ANATOMY.md's "read-only organs" section.
    -->
    <TaskStats :stats="stats" />

    <!--
      FilterTabs is handed the CURRENT filter (so it can highlight the active
      tab) and emits `change` when the user clicks a different one. `setFilter`
      is the composable function that actually updates `activeFilter`.
    -->
    <FilterTabs :active-filter="activeFilter" @change="setFilter" />

    <!--
      TaskList receives the already-filtered array (filteredTasks.value,
      auto-unwrapped in the template) and forwards two events upward:
      toggle and remove. Both ultimately call composable functions here.
    -->
    <TaskList :tasks="filteredTasks" @toggle="toggleTask" @remove="removeTask" />
  </main>
</template>

<style scoped>
.board {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
}

.board-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.subtitle code {
  background: #f3f4f6;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
</style>
