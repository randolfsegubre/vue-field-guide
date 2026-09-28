# 05 — API Integration: Vue.js Talking to a Real ASP.NET Core Web API

The Task Board page keeps its data in the browser tab's memory (see
[docs/04_CODE_WALKTHROUGH.md](04_CODE_WALKTHROUGH.md)). The **API Demo**
page does the same job — add, check off, delete a task — but every
operation is a genuine Hypertext Transfer Protocol (HTTP) request to a
real ASP.NET Core Web API running as its own separate process. This
document covers everything specific to that arrangement: running two
processes together, Cross-Origin Resource Sharing (CORS), environment
variables, and a full request trace for one click.

## 1. Running both halves together

Two terminals, two processes — nothing shares a process with anything
described in [docs/01_SETUP.md](01_SETUP.md):

```bash
# Terminal 1 — the API (from the repository root)
cd server/VueFieldGuide.Api
dotnet run
# -> Now listening on: http://localhost:5125

# Terminal 2 — the Vue.js app (from the repository root)
npm run dev
# -> Local: http://localhost:5173/
```

Open `http://localhost:5173/api-demo`. If the API isn't running yet, the
page shows a specific error and a **Retry** button rather than a blank
screen or a cryptic browser console error — see
[`useApiTasks.ts:114-123`](../src/composables/useApiTasks.ts#L114-L123)
and Section 5 below.

## 2. The API itself

[`server/VueFieldGuide.Api/`](../server/VueFieldGuide.Api/) is a small,
real ASP.NET Core minimal Application Programming Interface (API) project
— not a mock, not hand-written JSON files. It exposes:

| Method | Route | Defined at | Mirrors (frontend) |
|---|---|---|---|
| `GET` | `/api/tasks` | [`Program.cs:48`](../server/VueFieldGuide.Api/Program.cs#L48) | `filteredTasks` read |
| `POST` | `/api/tasks` | [`Program.cs:57-68`](../server/VueFieldGuide.Api/Program.cs#L57-L68) | `addTask` |
| `PATCH` | `/api/tasks/{id}/toggle` | [`Program.cs:74-79`](../server/VueFieldGuide.Api/Program.cs#L74-L79) | `toggleTask` |
| `DELETE` | `/api/tasks/{id}` | [`Program.cs:85-87`](../server/VueFieldGuide.Api/Program.cs#L85-L87) | `removeTask` |

Every handler takes a `TaskStore` parameter — minimal APIs inject it
automatically because it's registered with
`builder.Services.AddSingleton<TaskStore>()` at
[`Program.cs:16`](../server/VueFieldGuide.Api/Program.cs#L16). `TaskStore`
itself ([`Services/TaskStore.cs`](../server/VueFieldGuide.Api/Services/TaskStore.cs))
is a plain in-memory `List<TaskItem>` behind a `Lock` — real enough to
demonstrate a full HTTP round trip, explicitly **not** meant as a template
for a production data layer (its own summary comment says so).

You can call it directly without the Vue.js app at all — either with
[`VueFieldGuide.Api.http`](../server/VueFieldGuide.Api/VueFieldGuide.Api.http)
in an editor that supports `.http` files, or with `curl`:

```bash
curl http://localhost:5125/api/tasks
```

## 3. Cross-Origin Resource Sharing (CORS)

The Vue.js dev server (`http://localhost:5173`) and the API
(`http://localhost:5125`) are different **origins** (different ports count
as different origins). Browsers block a page's `fetch()` calls to a
different origin by default unless that origin's server explicitly allows
it — that permission mechanism is called CORS. This project's API grants it
narrowly, for exactly the Vue.js dev server's origin, at
[`Program.cs:23-29`](../server/VueFieldGuide.Api/Program.cs#L23-L29):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy(VueDevClientPolicy, policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});
```

`app.UseCors(VueDevClientPolicy)` at
[`Program.cs:39`](../server/VueFieldGuide.Api/Program.cs#L39) then applies
that policy to every request. Comment that line out and reload the API
Demo page: the browser console will show a CORS error, and
`useApiTasks.ts`'s `fetchTasks()` will land in its `catch` block exactly
the same way it does when the API isn't running at all — from the
frontend's point of view, a blocked CORS request and a dead server both
surface as a failed `fetch()`.

## 4. Environment variables and the API's base URL

The frontend needs to know the API's address without hard-coding it
directly inside `useApiTasks.ts`. Vite's mechanism for this is a `.env`
file at the repository root:

```
# .env
VITE_API_BASE_URL=http://localhost:5125
```

Only variables prefixed `VITE_` are exposed to browser code (anything else
in `.env` stays server/build-tool-only, which matters once a `.env` file
holds a real secret in a larger project). It's read at
[`useApiTasks.ts:19`](../src/composables/useApiTasks.ts#L19):

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5125'
```

[`env.d.ts`](../env.d.ts) declares the TypeScript type for
`import.meta.env.VITE_API_BASE_URL`, so referencing it is type-checked
instead of silently typed `any`. Change the API's port (or point at a
deployed API somewhere else entirely) by editing `.env` alone — no source
file under `src/` needs to change.

## 5. Full trace: adding a task on the API Demo page

**User action:** types text into the API Demo's form, presses Enter.

1. This reuses **the same `TaskForm.vue`** as the Task Board — same file,
   same `handleSubmit`, same `emit('add', draftText.value)` (see
   [docs/04_CODE_WALKTHROUGH.md, Trace 1](04_CODE_WALKTHROUGH.md#trace-1--adding-a-task),
   steps 1-4). The only difference starts at the next step.

2. `ApiDemoView.vue` wired `<TaskForm @add="addTask" />` —
   [`ApiDemoView.vue:51`](../src/views/ApiDemoView.vue#L51) — where `addTask`
   is `useApiTasks()`'s version, destructured at
   [`ApiDemoView.vue:16`](../src/views/ApiDemoView.vue#L16).

3. `addTask` runs — [`useApiTasks.ts:53-71`](../src/composables/useApiTasks.ts#L53-L71).
   It trims the text exactly like the local version, then calls:
   ```ts
   const response = await fetch(`${API_BASE}/api/tasks`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ text: trimmed }),
   })
   ```
   The `await` here is why this function is declared `async function
   addTask` — execution pauses at this line, without blocking the rest of
   the page, until the network request resolves.

4. The request arrives at the API's
   [`Program.cs:57`](../server/VueFieldGuide.Api/Program.cs#L57) handler.
   ASP.NET Core deserializes the JSON body into a `CreateTaskRequest`
   record ([`Program.cs:93`](../server/VueFieldGuide.Api/Program.cs#L93))
   automatically, based on its parameter type — no manual JSON parsing
   code anywhere in this project.

5. The handler trims the text again server-side
   ([`Program.cs:59`](../server/VueFieldGuide.Api/Program.cs#L59)) —
   deliberately not trusting the client's own trimming — and calls
   `store.Add(trimmed)`, defined at
   [`TaskStore.cs:51-59`](../server/VueFieldGuide.Api/Services/TaskStore.cs#L51-L59),
   which appends a new `TaskItem` with a server-assigned `id` inside a
   `lock` (so two simultaneous requests can't corrupt `_nextId`).

6. The handler returns `Results.Created($"/api/tasks/{created.Id}",
   created)` — an HTTP 201 response whose body is the new task, serialized
   to JSON automatically (camelCase field names by default, matching the
   frontend's `Task` interface exactly).

7. Back in `addTask` (step 3), `await response.json()` resolves with that
   same object, typed as `Task`, and
   `tasks.value.push(created)` adds it to the reactive array — the same
   reactivity mechanism from [docs/02_GUIDE.md, Level 3](02_GUIDE.md#level-3--reactive-state)
   takes over from here identically to the local demo: `TaskList.vue`'s
   `v-for` renders the new `TaskItem`, `TaskStats.vue`'s counts update.

8. If any step from 3 through 7 fails — network down, CORS blocked, a
   non-2xx response — the `catch` block at
   [`useApiTasks.ts:68-70`](../src/composables/useApiTasks.ts#L68-L70)
   sets `error.value` instead, and `ApiDemoView.vue`'s
   `v-else-if="error"` branch —
   [`ApiDemoView.vue:45-48`](../src/views/ApiDemoView.vue#L45-L48) — renders
   the error banner with its **Retry** button in place of the task list.

The toggle and remove traces follow the identical shape: same
`TaskItem.vue` emits the same event, a different composable
(`useApiTasks.ts` instead of `useTasks.ts`) catches it, and that
composable's version calls `fetch()` with `PATCH`/`DELETE` instead of
mutating a local array — see
[`useApiTasks.ts:79-90`](../src/composables/useApiTasks.ts#L79-L90) and
[`useApiTasks.ts:97-108`](../src/composables/useApiTasks.ts#L97-L108).
