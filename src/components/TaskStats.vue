<script setup lang="ts">
// TaskStats.vue is the simplest component in this app on purpose: it has
// PROPS but no EMITS. Data only ever flows into it, never back out. In the
// anatomy diagram (docs/03_ANATOMY.md) this is labelled a "read-only organ" —
// like a gauge on a dashboard, it displays a number but can't change the
// engine itself.

// `defineProps` is a compiler macro that declares what this component
// accepts from its parent, and gives full type-checking on the shape.
// App.vue supplies this via `:stats="stats"` (see src/App.vue's <template>).
defineProps<{
  stats: {
    total: number
    completed: number
    remaining: number
  }
}>()
</script>

<template>
  <!--
    Every `{{ stats.xxx }}` below is TEXT INTERPOLATION: Vue replaces it with
    the current value and re-renders it automatically whenever the `stats`
    prop object changes shape — which happens because App.vue passed in the
    `stats` COMPUTED ref from useTasks.ts, and that computed re-runs whenever
    any task's `completed` flag changes.
  -->
  <div class="stats">
    <div class="stat">
      <span class="stat-value">{{ stats.total }}</span>
      <span class="stat-label">total</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ stats.remaining }}</span>
      <span class="stat-label">remaining</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ stats.completed }}</span>
      <span class="stat-label">done</span>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
