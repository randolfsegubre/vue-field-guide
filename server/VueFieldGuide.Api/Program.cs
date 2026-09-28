using VueFieldGuide.Api.Models;
using VueFieldGuide.Api.Services;

// This is the companion API described in docs/05_API_INTEGRATION.md: a real
// ASP.NET Core Web API that the Vue.js app's "API Demo" page talks to over
// HTTP, so the repository demonstrates a genuine full-stack round trip
// (Vue.js frontend -> fetch() -> ASP.NET Core -> back to Vue.js) rather than
// only the in-browser state shown on the main Task Board page.
var builder = WebApplication.CreateBuilder(args);

const string VueDevClientPolicy = "VueDevClient";

// STEP 1 of 3 — services.
// TaskStore is registered as a singleton (see Services/TaskStore.cs's own
// summary for why) so every request shares the same in-memory list.
builder.Services.AddSingleton<TaskStore>();
builder.Services.AddOpenApi();

// Vite's dev server runs on a different origin (http://localhost:5173) than
// this API (http://localhost:5125), so the browser's default same-origin
// policy would block the frontend's fetch() calls without an explicit CORS
// policy naming that origin.
builder.Services.AddCors(options =>
{
    options.AddPolicy(VueDevClientPolicy, policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// STEP 2 of 3 — middleware pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(VueDevClientPolicy);
app.UseHttpsRedirection();

// STEP 3 of 3 — endpoints. Every handler below takes TaskStore via minimal
// APIs' parameter injection (no [FromServices] attribute needed) and returns
// a plain TaskItem/array of TaskItem, which ASP.NET Core serializes to JSON
// automatically as the response body.

/// <summary>GET /api/tasks — returns every task, oldest first.</summary>
app.MapGet("/api/tasks", (TaskStore store) => store.GetAll())
   .WithName("GetTasks");

/// <summary>
/// POST /api/tasks — creates a task from a JSON body shaped like
/// <c>{ "text": "..." }</c>. Mirrors <c>addTask</c> in useTasks.ts: trims the
/// text and silently rejects an empty string, returning 400 instead of
/// creating a blank task.
/// </summary>
app.MapPost("/api/tasks", (CreateTaskRequest request, TaskStore store) =>
{
    var trimmed = request.Text.Trim();
    if (trimmed.Length == 0)
    {
        return Results.BadRequest(new { error = "Task text must not be empty." });
    }

    var created = store.Add(trimmed);
    return Results.Created($"/api/tasks/{created.Id}", created);
})
   .WithName("CreateTask");

/// <summary>
/// PATCH /api/tasks/{id}/toggle — flips one task's completed flag.
/// Mirrors <c>toggleTask</c> in useTasks.ts.
/// </summary>
app.MapPatch("/api/tasks/{id:int}/toggle", (int id, TaskStore store) =>
{
    var updated = store.Toggle(id);
    return updated is not null ? Results.Ok(updated) : Results.NotFound();
})
   .WithName("ToggleTask");

/// <summary>
/// DELETE /api/tasks/{id} — removes a task permanently. Mirrors
/// <c>removeTask</c> in useTasks.ts.
/// </summary>
app.MapDelete("/api/tasks/{id:int}", (int id, TaskStore store) =>
    store.Remove(id) ? Results.NoContent() : Results.NotFound())
   .WithName("DeleteTask");

app.Run();

/// <summary>Request body for <c>POST /api/tasks</c>.</summary>
/// <param name="Text">Raw, not-yet-trimmed task text from the client.</param>
record CreateTaskRequest(string Text);
