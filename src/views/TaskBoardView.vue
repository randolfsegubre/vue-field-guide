<script setup lang="ts">
// TaskBoardView.vue holds everything that used to live directly in App.vue.
// It moved here when Vue Router was added so that App.vue could become a
// thin shell (nav bar + <RouterView />) shared by every page. Nothing about
// the state-ownership story changed: this is still the ONLY place that
// calls useTasks(), so it is still the "torso" described in
// docs/03_ANATOMY.md — the anatomy diagram's file paths were updated to
// match this move (src/App.vue -> src/views/TaskBoardView.vue).
import { useTasks } from '../composables/useTasks'
import FilterTabs from '../components/FilterTabs.vue'
import TaskForm from '../components/TaskForm.vue'
import TaskStats from '../components/TaskStats.vue'
import TaskList from '../components/TaskList.vue'

const { filteredTasks, stats, activeFilter, addTask, toggleTask, removeTask, setFilter } =
  useTasks()
</script>

<template>
  <section class="board">
    <header class="board-header">
      <h1>Task Board</h1>
      <p class="subtitle">
        Local, in-browser state only — see the
        <router-link to="/api-demo">API Demo</router-link>
        page for the same idea backed by a real ASP.NET Core Web API instead.
      </p>
    </header>

    <TaskForm @add="addTask" />
    <TaskStats :stats="stats" />
    <FilterTabs :active-filter="activeFilter" @change="setFilter" />
    <TaskList :tasks="filteredTasks" @toggle="toggleTask" @remove="removeTask" />
  </section>
</template>

<style scoped>
.board-header h1 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.subtitle a {
  color: #6366f1;
}
</style>
