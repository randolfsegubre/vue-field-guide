<script setup lang="ts">
// ApiDemoView.vue is the API-backed twin of TaskBoardView.vue. It reuses the
// exact same TaskForm.vue / TaskStats.vue / TaskList.vue / TaskItem.vue
// components UNCHANGED — proof that those components never cared whether
// `addTask`/`toggleTask`/`removeTask` touched a local array or made a
// network call, because they only ever call functions passed down as props,
// never the composable itself. Only the composable underneath is different:
// useApiTasks.ts (async, can fail) instead of useTasks.ts (synchronous,
// can't). See docs/05_API_INTEGRATION.md for the full request trace.
import { computed, onMounted } from 'vue'
import { useApiTasks } from '../composables/useApiTasks'
import TaskForm from '../components/TaskForm.vue'
import TaskStats from '../components/TaskStats.vue'
import TaskList from '../components/TaskList.vue'

const { tasks, isLoading, error, fetchTasks, addTask, toggleTask, removeTask } = useApiTasks()

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter((t) => t.completed).length,
  remaining: tasks.value.filter((t) => !t.completed).length,
}))

// Unlike the local Task Board (whose seed data exists the instant useTasks()
// runs), the API-backed list starts empty until the first GET resolves —
// this is the one call in the whole app that has to run inside onMounted
// rather than at the top of <script setup>, since it kicks off real network
// I/O that shouldn't block the component from rendering its initial
// (loading) state first.
onMounted(fetchTasks)
</script>

<template>
  <section class="board">
    <header class="board-header">
      <h1>API Demo</h1>
      <p class="subtitle">
        Same task board, backed by a real ASP.NET Core Web API
        (<code>server/VueFieldGuide.Api</code>) instead of local state. Run
        <code>dotnet run</code> in that folder first, then reload this page.
      </p>
    </header>

    <p v-if="isLoading" class="status status-loading">Loading tasks from the API…</p>
    <p v-else-if="error" class="status status-error">
      {{ error }}
      <button type="button" class="retry-btn" @click="fetchTasks">Retry</button>
    </p>

    <template v-else>
      <TaskForm @add="addTask" />
      <TaskStats :stats="stats" />
      <TaskList :tasks="tasks" @toggle="toggleTask" @remove="removeTask" />
    </template>
  </section>
</template>

<style scoped>
.board-header h1 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.subtitle code {
  background: var(--color-surface);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.status {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.status-loading {
  background: var(--color-surface);
  color: var(--color-text);
}

.status-error {
  background: var(--color-danger-surface);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.retry-btn {
  border: 1px solid var(--color-danger);
  background: transparent;
  color: var(--color-danger);
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.retry-btn:hover {
  background: var(--color-danger-surface);
}
</style>
