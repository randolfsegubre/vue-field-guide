<script setup lang="ts">
// FilterTabs.vue shows a v-for loop driven by a plain (non-reactive) local
// array of options, combined with dynamic class binding to highlight
// whichever tab matches the `activeFilter` prop currently passed in.
import type { TaskFilter } from '../composables/useTasks'

defineProps<{
  activeFilter: TaskFilter
}>()

const emit = defineEmits<{
  change: [filter: TaskFilter]
}>()

// A plain constant, not a ref — it never changes at runtime, so it does not
// need to be reactive. Only state that CAN change over time needs ref()/
// reactive(); static lookup data like this does not.
const options: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

/**
 * Runs when a tab button is clicked. Bound in the template as
 * `@click="selectFilter(option.value)"`.
 * @param filter the TaskFilter value baked into the specific button clicked —
 *   NOT the native DOM click event. Because the template calls this function
 *   with an explicit argument (rather than just `@click="selectFilter"`),
 *   Vue passes exactly that argument through and discards the DOM event.
 */
function selectFilter(filter: TaskFilter) {
  emit('change', filter)
}
</script>

<template>
  <div class="filter-tabs">
    <!--
      v-for="option in options": renders one <button> per entry in the
      `options` array above. `:key="option.value"` gives Vue a stable
      identity per item so it can correctly reuse/reorder DOM elements
      instead of tearing them all down and rebuilding them on every change.

      :class="{ active: option.value === activeFilter }" is Vue's OBJECT
      SYNTAX for dynamic classes: the `active` CSS class is applied only
      when the condition inside the object is true. Because `activeFilter`
      is a prop, this whole expression re-evaluates automatically whenever
      App.vue changes which filter is active.
    -->
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="tab"
      :class="{ active: option.value === activeFilter }"
      @click="selectFilter(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: var(--color-surface);
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--color-text);
}

.tab.active {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
  color: white;
}
</style>
