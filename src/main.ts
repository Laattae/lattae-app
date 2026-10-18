import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { getAlertCodes, getPortfolio } from './api/lattae'
import { resumePush } from './lib/push'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './assets/main.css'

createApp(App).use(router).mount('#app')

// 알림이 켜져 있으면 토큰을 다시 등록하고 포그라운드 수신을 연다.
getPortfolio().then(async (portfolio) => {
  if (portfolio?.notificationsEnabled) await resumePush(await getAlertCodes(portfolio))
})
