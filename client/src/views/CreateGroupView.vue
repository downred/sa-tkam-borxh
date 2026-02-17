<template>
  <div class="create-group-page">
    <div class="create-group-header">
      <h1 class="header-title">{{ step === 'create' ? 'New Group' : 'Add Members' }}</h1>
    </div>

    <div class="create-group-card">
      <CreateGroup v-if="step === 'create'" @created="handleCreated" />
      <AddGroupMembers 
        v-else 
        @skip="handleFinish" 
        @done="handleFinish" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CreateGroup from '../components/CreateGroup.vue'
import AddGroupMembers from '../components/AddGroupMembers.vue'

const router = useRouter()
const step = ref('create')
const groupData = ref(null)

const handleCreated = (data) => {
  groupData.value = data
  step.value = 'members'
}

const handleFinish = (members) => {
  console.log('Group created:', groupData.value, 'Members:', members)
  router.push('/expenses')
}
</script>

<style lang="scss" scoped>
.create-group-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

.create-group-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.header-title {
  @apply text-2xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.create-group-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-md flex-none shadow-2xl;
  }
}
</style>
