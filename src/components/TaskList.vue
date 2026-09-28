<script setup lang="ts">
// TaskList.vue is a "middle-tier" component: it receives the task array as a
// prop from App.vue and renders one TaskItem per task, but it does not know
// HOW to toggle or remove a task — it just forwards those two events straight
// up to whoever is listening on <TaskList>. This pattern (receive an event
// from a child, immediately emit the same information further up) is called
// EVENT FORWARDING, and it is why TaskItem never needs to know App.vue exists.
import type { Task } from '../composables/useTasks'
import TaskItem from './TaskItem.vue'

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()
</script>

<template>
  <!--
    v-if / v-else: only one of these two branches is ever rendered. When the
    (already-filtered) `tasks` array is empty, Vue renders the <p> and skips
    the <ul> entirely — it does not render an empty, hidden list.
  -->
  <p v-if="tasks.length === 0" class="empty-state">No tasks in this view.</p>

  <ul v-else class="task-list">
    <!--
      Each TaskItem gets exactly one task via :task="task" (a PROP going
      down). @toggle="emit('toggle', $event)" listens for the `toggle` event
      that TaskItem fires and re-emits it upward with the same payload —
      `$event` here is whatever value TaskItem's own `emit('toggle', id)`
      call sent, i.e. that task's id (see TaskItem.vue). This is the
      "forwarding" step described above.
    -->
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', $event)"
      @remove="emit('remove', $event)"
    />
  </ul>
</template>

<style scoped>
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.empty-state {
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 1rem 0;
  text-align: center;
}
</style>
