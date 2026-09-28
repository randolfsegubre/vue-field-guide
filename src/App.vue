<script setup lang="ts">
// App.vue used to hold the task board directly; since Vue Router was added
// it is now a thin SHELL shared by every page: a navigation bar plus
// <RouterView />, which renders whichever view component matches the
// current URL (see src/router/index.ts). The task board itself moved to
// src/views/TaskBoardView.vue — see docs/03_ANATOMY.md for the updated
// diagram of who owns what state after this change.
</script>

<template>
  <div class="shell">
    <nav class="nav">
      <span class="brand">Vue Field Guide</span>
      <!--
        <router-link> renders a real <a> tag but intercepts the click to
        update the URL and swap <router-view>'s content WITHOUT a full page
        reload — that interception is what keeps this a Single Page
        Application. `active-class` (Vue Router's default is `router-link-active`)
        is applied automatically to whichever link matches the current route.
      -->
      <router-link to="/" class="nav-link">Task Board</router-link>
      <router-link to="/about" class="nav-link">Tutorial</router-link>
      <router-link to="/api-demo" class="nav-link">API Demo</router-link>
    </nav>

    <main class="content">
      <!--
        <router-view> is where the matched view component actually renders.
        Swap the URL between /, /about, and /api-demo and only the content
        inside this tag changes — the <nav> above never re-renders.
      -->
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  font-weight: 700;
  color: #111827;
  margin-right: 0.5rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}

.nav-link:hover {
  color: #111827;
}

/* Vue Router's default class for whichever link matches the current route. */
.nav-link.router-link-active {
  color: #111827;
  font-weight: 600;
  border-bottom: 2px solid #6366f1;
}
</style>
