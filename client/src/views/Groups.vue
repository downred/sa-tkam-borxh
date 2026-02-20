<template>
  <div class="groups-page">
    <!-- Header -->
    <div class="groups-header">
      <h1 class="header-title">Your Groups</h1>
      <p class="header-subtitle">{{ groups.length }} group{{ groups.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Groups Card -->
    <div class="groups-card">
      <!-- Loading State -->
      <div v-if="loading" class="groups-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- Empty State -->
      <div v-else-if="groups.length === 0" class="groups-empty">
        <Users class="w-16 h-16 text-secondary-300 mb-4" />
        <p class="text-secondary-600 text-lg font-medium">No groups yet</p>
        <p class="text-secondary-400 text-sm mt-1 mb-6">Create a group to start splitting expenses</p>
        <router-link to="/create-group" class="btn-create">
          <Plus class="w-5 h-5" />
          Create Group
        </router-link>
      </div>

      <!-- Groups List -->
      <div v-else class="groups-list">
        <div 
          v-for="group in groups" 
          :key="group._id" 
          class="group-item"
          @click="viewGroup(group._id)"
        >
          <div class="group-icon" :class="`group-icon--${group.type?.toLowerCase() || 'other'}`">
            <component :is="getGroupIcon(group.type)" />
          </div>
          <div class="group-info">
            <p class="group-name">{{ group.name }}</p>
            <p class="group-meta">
              <span class="group-type">{{ group.type || 'Other' }}</span>
              <span class="group-separator">•</span>
              <span class="group-members">{{ group.members?.length || 1 }} member{{ group.members?.length !== 1 ? 's' : '' }}</span>
            </p>
          </div>
          <ChevronRight class="group-arrow" />
        </div>
      </div>

      <!-- Create Group FAB (when groups exist) -->
      <router-link 
        v-if="groups.length > 0" 
        to="/create-group" 
        class="fab-create"
      >
        <Plus class="w-6 h-6" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, 
  Plus, 
  Loader2, 
  ChevronRight,
  Plane,
  Home,
  Heart,
  CreditCard,
  MoreHorizontal
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'

const router = useRouter()
const groupsStore = useGroupsStore()

const groups = computed(() => groupsStore.groups)
const loading = computed(() => groupsStore.loading)

const getGroupIcon = (type) => {
  const icons = {
    Trip: Plane,
    Home: Home,
    Family: Heart,
    Subscription: CreditCard,
    Other: MoreHorizontal
  }
  return icons[type] || MoreHorizontal
}

const viewGroup = (groupId) => {
  // TODO: Navigate to group detail page
  console.log('View group:', groupId)
}

onMounted(() => {
  groupsStore.fetchGroups()
})
</script>

<style lang="scss" scoped>
.groups-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.groups-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.header-title {
  @apply text-2xl font-bold text-white mb-1;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.header-subtitle {
  @apply text-primary-200 text-sm;
}

// Card
.groups-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-24 relative;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-lg flex-none shadow-2xl pb-6;
  }
}

// Loading
.groups-loading {
  @apply flex items-center justify-center py-20;
}

// Empty State
.groups-empty {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.btn-create {
  @apply inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors;
}

// Groups List
.groups-list {
  @apply space-y-3;
}

.group-item {
  @apply flex items-center gap-4 p-4 bg-secondary-50 rounded-xl cursor-pointer transition-all;
  @apply hover:bg-secondary-100 hover:shadow-sm;
}

.group-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;

  &--trip {
    @apply bg-blue-100 text-blue-600;
  }

  &--home {
    @apply bg-green-100 text-green-600;
  }

  &--family {
    @apply bg-pink-100 text-pink-600;
  }

  &--subscription {
    @apply bg-purple-100 text-purple-600;
  }

  &--other {
    @apply bg-secondary-100 text-secondary-600;
  }

  svg {
    @apply w-6 h-6;
  }
}

.group-info {
  @apply flex-1 min-w-0;
}

.group-name {
  @apply font-semibold text-secondary-800 truncate;
}

.group-meta {
  @apply text-sm text-secondary-500 flex items-center gap-1.5;
}

.group-separator {
  @apply text-secondary-300;
}

.group-arrow {
  @apply w-5 h-5 text-secondary-400;
}

// FAB
.fab-create {
  @apply fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg;
  @apply flex items-center justify-center;
  @apply hover:bg-primary-700 transition-colors;

  @media (min-width: 768px) {
    @apply absolute bottom-6 right-6;
  }
}
</style>
