<template>
  <div class="account-page">
    <!-- Header -->
    <div class="account-header">
      <h1 class="account-title">Account</h1>
    </div>

    <!-- Account Info Row -->
    <div class="account-card">
      <div class="account-row" @click="editProfile">
        <div class="account-row__icon">
          <User />
        </div>
        <div class="account-row__content">
          <p class="account-row__label">Profile</p>
          <p class="account-row__value">{{ user?.name || 'User' }}</p>
          <p class="account-row__sub">{{ user?.email || '' }}</p>
        </div>
        <ChevronRight class="account-row__arrow" />
      </div>

      <div class="divider"></div>

      <!-- Logout Row -->
      <div class="account-row account-row--danger" @click="handleLogout">
        <div class="account-row__icon account-row__icon--danger">
          <LogOut />
        </div>
        <div class="account-row__content">
          <p class="account-row__label account-row__label--danger">Log Out</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, LogOut, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const editProfile = () => {
  // TODO: Navigate to edit profile
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.account-page {
  @apply min-h-screen bg-secondary-50 pb-8;
}

.account-header {
  @apply bg-white px-6 py-8 shadow-sm;
}

.account-title {
  @apply text-2xl font-bold text-secondary-800;
}

.account-card {
  @apply mx-4 mt-6 bg-white rounded-xl shadow-sm overflow-hidden;
}

.account-row {
  @apply flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors;

  &:hover {
    @apply bg-secondary-50;
  }

  &--danger:hover {
    @apply bg-red-50;
  }

  &__icon {
    @apply w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600;

    &--danger {
      @apply bg-red-100 text-red-600;
    }
  }

  &__content {
    @apply flex-1;
  }

  &__label {
    @apply text-sm font-medium text-secondary-800;

    &--danger {
      @apply text-red-600;
    }
  }

  &__value {
    @apply text-base font-semibold text-secondary-900;
  }

  &__sub {
    @apply text-xs text-secondary-500;
  }

  &__arrow {
    @apply w-5 h-5 text-secondary-400;
  }
}

.divider {
  @apply h-px bg-secondary-100 mx-4;
}
</style>
