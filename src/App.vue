<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const router = useRouter()
const framed = computed(() => route.meta.frame === true)
const motion = ref('settle')

const tabs = ['home', 'search', 'profile']
const rank: Record<string, number> = {
  onboarding: 0,
  home: 1,
  search: 1,
  profile: 1,
  move: 3,
  reels: 4,
}

router.beforeEach((to, from) => {
  if (!from.name) {
    motion.value = 'settle'
    return
  }
  const fromTab = tabs.indexOf(String(from.name))
  const toTab = tabs.indexOf(String(to.name))
  if (fromTab >= 0 && toTab >= 0 && fromTab !== toTab) {
    motion.value = toTab > fromTab ? 'forward' : 'back'
    return
  }
  const delta = (rank[String(to.name)] ?? 0) - (rank[String(from.name)] ?? 0)
  if (delta > 0) motion.value = 'push'
  else if (delta < 0) motion.value = 'pop'
  else motion.value = 'fade'
})
</script>

<template>
  <div class="shell" :class="{ framed }">
    <a class="skip" href="#main">본문으로 건너뛰기</a>
    <div id="main" class="stage">
      <RouterView v-slot="{ Component, route: viewRoute }">
        <Transition :name="motion">
          <component :is="Component" :key="viewRoute.fullPath" />
        </Transition>
      </RouterView>
    </div>
    <Transition name="dock">
      <TabBar v-if="framed" />
    </Transition>
  </div>
</template>
