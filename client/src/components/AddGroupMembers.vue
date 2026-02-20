<template>
  <div class="add-members">
    <h2 class="add-members__title">Add Members</h2>
    <p class="add-members__subtitle">Invite people to join your group</p>

    <!-- Add by Email -->
    <div class="add-email">
      <FormInput
        id="email"
        v-model="email"
        type="email"
        label="Add by Email"
        placeholder="Enter email address"
      >
        <template #icon>
          <Mail />
        </template>
      </FormInput>
      <button type="button" class="btn-add" :disabled="!email.trim()" @click="addByEmail">
        <UserPlus class="btn-add__icon" />
        Add
      </button>
    </div>

    <!-- Share Link -->
    <div class="share-link">
      <label class="share-link__label">Share Group Link</label>
      <div class="share-link__box">
        <Link class="share-link__icon" />
        <input
          type="text"
          :value="groupLink"
          readonly
          class="share-link__input"
        />
        <button type="button" class="share-link__btn" @click="copyLink">
          <Copy v-if="!copied" />
          <Check v-else />
        </button>
      </div>
    </div>

    <!-- Friends List -->
    <div class="friends-list">
      <label class="friends-list__label">Your Friends</label>
      
      <!-- Loading State -->
      <div v-if="loadingFriends" class="friends-list__loading">
        <Loader2 class="animate-spin" />
        <span>Loading friends...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="friends.length === 0" class="friends-list__empty">
        <p>No friends yet. Add friends from the Friends page.</p>
      </div>

      <!-- Friends -->
      <div v-else class="friends-list__items">
        <div
          v-for="friend in friends"
          :key="friend._id"
          class="friend-item"
          :class="{ 'friend-item--selected': selectedFriends.includes(friend._id) }"
          @click="toggleFriend(friend._id)"
        >
          <div class="friend-item__avatar">
            {{ friend.name.charAt(0) }}
          </div>
          <div class="friend-item__info">
            <p class="friend-item__name">{{ friend.name }}</p>
            <p class="friend-item__email">{{ friend.email }}</p>
          </div>
          <div class="friend-item__check">
            <Check v-if="selectedFriends.includes(friend._id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="add-members__actions">
      <button type="button" class="btn-secondary" @click="$emit('skip')">
        Skip for Now
      </button>
      <button 
        type="button" 
        class="btn-primary" 
        :disabled="selectedFriends.length === 0 && !addedEmails.length"
        @click="handleDone"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Mail, UserPlus, Link, Copy, Check, Loader2 } from 'lucide-vue-next'
import FormInput from './FormInput.vue'
import friendService from '../services/friendService'

const props = defineProps({
  groupId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['skip', 'done'])

const email = ref('')
const addedEmails = ref([])
const copied = ref(false)
const selectedFriends = ref([])
const friends = ref([])
const loadingFriends = ref(true)

const groupLink = computed(() => {
  const baseUrl = window.location.origin
  return props.groupId 
    ? `${baseUrl}/join/${props.groupId}` 
    : `${baseUrl}/join/abc123`
})

const fetchFriends = async () => {
  try {
    loadingFriends.value = true
    friends.value = await friendService.getAll()
  } catch (error) {
    console.error('Failed to load friends:', error)
    friends.value = []
  } finally {
    loadingFriends.value = false
  }
}

onMounted(fetchFriends)

const toggleFriend = (id) => {
  const index = selectedFriends.value.indexOf(id)
  if (index === -1) {
    selectedFriends.value.push(id)
  } else {
    selectedFriends.value.splice(index, 1)
  }
}

const addByEmail = () => {
  if (email.value.trim()) {
    addedEmails.value.push(email.value.trim())
    email.value = ''
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(groupLink)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleDone = () => {
  emit('done', {
    selectedFriends: selectedFriends.value,
    addedEmails: addedEmails.value
  })
}
</script>

<style lang="scss" scoped>
.add-members {
  @apply space-y-6;

  &__title {
    @apply text-xl font-semibold text-secondary-800;
  }

  &__subtitle {
    @apply text-sm text-secondary-500 -mt-4;
  }

  &__actions {
    @apply flex gap-3 pt-2;
  }
}

// Add by Email
.add-email {
  @apply flex gap-3 items-end;

  :deep(.form-group) {
    @apply flex-1;
  }
}

.btn-add {
  @apply flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl;
  @apply hover:bg-primary-700 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;

  &__icon {
    @apply w-5 h-5;
  }
}

// Share Link
.share-link {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-2;
  }

  &__box {
    @apply flex items-center gap-2 p-3 bg-secondary-50 rounded-xl;
  }

  &__icon {
    @apply w-5 h-5 text-secondary-400 flex-shrink-0;
  }

  &__input {
    @apply flex-1 bg-transparent text-sm text-secondary-600 truncate outline-none;
  }

  &__btn {
    @apply p-2 text-secondary-500 hover:text-primary-600 transition-colors;

    svg {
      @apply w-5 h-5;
    }
  }
}

// Friends List
.friends-list {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-3;
  }

  &__items {
    @apply space-y-2 max-h-64 overflow-y-auto;
  }

  &__loading {
    @apply flex items-center justify-center gap-2 py-8 text-secondary-500;
    
    svg {
      @apply w-5 h-5;
    }
  }

  &__empty {
    @apply py-8 text-center text-secondary-500 text-sm;
  }
}

// Friend Item
.friend-item {
  @apply flex items-center gap-3 p-3 bg-secondary-50 rounded-xl cursor-pointer transition-all;
  @apply hover:bg-secondary-100;

  &--selected {
    @apply bg-primary-50 ring-2 ring-primary-500;
  }

  &__avatar {
    @apply w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold;
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__name {
    @apply font-medium text-secondary-800 truncate;
  }

  &__email {
    @apply text-sm text-secondary-500 truncate;
  }

  &__check {
    @apply w-6 h-6 text-primary-600;
  }
}

// Buttons
.btn-primary {
  @apply flex-1 py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl transition-all;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply flex-1 py-3 px-4 border-2 border-secondary-300 text-secondary-600 font-semibold rounded-xl transition-all;
  @apply hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2;
}
</style>
