<script setup lang="ts">
defineProps<{
  name: 'home' | 'reels' | 'bell' | 'back' | 'search' | 'user' | 'heart' | 'bookmark'
  filled?: boolean
}>()
</script>

<template>
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <path
      v-if="name === 'home'"
      d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-8.8Z"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
    />
    <g v-else-if="name === 'reels'" stroke="currentColor" stroke-width="1.7">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 8h4M10 12h4M10 16h4" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'bell'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.2 2H4.8L6 16Z" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke-linecap="round" />
    </g>
    <path
      v-else-if="name === 'back'"
      d="M14.5 5.5 8 12l6.5 6.5"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <g v-else-if="name === 'search'" stroke="currentColor" stroke-width="1.7">
      <circle cx="11" cy="11" r="6.2" />
      <path d="m16 16 4.2 4.2" stroke-linecap="round" />
    </g>
    <path
      v-else-if="name === 'heart'"
      d="M12 19.4c-.4 0-6.8-4.1-6.8-8.3a3.6 3.6 0 0 1 6.2-2.5l.6.7.6-.7a3.6 3.6 0 0 1 6.2 2.5c0 4.2-6.4 8.3-6.8 8.3Z"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
      :fill="filled ? 'currentColor' : 'none'"
    />
    <path
      v-else-if="name === 'bookmark'"
      d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.1L6 20V5.5a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
      :fill="filled ? 'currentColor' : 'none'"
    />
    <g v-else stroke="currentColor" stroke-width="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c1.2-2.8 3.5-4.2 6.5-4.2s5.3 1.4 6.5 4.2" stroke-linecap="round" />
    </g>
  </svg>
</template>
