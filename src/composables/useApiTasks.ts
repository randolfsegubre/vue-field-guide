// useApiTasks.ts
//
// The API-backed counterpart to useTasks.ts. Same Task shape, same four
// operations (fetch/add/toggle/remove) — but every one of them now goes
// over the network to the ASP.NET Core Web API in server/VueFieldGuide.Api
// instead of touching a local array. Read useTasks.ts first if you haven't;
// this file's comments focus only on what's DIFFERENT about talking to a
// real backend: requests are asynchronous, they can fail, and the UI has to
// represent both of those possibilities explicitly. See
// docs/05_API_INTEGRATION.md for the full request/response trace.

import { ref } from 'vue'
import type { Task } from './useTasks'

// import.meta.env is Vite's build-time environment variable mechanism (not
// a Vue.js feature specifically). VITE_API_BASE_URL is read from the
// project's .env file at build/dev-server time; the fallback after `??`
// only applies if that variable were ever missing.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5125'

export function useApiTasks() {
  const tasks = ref<Task[]>([])
  // Two extra pieces of state that useTasks.ts never needed, because local
  // array operations are synchronous and can't fail. A network call can do
  // both: take time (isLoading) and fail (error) — a dropped connection, the
  // API not running, a CORS misconfiguration, a 404/500 response, and so on.
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * GET /api/tasks. Called once, from ApiDemoView.vue's onMounted, to load
   * the server's current list when the page first opens.
   */
  async function fetchTasks() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks`)
      if (!response.ok) throw new Error(`Server responded ${response.status}`)
      tasks.value = await response.json()
    } catch (err) {
      error.value = describeError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * POST /api/tasks. Called by ApiDemoTaskForm's submit handler (the same
   * component as TaskForm.vue's role in the local demo).
   * @param text raw text typed into the form's input field.
   */
  async function addTask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      if (!response.ok) throw new Error(`Server responded ${response.status}`)
      // The API returns the task IT created (with the server-assigned id),
      // so the frontend pushes that response, not a locally-guessed object.
      const created: Task = await response.json()
      tasks.value.push(created)
    } catch (err) {
      error.value = describeError(err)
    }
  }

  /**
   * PATCH /api/tasks/{id}/toggle. Called by the same TaskItem.vue component
   * used on the local Task Board — it emits `toggle(id)` either way; only
   * which composable is listening changes.
   * @param id the task to toggle.
   */
  async function toggleTask(id: number) {
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}/toggle`, { method: 'PATCH' })
      if (!response.ok) throw new Error(`Server responded ${response.status}`)
      const updated: Task = await response.json()
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = updated
    } catch (err) {
      error.value = describeError(err)
    }
  }

  /**
   * DELETE /api/tasks/{id}. Called by TaskItem.vue's delete button, exactly
   * like removeTask in useTasks.ts.
   * @param id the task to remove.
   */
  async function removeTask(id: number) {
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 404) {
        throw new Error(`Server responded ${response.status}`)
      }
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err) {
      error.value = describeError(err)
    }
  }

  return { tasks, isLoading, error, fetchTasks, addTask, toggleTask, removeTask }
}

/** Narrows an unknown catch-block value down to a displayable string. */
function describeError(err: unknown): string {
  if (err instanceof TypeError) {
    // fetch() rejects with a TypeError for network-level failures (server
    // not running, CORS blocked, DNS failure) — none of which produce an
    // HTTP status code to report, so this is the "is the API even running?"
    // case callers most often hit while working through this demo.
    return 'Could not reach the API. Is server/VueFieldGuide.Api running on port 5125?'
  }
  return err instanceof Error ? err.message : 'Unknown error'
}
