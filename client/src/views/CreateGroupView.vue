<template>
  <div class="create-group-page">
    <div class="create-group-header">
      <h1 class="header-title">{{ step === 'create' ? 'New Group' : 'Add Members' }}</h1>
    </div>

    <div class="create-group-card">
      <CreateGroup 
        v-if="step === 'create'" 
        :loading="groupsStore.loading"
        :error="groupsStore.error"
        @created="handleCreated" 
      />
      <AddGroupMembers 
        v-else 
        :group-id="createdGroupId"
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
import { useGroupsStore } from '../stores/groups'

const router = useRouter()
const groupsStore = useGroupsStore()
const step = ref('create')
const createdGroupId = ref(null)

const handleCreated = async (data) => {
  try {
    // Map frontend type values to backend enum values
    const typeMap = {
      trip: 'Trip',
      home: 'Home',
      family: 'Family',
      subscription: 'Subscription',
      other: 'Other'
    }
    
    const groupData = {
      name: data.name,
      type: typeMap[data.type] || 'Other',
      settleUpReminders: data.settleReminders
    }
    
    // Add trip dates if it's a trip
    if (data.type === 'trip') {
      if (data.tripStartDate) groupData.startDate = data.tripStartDate
      if (data.tripEndDate) groupData.endDate = data.tripEndDate
    }
    
    // Add renewal date if it's a subscription
    if (data.type === 'subscription' && data.renewalDate) {
      groupData.renewalDate = data.renewalDate
    }
    
    const createdGroup = await groupsStore.createGroup(groupData)
    createdGroupId.value = createdGroup._id
    step.value = 'members'
  } catch (error) {
    // Error is already set in the store
    console.error('Failed to create group:', error)
  }
}

const handleFinish = async (members) => {
  if (members && createdGroupId.value) {
    try {
      // Add selected friends to the group
      if (members.selectedFriends?.length > 0) {
        for (const friendId of members.selectedFriends) {
          await groupsStore.addMember(createdGroupId.value, friendId)
        }
      }
      // TODO: Handle addedEmails (invite by email)
    } catch (error) {
      console.error('Failed to add members:', error)
    }
  }
  router.push('/groups')
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
