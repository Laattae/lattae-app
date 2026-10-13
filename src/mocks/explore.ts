import type { CauseType, Move, MoveScope, Reel, ReelCard } from '@/types'

export interface ExploreSeed {
  code: string
  name: string
  aliases: string[]
  changePct: number
  close: number
  scope: MoveScope | null
  causeType: CauseType
  summary: string | null
  source?: { title: string; publisher: string; url: string }
}

const day = '2026-10-12T16:20:00+09:00'

const seeds: ExploreSeed[] = [
  {
    code: '006400',
    name: '삼성SDI',
    aliases: ['삼성에스디아이', '에스디아이'],
    changePct: 1.6,
    close: 378000,
    scope: 'theme',
    causeType: 'theme',
    summary: '2차전지 대형주가 같은 방향으로 움직였습니다. 이 종목만의 새 공시는 확인되지 않았습니다.',
    source: { title: '2차전지 대형주 동반 상승', publisher: '한국경제', url: 'https://www.hankyung.com' },
  },
  {
    code: '051910',
    name: 'LG화학',
    aliases: ['엘지화학'],
    changePct: -1.4,
    close: 312000,
    scope: 'theme',
    causeType: 'theme',
    summary: '2차전지 대형주가 같은 방향으로 움직였습니다. 이 종목만의 새 공시는 확인되지 않았습니다.',
    source: { title: '2차전지주, 동반 약세', publisher: '매일경제', url: 'https://www.mk.co.kr' },
  },
  {
    code: '323410',
    name: '카카오뱅크',
    aliases: ['카뱅'],
    changePct: -1.1,
    close: 22150,
    scope: 'market',
    causeType: 'market',
    summary: '코스피 전체와 같은 방향으로 움직였습니다. 이 종목만의 공시는 확인되지 않았습니다.',
    source: { title: '코스피, 외국인 순매도에 하락', publisher: '연합뉴스', url: 'https://www.yna.co.kr' },
  },
  {
    code: '105560',
    name: 'KB금융',
    aliases: ['국민은행', '케이비금융'],
    changePct: -0.9,
    close: 89200,
    scope: 'market',
    causeType: 'market',
    summary: '코스피 전체와 같은 방향으로 움직였습니다. 이 종목만의 공시는 확인되지 않았습니다.',
    source: { title: '금융주, 지수와 동반 하락', publisher: '한국경제', url: 'https://www.hankyung.com' },
  },
  {
    code: '259960',
    name: '크래프톤',
    aliases: ['크래프톤'],
    changePct: 2.2,
    close: 286500,
    scope: 'stock',
    causeType: 'earnings',
    summary: '분기 영업실적 공시가 게시되었습니다.',
    source: { title: '영업실적', publisher: 'DART', url: 'https://dart.fss.or.kr' },
  },
  {
    code: '034020',
    name: '두산에너빌리티',
    aliases: ['두산에너빌'],
    changePct: 3.4,
    close: 42800,
    scope: 'stock',
    causeType: 'policy',
    summary: '에너지 정책 관련 보도가 같은 날 게시되었습니다.',
    source: { title: '에너지 정책 관련 보도', publisher: '연합뉴스', url: 'https://www.yna.co.kr' },
  },
  {
    code: '042660',
    name: '한화오션',
    aliases: ['한화오션'],
    changePct: 2.8,
    close: 78400,
    scope: 'stock',
    causeType: 'contract',
    summary: '단일판매·공급계약 체결 공시가 게시되었습니다.',
    source: { title: '단일판매·공급계약 체결', publisher: 'DART', url: 'https://dart.fss.or.kr' },
  },
  {
    code: '028260',
    name: '삼성물산',
    aliases: ['삼성물산'],
    changePct: 1.1,
    close: 156500,
    scope: 'stock',
    causeType: 'contract',
    summary: '단일판매·공급계약 체결 공시가 게시되었습니다.',
    source: { title: '단일판매·공급계약 체결', publisher: 'DART', url: 'https://dart.fss.or.kr' },
  },
  {
    code: '352820',
    name: '하이브',
    aliases: ['하이브'],
    changePct: -2.6,
    close: 214000,
    scope: null,
    causeType: 'unknown',
    summary: null,
  },
  {
    code: '000270',
    name: '기아',
    aliases: ['기아차'],
    changePct: 1.3,
    close: 108500,
    scope: 'stock',
    causeType: 'earnings',
    summary: '판매실적 공시가 게시되었습니다.',
    source: { title: '판매실적', publisher: 'DART', url: 'https://dart.fss.or.kr' },
  },
]

function pctLine(changePct: number) {
  const sign = changePct > 0 ? '+' : ''
  return `전일 종가 대비 ${sign}${changePct.toFixed(1)}%입니다.`
}

function cardsFor(seed: ExploreSeed, index: number): ReelCard[] {
  const unknown = seed.causeType === 'unknown'
  const move: ReelCard = {
    id: `x${index}-1`,
    type: 'move',
    kicker: '오늘의 변동',
    title: seed.name,
    lines: unknown
      ? [pctLine(seed.changePct), '확인된 공시·뉴스 없음 · 원인 미확인', '이유를 추정해서 채우지 않습니다.']
      : [pctLine(seed.changePct), seed.summary ?? '', '등락은 행동 지침이 아닙니다.'],
    liked: false,
    saved: false,
  }
  const middle: ReelCard = seed.source
    ? {
        id: `x${index}-2`,
        type: 'filing',
        kicker: '공시·보도',
        title: seed.source.title,
        lines: [
          '같은 날 공개된 제목입니다.',
          '본문은 옮기지 않습니다.',
          '제목과 출처만 연결합니다.',
        ],
        liked: false,
        saved: false,
      }
    : {
        id: `x${index}-2`,
        type: 'term',
        kicker: '용어 설명',
        title: '원인 미확인',
        lines: [
          '공시와 뉴스에서 확인된 이유가 아직 없다는 뜻입니다.',
          '이유가 없다고 단정하지 않습니다.',
          '확인되면 알림함의 같은 항목이 바뀝니다.',
        ],
        liked: false,
        saved: false,
      }
  const article: ReelCard = {
    id: `x${index}-3`,
    type: 'article',
    kicker: '관련 기사',
    title: seed.source ? '원문 제목만 연결합니다' : '확인된 기사 없음',
    lines: seed.source ? ['기사 본문은 옮기지 않습니다.'] : ['표시할 기사 제목이 없습니다. 본문을 만들어 채우지 않습니다.'],
    article: seed.source
      ? { title: seed.source.title, publisher: seed.source.publisher, publishedAt: day, url: seed.source.url }
      : undefined,
    liked: false,
    saved: false,
  }
  return [move, middle, article]
}

export const extraExplore: { move: Move; name: string; aliases: string[]; reel: Reel }[] = seeds.map(
  (seed, index) => {
    const id = `mv-x-${seed.code}`
    const reelId = `r-x-${seed.code}`
    const move: Move = {
      id,
      code: seed.code,
      reelId,
      changePct: seed.changePct,
      close: seed.close,
      scope: seed.scope,
      causeType: seed.causeType,
      summary: seed.summary,
      sources: seed.source
        ? [
            {
              id: `sx-${seed.code}`,
              title: seed.source.title,
              publisher: seed.source.publisher,
              publishedAt: day,
              url: seed.source.url,
            },
          ]
        : [],
      relatedCodes: [],
      asOfLabel: '10월 12일 종가 기준',
    }
    const reel: Reel = {
      id: reelId,
      title: seed.name,
      moveId: id,
      cards: cardsFor(seed, index),
    }
    return { move, name: seed.name, aliases: seed.aliases, reel }
  },
)

export const extraReels: Reel[] = extraExplore.map((item) => item.reel)
