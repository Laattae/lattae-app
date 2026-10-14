/**
 * 화면이 의존하는 API 경계다.
 * 지금은 목 데이터를 반환한다. 백엔드가 생기면 이 파일의 구현만 교체한다.
 */
export type { AuthProvider, ExplorePage } from '@/mocks/api'
export {
  demoPortfolio,
  getAlerts,
  getMoveDetail,
  getLastProvider,
  getMoves,
  getSession,
  listExplore,
  listExplorePage,
  getPortfolio,
  getReels,
  getWatchGrid,
  listKeywords,
  postFeedback,
  postReelEvent,
  savePortfolio,
  signIn,
  signOut,
  searchCatalog,
  searchStocks,
} from '@/mocks/api'
