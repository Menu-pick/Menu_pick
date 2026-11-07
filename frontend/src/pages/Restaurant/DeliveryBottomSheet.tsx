import BottomSheet, { type BottomSheetProps } from '../../features/meal/MealBottomSheet'

type DeliveryBottomSheetProps = Omit<BottomSheetProps, 'title'> & { menuName?: string }

const platforms = [
  { name: '배달의민족', monogram: '배', url: 'https://www.baemin.com/' },
  { name: '쿠팡이츠', monogram: '쿠', url: 'https://www.coupangeats.com/' },
  { name: '요기요', monogram: '요', url: 'https://www.yogiyo.co.kr/' },
]

// Figma: 09-D
export default function DeliveryBottomSheet({ menuName = '쌀국수', ...props }: DeliveryBottomSheetProps) {
  return <BottomSheet {...props} showHandle className="meal-sheet delivery-sheet" title="배달로 주문하기">
    <p className="sheet-subtitle">사용 중인 배달앱을 선택해주세요</p>
    <div className="platform-list">{platforms.map(platform => <a className="meal-card platform-card" key={platform.name} href={platform.url} target="_blank" rel="noreferrer" aria-label={`${platform.name} 열기, ${menuName} 검색`}>
      <span className="platform-monogram">{platform.monogram}</span><span><strong>{platform.name}</strong><small>{menuName} 검색하기 ↗</small></span><span className="platform-chevron">›</span>
    </a>)}</div>
    <div className="delivery-help"><p>앱마다 입점 식당과 배달 가능 범위가 달라요.</p><p>선택한 앱에서 주문 가능한 식당을 확인해보세요.</p></div>
  </BottomSheet>
}
