<template>
  <div class="friends-page">
    
    <div class="friends-header">
      <h1 class="friends-title">Friends</h1>
      <button class="add-friend-btn" @click="showAddFriend = true">
        <UserPlus class="w-5 h-5" />
      </button>
    </div>

    
    <div v-if="loading" class="friends-loading">
      <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    
    <div v-else-if="friends.length === 0" class="friends-empty">
      <Users class="w-16 h-16 text-secondary-300 mb-4" />
      <p class="text-secondary-500 text-lg">No friends yet</p>
      <p class="text-secondary-400 text-sm mt-1">Add friends to split expenses with them</p>
    </div>

    
    <div v-else class="friends-list">
      <div 
        v-for="friend in friends" 
        :key="friend._id" 
        class="friend-card"
      >
        <div class="friend-avatar">
          {{ getInitials(friend.name) }}
        </div>
        <div class="friend-info">
          <p class="friend-name">{{ friend.name }}</p>
          <p class="friend-email">{{ friend.email }}</p>
          <p v-if="friend.phone" class="friend-phone">{{ friend.phone }}</p>
        </div>
        <button 
          class="friend-remove-btn" 
          @click="removeFriend(friend._id)"
          :disabled="removingId === friend._id"
        >
          <Loader2 v-if="removingId === friend._id" class="w-4 h-4 animate-spin" />
          <UserMinus v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    
    <div v-if="showAddFriend" class="modal-overlay" @click.self="closeAddFriend">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Add Friend</h2>
          <button class="modal-close" @click="closeAddFriend">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          <label class="input-label">Friend's Email</label>
          <input 
            v-model="friendEmail" 
            type="email" 
            class="input-field"
            placeholder="Enter email address"
            @keyup.enter="addFriend"
          />
          <p v-if="addError" class="input-error">{{ addError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddFriend">Cancel</button>
          <button 
            class="btn-primary" 
            @click="addFriend"
            :disabled="adding || !friendEmail"
          >
            <Loader2 v-if="adding" class="w-4 h-4 animate-spin mr-2" />
            Add Friend
          </button>
        </div>
      </div>
    </div>

    
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Users, UserPlus, UserMinus, Loader2, X } from 'lucide-vue-next'
import friendService from '../services/friendService'

const friends = ref([])
const loading = ref(true)
const error = ref('')
const showAddFriend = ref(false)
const friendEmail = ref('')
const adding = ref(false)
const addError = ref('')
const removingId = ref(null)

const fetchFriends = async () => {
  try {
    loading.value = true
    error.value = ''
    friends.value = await friendService.getAll()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load friends'
  } finally {
    loading.value = false
  }
}

const addFriend = async () => {
  if (!friendEmail.value) return
  
  try {
    adding.value = true
    addError.value = ''
    await friendService.add(friendEmail.value)
    await fetchFriends()
    closeAddFriend()
  } catch (err) {
    addError.value = err.response?.data?.error || 'Failed to add friend'
  } finally {
    adding.value = false
  }
}

const removeFriend = async (friendId) => {
  try {
    removingId.value = friendId
    await friendService.remove(friendId)
    friends.value = friends.value.filter(f => f._id !== friendId)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to remove friend'
    setTimeout(() => error.value = '', 3000)
  } finally {
    removingId.value = null
  }
}

const closeAddFriend = () => {
  showAddFriend.value = false
  friendEmail.value = ''
  addError.value = ''
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(fetchFriends)
</script>

<style lang="scss" scoped>
.friends-page {
  @apply min-h-screen bg-secondary-50 pb-8;
}

.friends-header {
  @apply bg-white px-6 py-8 shadow-sm flex items-center justify-between;
}

.friends-title {
  @apply text-2xl font-bold text-secondary-800;
}

.add-friend-btn {
  @apply w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center;
  @apply hover:bg-primary-600 transition-colors;
}

.friends-loading {
  @apply flex items-center justify-center py-20;
}

.friends-empty {
  @apply flex flex-col items-center justify-center py-20 px-6 text-center;
}

.friends-list {
  @apply mx-4 mt-6 space-y-3;
}

.friend-card {
  @apply bg-white rounded-xl shadow-sm p-4 flex items-center gap-4;
}

.friend-avatar {
  @apply w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-semibold;
  @apply flex items-center justify-center text-sm;
}

.friend-info {
  @apply flex-1 min-w-0;
}

.friend-name {
  @apply font-medium text-secondary-800 truncate;
}

.friend-email {
  @apply text-sm text-secondary-500 truncate;
}

.friend-phone {
  @apply text-xs text-secondary-400;
}

.friend-remove-btn {
  @apply w-8 h-8 rounded-full text-red-500 flex items-center justify-center;
  @apply hover:bg-red-50 transition-colors disabled:opacity-50;
}

.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl w-full max-w-md shadow-xl;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-secondary-100;
}

.modal-title {
  @apply text-lg font-semibold text-secondary-800;
}

.modal-close {
  @apply text-secondary-400 hover:text-secondary-600 transition-colors;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply flex gap-3 justify-end px-6 py-4 border-t border-secondary-100;
}

.input-label {
  @apply block text-sm font-medium text-secondary-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-2 border border-secondary-200 rounded-lg;
  @apply focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none;
}

.input-error {
  @apply text-sm text-red-500 mt-2;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg font-medium;
  @apply hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex items-center;
}

.btn-secondary {
  @apply px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium;
  @apply hover:bg-secondary-200 transition-colors;
}

.error-toast {
  @apply fixed bottom-20 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg;
  @apply text-center text-sm;
}
</style>
