<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLastProvider, getPortfolio, signIn, type AuthProvider } from '@/api/lattae'

const router = useRouter()
const recent = ref<AuthProvider | null>(null)

const providers = [
  { id: 'kakao', label: '카카오로 로그인' },
  { id: 'google', label: '구글로 로그인' },
  { id: 'apple', label: '애플로 로그인' },
] as const

onMounted(async () => {
  recent.value = await getLastProvider()
})

async function enter(provider: AuthProvider) {
  await signIn(provider)
  const portfolio = await getPortfolio()
  await router.replace(portfolio ? '/home' : '/onboarding')
}
</script>

<template>
  <div class="view login">
    <div class="hero">
      <p class="lead">Your portfolio, explained.</p>
      <h1>
        <img src="/lattae-icon-512.png" alt="Lattae" width="128" height="128" />
      </h1>
      <div class="providers">
        <div v-for="provider in providers" :key="provider.id" class="provider">
          <p v-if="recent === provider.id" class="bubble">최근 로그인</p>
          <button
            type="button"
            :class="provider.id"
            :aria-label="recent === provider.id ? `${provider.label}, 최근 로그인` : provider.label"
            @click="enter(provider.id)"
          >
          <svg v-if="provider.id === 'kakao'" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 4.2c-4.6 0-8.3 2.9-8.3 6.5 0 2.3 1.5 4.4 3.8 5.6l-.7 2.9c-.1.4.3.7.6.4l3.3-2.1c.4.1.9.1 1.3.1 4.6 0 8.3-2.9 8.3-6.5S16.6 4.2 12 4.2z"
            />
          </svg>
          <span v-else-if="provider.id === 'google'" aria-hidden="true">G</span>
          <svg v-else viewBox="0 0 17 20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.6 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5.1-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7 1.9-1.1 2.7-2.2c.8-1.2 1.2-2.4 1.2-2.5-.1-.1-2.3-.9-2.3-3.6zM11.4 4.2c.6-.7 1-1.8.9-2.8-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.8-.9 2.8 1.1.1 2.1-.5 2.8-1.4z"
            />
          </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22vh 28px calc(28px + env(safe-area-inset-bottom));
  background: #fff;
  text-align: center;
}

.hero {
  flex: 1;
}

.lead {
  margin: 0;
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.35;
}

h1 {
  display: flex;
  justify-content: center;
  margin: 28px 0 0;
}

h1 img {
  width: 128px;
  height: 128px;
}

.providers {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 52px;
}

.provider {
  position: relative;
}

.bubble {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  margin: 0;
  padding: 6px 10px;
  border-radius: 999px;
  background: #4a2c1d;
  color: #fff;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.2;
  white-space: nowrap;
  transform: translateX(-50%);
}

.bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  border: 5px solid transparent;
  border-top-color: #4a2c1d;
  transform: translateX(-50%);
}

.providers button {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 750;
}

.providers svg {
  width: 30px;
  height: 30px;
}

.kakao {
  background: #fee500;
  color: #191919;
}

.google {
  border: 1px solid #e4e4e4;
  background: #fff;
  color: #4285f4;
}

.apple {
  background: #111;
  color: #fff;
}

</style>
