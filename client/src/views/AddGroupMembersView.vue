<template>
  <div class="add-members-page">
    <div class="add-members-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="header-title">Add Members</h1>
    </div>

    <div class="add-members-card">
      <AddGroupMembers :group-id="groupId" @skip="goBack" @done="handleDone" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AddGroupMembers from '../components/AddGroupMembers.vue'
import { useGroupsStore } from '../stores/groups'
import groupService from '../services/groupService'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()

const groupId = computed(() => route.params.id)

const goBack = () => {
  router.push(`/groups/${groupId.value}`)
}

const handleDone = async (members) => {
  if (members) {
    try {
      if (members.selectedFriends?.length > 0) {
        for (const userId of members.selectedFriends) {
          await groupsStore.addMember(groupId.value, userId)
        }
      }
      if (members.addedEmails?.length > 0) {
        for (const email of members.addedEmails) {
          await groupService.addMember(groupId.value, null, email)
        }
      }
    } catch (error) {
      console.error('Failed to add members:', error)
    }
  }
  goBack()
}
</script>

<style lang="scss" scoped>
.add-members-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

.add-members-header {
  @apply px-6 pt-12 pb-8 flex items-center gap-4;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.back-btn {
  @apply w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center;
  @apply hover:bg-white/30 transition-colors;
}

.header-title {
  @apply text-2xl font-bold text-white flex-1;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.add-members-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-24;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-md flex-none shadow-2xl pb-8;
  }
}
</style>
