import { createRouter, createWebHistory } from 'vue-router'
import { getPortfolio, getSession } from '@/api/lattae'
import AccountView from '@/views/AccountView.vue'
import HoldingsView from '@/views/HoldingsView.vue'
import HomeView from '@/views/HomeView.vue'
import LegalView from '@/views/LegalView.vue'
import LoginView from '@/views/LoginView.vue'
import MoveDetailView from '@/views/MoveDetailView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ReelsView from '@/views/ReelsView.vue'
import SearchView from '@/views/SearchView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', name: 'login', component: LoginView, meta: { title: '로그인' } },
    { path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { title: '포트폴리오' } },
    { path: '/home', name: 'home', component: HomeView, meta: { title: '홈', frame: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { title: '검색', frame: true } },
    { path: '/me', name: 'profile', component: ProfileView, meta: { title: '내 정보', frame: true } },
    { path: '/me/holdings', name: 'holdings', component: HoldingsView, meta: { title: '종목 연결' } },
    { path: '/me/account', name: 'account', component: AccountView, meta: { title: '계정 설정' } },
    { path: '/me/privacy', name: 'privacy', component: LegalView, meta: { title: '개인정보 처리방침' } },
    { path: '/me/terms', name: 'terms', component: LegalView, meta: { title: '이용약관' } },
    { path: '/moves/:id', name: 'move', component: MoveDetailView, meta: { title: '변동' } },
    { path: '/reels/:reelId?', name: 'reels', component: ReelsView, meta: { title: '오늘의 변동', frame: true } },
    { path: '/alerts', redirect: '/home' },
  ],
})

router.beforeEach(async (to) => {
  const session = await getSession()
  if (!session) {
    if (to.name === 'login') return true
    return { name: 'login' }
  }
  const portfolio = await getPortfolio()
  if (to.name === 'login') return { name: portfolio ? 'home' : 'onboarding' }
  if (to.name === 'onboarding') return true
  if (!portfolio) return { name: 'onboarding' }
  return true
})

router.afterEach(() => {
  document.title = 'Lattae'
})
