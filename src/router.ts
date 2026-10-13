import { createRouter, createWebHistory } from 'vue-router'
import { getPortfolio } from '@/api/lattae'
import AlertsView from '@/views/AlertsView.vue'
import HomeView from '@/views/HomeView.vue'
import MoveDetailView from '@/views/MoveDetailView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ReelsView from '@/views/ReelsView.vue'
import SearchView from '@/views/SearchView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { title: '포트폴리오' } },
    { path: '/home', name: 'home', component: HomeView, meta: { title: '홈', frame: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { title: '검색', frame: true } },
    { path: '/me', name: 'profile', component: ProfileView, meta: { title: '내 정보', frame: true } },
    { path: '/moves/:id', name: 'move', component: MoveDetailView, meta: { title: '변동' } },
    { path: '/reels/:reelId?', name: 'reels', component: ReelsView, meta: { title: '오늘의 변동', frame: true } },
    { path: '/alerts', name: 'alerts', component: AlertsView, meta: { title: '알림', frame: true } },
  ],
})

router.beforeEach(async (to) => {
  if (to.name === 'onboarding') return true
  const portfolio = await getPortfolio()
  if (!portfolio) return { name: 'onboarding' }
  return true
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : '라떼'
  document.title = `${title} · 라떼`
})
