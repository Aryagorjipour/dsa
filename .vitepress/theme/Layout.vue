<script setup>
import DefaultTheme from 'vitepress/theme'
import DSAExplorer from './components/DSAExplorer.vue'
import DSALogo from './components/DSALogo.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- Inject our explorer into the right aside area -->
    <template #aside-outline-before>
      <DSAExplorer />
    </template>

    <!-- Use our logo in places if needed -->
    <template #nav-bar-title-before>
      <DSALogo style="height: 28px; width: auto; margin-right: 8px;" />
    </template>
  </Layout>
</template>