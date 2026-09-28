<script setup lang="ts">
// AboutView.vue is the in-app counterpart to the docs/ folder: a page a
// learner can read WITHOUT leaving the running app or opening a text
// editor. It renders no dynamic data of its own — it is almost pure
// template — which makes it a good second example (alongside
// TaskStats.vue) of a component with no reactive state at all.
</script>

<template>
  <section class="about">
    <h1>How This App Was Built</h1>
    <p class="lede">
      This page is the in-app version of the repository's <code>docs/</code>
      folder. Read this for the short version; read the linked files on
      GitHub for the full, line-by-line detail.
    </p>

    <h2>1. What this app is</h2>
    <p>
      A small task board, deliberately kept simple, built to teach Vue.js 3
      by being read rather than just used. Every file under
      <code>src/</code> is commented to explain <em>why</em> a line exists,
      not just what it does.
    </p>

    <h2>2. The concepts it demonstrates</h2>
    <ul>
      <li>
        <strong>Single File Components</strong> — every <code>.vue</code>
        file combines its markup, logic, and styles in one place
        (<code>&lt;template&gt;</code>, <code>&lt;script setup&gt;</code>,
        <code>&lt;style scoped&gt;</code>).
      </li>
      <li>
        <strong>Reactive state</strong> — <code>ref()</code> and
        <code>computed()</code>, both defined in one shared composable,
        <code>src/composables/useTasks.ts</code>.
      </li>
      <li>
        <strong>Props down, events up</strong> — components never mutate
        data they don't own; they emit a request and let the owner decide.
      </li>
      <li>
        <strong>Vue Router</strong> — this very page. The three tabs in the
        navigation bar above are <code>&lt;router-link&gt;</code> elements;
        <code>src/router/index.ts</code> maps each path to a view component
        under <code>src/views/</code>.
      </li>
      <li>
        <strong>Calling a real backend</strong> — the
        <router-link to="/api-demo">API Demo</router-link> page does the same
        task-list job as the Task Board, but reads and writes through
        <code>fetch()</code> calls to a real ASP.NET Core Web API instead of
        an in-browser array. See
        <code>src/composables/useApiTasks.ts</code> and
        <code>server/VueFieldGuide.Api/</code>.
      </li>
    </ul>

    <h2>3. How it was scaffolded</h2>
    <p>
      Started from Vue's own official generator,
      <code>npm create vue@latest -- --default</code> (Vue 3 + TypeScript +
      Vite, nothing else pre-selected), then built up by hand from there —
      no other code generation was used for the application code itself.
    </p>

    <h2>4. Where the deep detail lives</h2>
    <p>On GitHub, read in this order:</p>
    <ol>
      <li>
        <a
          href="https://github.com/randolfsegubre/vue-field-guide/blob/master/docs/01_SETUP.md"
          target="_blank"
          rel="noopener"
          >docs/01_SETUP.md</a
        >
        — setting up a Vue.js project from nothing.
      </li>
      <li>
        <a
          href="https://github.com/randolfsegubre/vue-field-guide/blob/master/docs/02_GUIDE.md"
          target="_blank"
          rel="noopener"
          >docs/02_GUIDE.md</a
        >
        — the terminology glossary, beginner to hero.
      </li>
      <li>
        <a
          href="https://github.com/randolfsegubre/vue-field-guide/blob/master/docs/03_ANATOMY.md"
          target="_blank"
          rel="noopener"
          >docs/03_ANATOMY.md</a
        >
        — a diagram of every component's single job and its connections.
      </li>
      <li>
        <a
          href="https://github.com/randolfsegubre/vue-field-guide/blob/master/docs/04_CODE_WALKTHROUGH.md"
          target="_blank"
          rel="noopener"
          >docs/04_CODE_WALKTHROUGH.md</a
        >
        — five traces of a click through every function it touches.
      </li>
      <li>
        <a
          href="https://github.com/randolfsegubre/vue-field-guide/blob/master/docs/05_API_INTEGRATION.md"
          target="_blank"
          rel="noopener"
          >docs/05_API_INTEGRATION.md</a
        >
        — how the Vue app and the ASP.NET Core Web API talk to each other.
      </li>
    </ol>
  </section>
</template>

<style scoped>
.about {
  max-width: 640px;
}

.about h1 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

.lede {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.about h2 {
  font-size: 1.05rem;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.about p,
.about li {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-text);
}

.about code {
  background: var(--color-surface);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.about a {
  color: var(--color-accent);
}

.about ul,
.about ol {
  padding-left: 1.25rem;
}

.about li {
  margin-bottom: 0.4rem;
}
</style>
