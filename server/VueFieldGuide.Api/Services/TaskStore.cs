using VueFieldGuide.Api.Models;

namespace VueFieldGuide.Api.Services;

/// <summary>
/// In-memory task list, registered as a singleton so every request handles
/// the same shared state for the lifetime of the process. This intentionally
/// mirrors <c>src/composables/useTasks.ts</c> on the frontend — a composable
/// is a client-side singleton with a slightly different mechanism (module
/// scope plus reactivity) doing the same conceptual job as this class does
/// on the server (dependency-injection scope plus a lock).
///
/// Not for production use as written: state is lost on every restart, and a
/// real application would replace this with a database-backed repository
/// behind the same method signatures. It exists here purely so the Vue.js
/// app has a genuine HTTP round trip to demonstrate, without the setup cost
/// of a real database for a teaching repository.
/// </summary>
public class TaskStore
{
    private readonly List<TaskItem> _tasks;
    private readonly Lock _gate = new();
    private int _nextId;

    public TaskStore()
    {
        // STEP 1 of 2 — seed data, so the API Demo page shows something on
        // first load instead of an empty list (same reasoning as the three
        // seed tasks in useTasks.ts on the frontend).
        _tasks =
        [
            new TaskItem(1, "Fetch this list from the ASP.NET Core Web API", false),
            new TaskItem(2, "Toggle one and watch it PATCH the server", false),
            new TaskItem(3, "Everything below is real HTTP, not local state", false),
        ];
        // STEP 2 of 2 — start the id counter after the seed data's highest id.
        _nextId = _tasks.Count + 1;
    }

    /// <summary>Returns a snapshot of every task, oldest first.</summary>
    public IReadOnlyList<TaskItem> GetAll()
    {
        lock (_gate)
        {
            return [.. _tasks];
        }
    }

    /// <summary>Appends a new, incomplete task and returns it.</summary>
    /// <param name="text">Already-validated, non-empty task text.</param>
    public TaskItem Add(string text)
    {
        lock (_gate)
        {
            var task = new TaskItem(_nextId++, text, false);
            _tasks.Add(task);
            return task;
        }
    }

    /// <summary>
    /// Flips a task's <see cref="TaskItem.Completed"/> flag.
    /// </summary>
    /// <param name="id">The task to toggle.</param>
    /// <returns>The updated task, or <see langword="null"/> if no task has that id.</returns>
    public TaskItem? Toggle(int id)
    {
        lock (_gate)
        {
            var index = _tasks.FindIndex(t => t.Id == id);
            if (index < 0) return null;

            var updated = _tasks[index] with { Completed = !_tasks[index].Completed };
            _tasks[index] = updated;
            return updated;
        }
    }

    /// <summary>Removes a task permanently.</summary>
    /// <param name="id">The task to remove.</param>
    /// <returns><see langword="true"/> if a task was found and removed.</returns>
    public bool Remove(int id)
    {
        lock (_gate)
        {
            return _tasks.RemoveAll(t => t.Id == id) > 0;
        }
    }
}
