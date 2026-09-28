namespace VueFieldGuide.Api.Models;

/// <summary>
/// A single to-do item, shaped to match the <c>Task</c> interface the Vue.js
/// frontend declares in <c>src/composables/useTasks.ts</c>. Keeping the two
/// shapes identical (same field names, same casing after JSON serialization)
/// is what lets the frontend's <c>useApiTasks.ts</c> composable deserialize a
/// response straight into the same TypeScript type it already uses for the
/// in-browser demo.
/// </summary>
/// <param name="Id">Server-assigned identifier, unique for the process lifetime.</param>
/// <param name="Text">The task's display text, already trimmed.</param>
/// <param name="Completed">Whether the task has been checked off.</param>
public record TaskItem(int Id, string Text, bool Completed);
