<script setup lang="ts">
// TaskForm.vue demonstrates three things in one small file:
//   1. LOCAL component state (the draft text) that never leaves this component.
//   2. A TEMPLATE REF (a direct handle to a real DOM element).
//   3. A LIFECYCLE HOOK (code that runs at a specific point in the component's
//      life — here, "just after this component's DOM has been inserted").
import { ref, onMounted } from 'vue'

// `draftText` is local state: it is declared with `ref()` just like the task
// list in useTasks.ts, but because it is declared HERE instead of in a shared
// composable, no other component can see or change it. This is the Vue
// equivalent of a private field on a class — scoped to one instance.
const draftText = ref('')

// `emit` is how a child component talks to its parent (App.vue). Vue requires
// declaring up front which event names are allowed to be emitted; `defineEmits`
// is a compiler macro (no import needed) that does that declaration.
const emit = defineEmits<{
  add: [text: string]
}>()

// `inputEl` starts as `null` and is filled in automatically by Vue once the
// <input> below (which has `ref="inputEl"`) exists in the real DOM. Reading
// `inputEl.value` before that point would still be null.
const inputEl = ref<HTMLInputElement | null>(null)

/**
 * Runs the form's submit event. Bound in the template via `@submit.prevent`.
 * `.prevent` is Vue's shorthand for calling `event.preventDefault()` for you,
 * so this function never has to touch the raw DOM event at all — it only
 * needs the current value of `draftText`.
 */
function handleSubmit() {
  // `emit('add', ...)` does not change anything in THIS component. It sends
  // the string up to whichever parent used `@add="..."` on <TaskForm> — in
  // this app, that is App.vue, which wired `@add="addTask"`. Tracing what
  // happens after that point is covered in docs/04_CODE_WALKTHROUGH.md.
  emit('add', draftText.value)
  draftText.value = '' // clear the input by resetting the ref that v-model is bound to
}

// onMounted registers a callback that Vue calls exactly once, right after
// this component's elements have been created and attached to the real page.
// Autofocusing the input here is only possible BECAUSE the DOM element (and
// therefore inputEl.value) is guaranteed to exist by this point — calling
// inputEl.value.focus() at the top of <script setup> would fail, since the
// <input> element does not exist in the DOM yet at that earlier point in time.
onMounted(() => {
  inputEl.value?.focus()
})
</script>

<template>
  <!--
    @submit.prevent="handleSubmit": v-on:submit, with the .prevent modifier,
    calling the function declared above. No arguments are passed explicitly —
    handleSubmit reads draftText.value directly rather than receiving it as a
    parameter, since draftText is in scope for the whole <script setup> block.
  -->
  <form class="task-form" @submit.prevent="handleSubmit">
    <!--
      v-model="draftText" is shorthand for binding :value="draftText" AND
      listening for @input to write back into draftText.value on every
      keystroke. It is what keeps `draftText` in <script> perfectly in sync
      with what the user sees typed on screen, in both directions.
      ref="inputEl" is unrelated to v-model — it is what makes Vue populate
      the `inputEl` variable above with this real <input> DOM node.
    -->
    <input
      ref="inputEl"
      v-model="draftText"
      type="text"
      placeholder="Add a task and press Enter…"
      class="task-input"
    />
    <button type="submit" class="task-submit">Add</button>
  </form>
</template>

<style scoped>
.task-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.task-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--color-surface);
  color: var(--color-heading);
}

.task-submit {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--color-success);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.task-submit:hover {
  background: var(--color-success-strong);
}
</style>
