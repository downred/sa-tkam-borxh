<template>
  <nav class="bottom-nav">
    <router-link 
      to="/groups" 
      class="nav-item"
      :class="{ 'nav-item--active': isActive('/groups') }"
    >
      <LayoutGrid class="nav-icon" />
      <span class="nav-label">Groups</span>
    </router-link>
    
    <router-link 
      to="/friends" 
      class="nav-item"
      :class="{ 'nav-item--active': isActive('/friends') }"
    >
      <Heart class="nav-icon" />
      <span class="nav-label">Friends</span>
    </router-link>
    
    <router-link 
      to="/account" 
      class="nav-item"
      :class="{ 'nav-item--active': isActive('/account') }"
    >
      <CircleUser class="nav-icon" />
      <span class="nav-label">Account</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutGrid, Heart, CircleUser } from 'lucide-vue-next';

const route = useRoute();

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style lang="scss" scoped>
.bottom-nav {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200;
  @apply flex items-center justify-around py-2 px-4 z-50;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  
  @media (min-width: 768px) {
    @apply hidden;
  }
}

.nav-item {
  @apply flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors;
  @apply text-secondary-400;
  
  &:hover {
    @apply text-secondary-600 bg-secondary-50;
  }
  
  &--active {
    @apply text-primary-600;
    
    &:hover {
      @apply text-primary-600 bg-primary-50;
    }
  }
}

.nav-icon {
  @apply w-6 h-6;
}

.nav-label {
  @apply text-xs font-medium;
}
</style>
