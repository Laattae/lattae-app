<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Disclaimer from '@/components/Disclaimer.vue'
import Icon from '@/components/Icon.vue'

interface Clause {
  heading: string
  paragraphs?: string[]
  items?: string[]
  fields?: { label: string; value: string; href?: string }[]
  children?: Clause[]
}

const route = useRoute()
const router = useRouter()

const termsLead =
  '본 약관은 라떼(이하 "라떼")가 제공하는 보유 종목 등락 설명 서비스(이하 "서비스")의 이용과 관련하여 라떼와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.'

const terms: Clause[] = [
  {
    heading: '제1조 (목적)',
    paragraphs: [
      '이 약관은 라떼가 제공하는 서비스의 이용조건 및 절차, 라떼와 이용자의 권리·의무와 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
    ],
  },
  {
    heading: '제2조 (정의)',
    items: [
      '"서비스"란 이용자가 직접 입력한 보유 종목의 등락 이유를, 이미 공개된 공시와 뉴스를 바탕으로 짧게 정리해 보여주는 라떼 앱을 말합니다.',
      '"이용자"란 이 약관에 따라 서비스에 접속하여 이용하는 자를 말합니다.',
      '"로그인 수단"이란 이용자가 고른 카카오, 구글, 애플 중 하나를 말합니다. 현재 각 인증 서버와 연결되어 있지 않습니다.',
      '"종목 연결"이란 이용자가 종목과 비중을 직접 입력해 이 기기에 저장하는 것을 말합니다. 증권 계좌 연결을 의미하지 않습니다.',
      '"설명"이란 등락의 이유를 공개된 자료의 제목, 발행처, 시각, 링크로 요약한 화면을 말합니다.',
    ],
  },
  {
    heading: '제3조 (약관의 게시와 개정)',
    items: [
      '라떼는 이 약관의 내용을 서비스 안 이용약관 화면에 게시하여 이용자가 쉽게 확인할 수 있도록 합니다.',
      '라떼는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.',
      '약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 화면에 그 적용일자 7일 이전부터 안내합니다. 다만 이용자에게 불리한 변경의 경우 합리적 기간 동안 안내합니다.',
      '이용자가 개정 약관 안내 후 시행일까지 거부 의사를 표시하지 않으면 개정 약관에 동의한 것으로 봅니다. 개정 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.',
    ],
  },
  {
    heading: '제4조 (서비스의 내용)',
    paragraphs: [
      '서비스가 제공하는 범위는 연결한 종목과 확인된 자료에 따라 달라질 수 있습니다. 라떼는 종목을 고르거나 행동을 권하지 않습니다. 등락은 행동 지침이 아닙니다.',
      '확인된 공시나 뉴스가 없으면 “확인된 공시·뉴스 없음 · 원인 미확인”으로 보여 줍니다. 화면에 나오는 시세는 실시간 시세가 아닙니다.',
      '라떼는 운영상·기술상의 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며, 중요한 변경은 서비스 화면에서 안내합니다.',
    ],
    items: [
      '이용자가 직접 입력한 종목과 비중의 저장',
      '관심 키워드 표시',
      '등락 이유 요약과 근거(제목, 발행처, 시각, 링크)',
      '숏폼 형태의 설명',
      '알림 설정',
    ],
  },
  {
    heading: '제5조 (서비스 이용)',
    paragraphs: [
      '로그인은 카카오, 구글, 애플 중 하나를 고르는 방식입니다. 현재 해당 인증 서버와 연결되어 있지 않으며, 이름·이메일·프로필은 받아 오지 않습니다. 고른 수단은 이 기기에만 저장됩니다.',
      '종목과 비중은 이용자가 직접 입력합니다. 계좌는 연결하지 않습니다.',
      '로그아웃하면 이 기기의 로그인 상태만 지워집니다. 종목 연결은 이 기기에 남을 수 있습니다.',
    ],
  },
  {
    heading: '제6조 (이용자의 의무)',
    paragraphs: ['이용자는 관련 법령, 이 약관, 서비스 안 안내를 준수하여야 합니다. 이용자는 다음 행위를 하여서는 안 됩니다.'],
    items: [
      '허위 정보 입력 또는 타인의 정보 도용',
      '서비스의 안정적 운영을 방해하는 행위',
      '라떼 또는 제3자의 지식재산권 등 권리를 침해하는 행위',
      '공시·뉴스 본문을 다시 실어 배포하는 행위',
      '서비스의 설명을 투자 권유인 것처럼 알리는 행위',
      '비정상적 접근이나 자동화 수단을 이용한 부정 이용',
    ],
  },
  {
    heading: '제7조 (이용 요금)',
    paragraphs: ['서비스의 일반 이용은 무료입니다. 별도의 유료 상품, 결제, 도입 계약은 제공하지 않습니다.'],
  },
  {
    heading: '제8조 (투자 판단과 거래)',
    paragraphs: [
      '라떼는 증권 거래를 중개하지 않습니다. 계좌는 연결하지 않으며, 주문·결제·환불을 처리하지 않습니다.',
      '화면에 나오는 등락과 설명은 이미 공개된 자료의 요약입니다. 종목을 어떻게 할지는 이용자가 스스로 판단하며, 그 결과는 이용자 본인에게 있습니다.',
      '등락은 행동 지침이 아닙니다. 투자 권유가 아닌 공개 정보 요약입니다.',
    ],
  },
  {
    heading: '제9조 (지식재산권)',
    paragraphs: [
      '서비스 및 관련 소프트웨어, 디자인, 상표, 화면 구성에 대한 권리는 라떼 또는 정당한 권리자에게 귀속됩니다.',
      '공시와 뉴스 본문에 대한 권리는 해당 발행처에 있습니다. 라떼는 제목, 발행처, 시각, 링크만 표시하며 본문을 다시 싣지 않습니다.',
      '이용자는 라떼의 사전 동의 없이 서비스를 복제·배포·상업적으로 이용할 수 없습니다.',
    ],
  },
  {
    heading: '제10조 (서비스의 중단)',
    paragraphs: [
      '라떼는 설비 점검, 장애, 통신 두절 등 상당한 사유가 있는 경우 서비스 제공을 일시 중단할 수 있습니다. 서비스는 이용자의 기기에서 동작하므로, 브라우저나 기기의 문제로도 이용이 어려울 수 있습니다.',
      '라떼는 서비스 중단에 대하여 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.',
    ],
  },
  {
    heading: '제11조 (면책)',
    items: [
      '라떼는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.',
      '라떼는 이용자와 제3자 사이에 서비스를 매개로 발생한 분쟁에 대하여 개입할 의무가 없으며, 이로 인한 손해에 대하여 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.',
      '라떼는 무료로 제공되는 서비스 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.',
      '설명의 완전성, 정확성, 최신성을 보장하지 않습니다. 원인이 확인되지 않을 수 있으며, 시세는 실시간 시세가 아닙니다.',
      '라떼는 수익이나 특정 등락을 보장하지 않습니다. 투자 결과에 대한 책임은 이용자에게 있습니다.',
    ],
  },
  {
    heading: '제12조 (개인정보 보호)',
    paragraphs: [
      '라떼는 이용자의 개인정보를 「개인정보 보호법」 등 관련 법령에 따라 보호하며, 개인정보의 처리에 관한 사항은 별도의 개인정보처리방침에 따릅니다. 이용자가 입력한 정보는 이 기기에 저장되며, 라떼 서버로 전송되지 않습니다.',
    ],
  },
  {
    heading: '제13조 (분쟁 해결 및 준거법)',
    paragraphs: [
      '라떼와 이용자 간 분쟁이 발생한 경우 성실히 협의하여 해결하도록 노력합니다.',
      '이 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 소송이 제기되는 경우 민사소송법 등 관련 법령에 따른 관할 법원을 전속 관할로 합니다.',
    ],
  },
  {
    heading: '제14조 (안내)',
    fields: [
      { label: '서비스명', value: '라떼 (Lattae)' },
      { label: '사업자등록', value: '아직 없습니다' },
      { label: '이메일', value: 'lattae.official@gmail.com', href: 'mailto:lattae.official@gmail.com' },
      { label: '적용 범위', value: '라떼 웹 앱' },
      { label: '약관 확인', value: '서비스 안 이용약관 화면' },
      { label: '개인정보 확인', value: '서비스 안 개인정보 처리방침 화면' },
    ],
  },
  {
    heading: '부칙',
    paragraphs: ['이 약관은 2026년 10월 12일 월요일부터 시행합니다.'],
  },
]

const privacyLead =
  '라떼(이하 "라떼")는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다. 본 방침은 보유 종목의 등락 이유를 설명하는 라떼 앱(이하 "서비스")에 적용됩니다.'

const privacy: Clause[] = [
  {
    heading: '개인정보 처리자',
    paragraphs: [
      '라떼는 이용자가 입력한 정보를 이용자의 기기에 저장합니다. 현재 서비스는 그 정보를 라떼의 서버로 전송하지 않습니다.',
    ],
    fields: [
      { label: '서비스명', value: '라떼 (Lattae)' },
      { label: '사업자등록', value: '아직 없습니다' },
      { label: '이메일', value: 'lattae.official@gmail.com', href: 'mailto:lattae.official@gmail.com' },
      { label: '적용 범위', value: '라떼 웹 앱' },
      { label: '처리 장소', value: '이용자의 기기(브라우저 저장소)' },
    ],
  },
  {
    heading: '수집하는 개인정보 항목 및 수집 방법',
    paragraphs: [
      '라떼는 화면을 보여 주는 데 필요한 범위에서만 정보를 기기에 남깁니다. 항목은 이용하는 기능에 따라 달라집니다.',
    ],
    children: [
      {
        heading: '2.1. 로그인',
        paragraphs: [
          '로그인 버튼을 누르면 이용자가 고른 수단만 이 기기에 저장합니다. 현재 카카오, 구글, 애플의 인증 서버와 연결되어 있지 않으며, 해당 서비스에서 이름·이메일·프로필 등 회원 정보를 받아 오지 않습니다.',
        ],
        items: [
          '저장 항목: 로그인 수단(카카오, 구글, 애플 중 이용자가 고른 하나)',
          '저장 항목: 로그인 화면에 “최근 로그인”을 표시하기 위한 마지막 로그인 수단',
          '저장하지 않는 항목: 이름, 이메일, 프로필 사진, 전화번호, 인증 토큰',
        ],
      },
      {
        heading: '2.2. 종목 연결과 관심 설정',
        paragraphs: [
          '이용자가 화면에서 직접 입력하고 저장합니다. 계좌번호, 비밀번호, 증권사 접속 정보는 받지 않습니다. 계좌는 연결하지 않습니다.',
        ],
        items: [
          '종목코드, 종목명, 비중',
          '관심 키워드',
          '알림 받기 여부',
        ],
      },
      {
        heading: '2.3. 기기에 오래 남기지 않는 것',
        paragraphs: [
          '종목 설명에 대한 반응과 숏폼 이용 기록은 화면이 열려 있는 동안의 메모리에만 있으며, 새로고침하면 사라집니다.',
          '기기 식별자, 광고 식별자, 위치, 연락처, 이용 로그를 수집하거나 서버로 보내지 않습니다. 오류 모니터링 도구나 분석 도구를 연결하지 않습니다.',
        ],
      },
    ],
  },
  {
    heading: '개인정보의 수집·이용 목적',
    items: [
      '로그인 상태를 유지하고, 최근에 사용한 로그인 수단을 표시하기 위하여',
      '이용자가 연결한 종목의 등락 이유를 화면에 보여 주기 위하여',
      '관심 키워드와 알림 설정을 유지하기 위하여',
    ],
    paragraphs: [
      '종목을 추천하거나 행동을 권하는 목적으로 개인정보를 이용하지 않습니다. 등락 설명은 투자 권유가 아닌 공개 정보 요약입니다.',
    ],
  },
  {
    heading: '개인정보의 보유 및 이용 기간',
    paragraphs: [
      '정보는 이용자의 기기에만 있으며, 라떼 서버에는 보관하지 않습니다. 대금결제, 계약, 청약철회처럼 법령이 서버 보관을 정하는 거래 정보는 수집하지 않습니다.',
    ],
    items: [
      '로그인 상태: 로그아웃하면 이 기기에서 지워집니다.',
      '최근 로그인 수단: 로그아웃 후에도 로그인 화면의 표시를 위해 이 기기에 남을 수 있습니다.',
      '종목, 비중, 관심 키워드, 알림 설정: 이용자가 브라우저 또는 앱의 저장 데이터를 지우기 전까지 이 기기에 남습니다.',
    ],
  },
  {
    heading: '개인정보의 제3자 제공',
    paragraphs: [
      '라떼는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 개인정보가 라떼 서버에 있지 않으므로, 라떼가 이를 제3자에게 넘기는 절차도 없습니다.',
      '법령에 근거가 있거나 수사기관이 법령에 정해진 절차와 방법에 따라 요청하는 경우에는 관련 법령이 정하는 범위에서 예외가 될 수 있습니다. 이 경우에도 라떼가 서버에 보관 중인 개인정보는 없습니다.',
    ],
  },
  {
    heading: '개인정보 처리의 위탁 및 국외 이전',
    paragraphs: [
      '개인정보 처리를 외부 업체에 위탁하지 않습니다. 클라우드, 오류 모니터링, 광고 도구로 개인정보를 보내지 않으며, 국외로 이전하지 않습니다. 문의 메일은 이용자가 직접 보낼 때만 lattae.official@gmail.com으로 받습니다.',
      '등락 설명에 쓰이는 공시와 뉴스는 이미 공개된 자료의 제목, 발행처, 시각, 링크만 화면에 표시합니다. 이는 이용자의 개인정보가 아니며, 기사나 공시 본문은 다시 싣지 않습니다.',
    ],
  },
  {
    heading: '개인정보의 파기 절차 및 방법',
    paragraphs: ['서버에 보관하는 개인정보가 없으므로, 서버 파일을 파기하는 절차는 없습니다.'],
    items: [
      '로그아웃: 이 기기의 로그인 상태를 삭제합니다. 종목 연결과 최근 로그인 수단은 남을 수 있습니다.',
      '브라우저 또는 앱 데이터 삭제: 로그인 수단, 최근 로그인 수단, 종목, 비중, 관심 키워드, 알림 설정이 함께 삭제됩니다.',
    ],
  },
  {
    heading: '이용자의 권리와 행사 방법',
    paragraphs: [
      '이용자는 자신의 개인정보를 서비스 안에서 직접 열람·정정·삭제할 수 있습니다. 요청은 lattae.official@gmail.com으로도 보낼 수 있습니다.',
      '만 14세 미만 아동의 개인정보를 별도로 수집하지 않습니다. 나이, 생년월일, 법정대리인 정보는 받지 않습니다.',
    ],
    items: [
      '종목 연결 화면에서 종목과 비중을 수정하거나 연결을 해제합니다.',
      '로그아웃으로 로그인 상태를 지웁니다.',
      '브라우저 또는 앱의 저장 데이터를 지우면 기기에 남은 기록이 삭제됩니다.',
    ],
  },
  {
    heading: '개인정보의 안전성 확보 조치',
    items: [
      '개인정보를 라떼 서버로 전송하지 않습니다.',
      '로그인과 종목 연결 정보는 이용자 기기의 브라우저 저장소에만 둡니다.',
      '계정 비밀번호를 받지 않습니다.',
    ],
    paragraphs: [
      '이용자는 기기 잠금과 브라우저의 저장 데이터 관리로 기기에 남은 정보를 보호할 수 있습니다. 인터넷과 기기 환경의 특성상 완벽한 보안을 보장할 수는 없습니다.',
    ],
  },
  {
    heading: '쿠키 및 유사 기술',
    paragraphs: [
      '서비스는 쿠키로 이용자를 식별하지 않습니다. 로그인 수단, 최근 로그인 수단, 종목·비중·관심 키워드·알림 설정은 브라우저의 로컬 저장소에 저장합니다.',
      '브라우저 설정에서 저장 데이터를 삭제할 수 있습니다. 삭제하면 로그인이 풀리고, 연결해 둔 종목이 화면에서 사라질 수 있습니다.',
    ],
  },
  {
    heading: '개인정보 보호책임자 및 권익침해 구제',
    fields: [
      { label: '이메일', value: 'lattae.official@gmail.com', href: 'mailto:lattae.official@gmail.com' },
    ],
    paragraphs: [
      '개인정보는 이용자의 기기에만 있으므로, 열람·정정·삭제는 제8항의 방법으로 이용자가 직접 할 수 있습니다. 같은 요청은 위 이메일로도 보낼 수 있습니다.',
      '개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.',
    ],
    items: [
      '개인정보침해신고센터 (privacy.kisa.or.kr / 국번 없이 118)',
      '개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972)',
      '대검찰청 (www.spo.go.kr / 국번 없이 1301)',
      '경찰청 사이버수사국 (ecrm.police.go.kr / 국번 없이 182)',
    ],
  },
  {
    heading: '개인정보처리방침의 변경',
    paragraphs: [
      '본 방침은 법령이나 서비스가 바뀌면 수정될 수 있습니다. 중요한 변경은 서비스 안 이 화면에서 안내하며, 변경된 방침은 안내한 시행일부터 적용됩니다.',
    ],
  },
  {
    heading: '시행일',
    paragraphs: ['본 개인정보처리방침은 2026년 10월 12일 월요일부터 시행합니다.'],
  },
]

const isTerms = computed(() => route.name === 'terms')
const title = computed(() => (isTerms.value ? '이용약관' : '개인정보 처리방침'))
</script>

<template>
  <div class="view">
    <header class="bar">
      <button type="button" class="icon-btn" aria-label="뒤로" @click="router.back()">
        <Icon name="back" />
      </button>
      <h1>{{ title }}</h1>
    </header>
    <article v-if="isTerms" class="policy stack">
      <p class="effective">시행일: 2026년 10월 12일 월요일</p>
      <p class="lead">{{ termsLead }}</p>
      <section v-for="clause in terms" :key="clause.heading">
        <h2>{{ clause.heading }}</h2>
        <dl v-if="clause.fields">
          <div v-for="field in clause.fields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd>
              <a v-if="field.href" :href="field.href">{{ field.value }}</a>
              <template v-else>{{ field.value }}</template>
            </dd>
          </div>
        </dl>
        <p v-for="paragraph in clause.paragraphs" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="clause.items">
          <li v-for="item in clause.items" :key="item">{{ item }}</li>
        </ul>
      </section>
      <Disclaimer />
    </article>
    <article v-else class="policy stack">
      <p class="effective">시행일: 2026년 10월 12일 월요일</p>
      <p class="lead">{{ privacyLead }}</p>
      <section v-for="(clause, index) in privacy" :key="clause.heading">
        <h2>{{ index + 1 }}. {{ clause.heading }}</h2>
        <dl v-if="clause.fields">
          <div v-for="field in clause.fields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd>
              <a v-if="field.href" :href="field.href">{{ field.value }}</a>
              <template v-else>{{ field.value }}</template>
            </dd>
          </div>
        </dl>
        <p v-for="paragraph in clause.paragraphs" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="clause.items">
          <li v-for="item in clause.items" :key="item">{{ item }}</li>
        </ul>
        <div v-for="child in clause.children" :key="child.heading" class="sub">
          <h3>{{ child.heading }}</h3>
          <p v-for="paragraph in child.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="child.items">
            <li v-for="item in child.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>
      <Disclaimer />
    </article>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 8px;
  font-size: 15px;
  letter-spacing: -0.03em;
}

h3 {
  margin: 14px 0 6px;
  font-size: 14px;
  letter-spacing: -0.03em;
}

p {
  margin: 0 0 8px;
  line-height: 1.65;
  word-break: keep-all;
}

.effective {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.lead {
  margin: 0;
}

.policy section + section {
  margin-top: 8px;
}

dl {
  margin: 0 0 10px;
}

dl div + div {
  margin-top: 8px;
}

dt {
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

dd {
  margin: 2px 0 0;
}

dd a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

ul {
  margin: 0 0 8px;
  padding-left: 1.15em;
}

li {
  margin: 4px 0;
  line-height: 1.65;
  word-break: keep-all;
}

.sub {
  margin-top: 4px;
}
</style>
