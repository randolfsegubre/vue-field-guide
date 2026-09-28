<script setup lang="ts">
// TaskItem.vue is the "leaf" component — the one closest to the actual user
// click. It owns no state at all (no ref()/reactive() anywhere in this file):
// everything it shows comes from the `task` prop, and every action it allows
// is reported upward as an event. This is the clearest example in the app of
// Vue's "props down, events up" rule — see docs/03_ANATOMY.md.
import type { Task } from '../composables/useTasks'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()

/**
 * Bound to the checkbox's `@change`. Fires when the user checks/unchecks it.
 * Reads `props.task.id` (not the native event) and sends only that id
 * upward — TaskList.vue forwards it to App.vue, which calls the
 * composable's `toggleTask(id)` (src/composables/useTasks.ts). That function
 * flips `completed` on the matching task in the shared reactive array. Vue's
 * reactivity system then notices `task.completed` changed and re-renders
 * this exact TaskItem — closing the loop from click to visual update.
 */
function handleToggle() {
  emit('toggle', props.task.id)
}

/**
 * Bound to the delete button's `@click`. Same shape as handleToggle: emits
 * only the id, letting App.vue's `removeTask(id)` do the actual array
 * mutation. TaskItem itself never touches the tasks array.
 */
function handleRemove() {
  emit('remove', props.task.id)
}
</script>

<template>
  <!--
    :class="{ completed: task.completed }" — dynamic class binding again
    (see FilterTabs.vue for the same pattern). The `completed` CSS class,
    which applies the strikethrough style below, is added or removed purely
    as a side effect of `task.completed` changing — no direct DOM
    manipulation anywhere in this component.
  -->
  <li class="task-item" :class="{ completed: task.completed }">
    <!--
      :checked="task.completed" (one-way, prop-driven) rather than
      v-model="task.completed": this component is not allowed to mutate its
      own prop directly (Vue warns if you try). @change="handleToggle" is
      how the checkbox instead ASKS the parent chain to make that change, by
      emitting an event instead of assigning to the prop.
    -->
    <input type="checkbox" :checked="task.completed" @change="handleToggle" />

    <!-- Plain text interpolation: renders task.text, re-runs whenever it changes. -->
    <span class="task-text">{{ task.text }}</span>

    <!--
      @click="handleRemove": no arguments written in the template at all —
      handleRemove already has props.task.id in closure scope, so the click
      handler needs no parameters passed to it from the markup.
    -->
    <button type="button" class="remove-btn" aria-label="Remove task" @click="handleRemove">
      ✕
    </button>
  </li>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.task-text {
  flex: 1;
  font-size: 0.95rem;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #9ca3af;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0.25rem;
}

.remove-btn:hover {
  color: #b91c1c;
}
</style>
