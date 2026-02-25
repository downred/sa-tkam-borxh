<template>
  <div id="app">
    <router-view />
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BottomNav from './components/BottomNav.vue';

const route = useRoute();

const showNav = computed(() => {
  
  const noNavRoutes = ['Login', 'Register', 'Home', 'CreateGroup', 'CreateExpense', 'EditExpense', 'SettleUpSelect', 'SettleUpAmount'];
  return route.meta?.requiresAuth && !noNavRoutes.includes(route.name);
});
</script>
