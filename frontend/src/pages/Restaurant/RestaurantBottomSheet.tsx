import BottomSheet, { type BottomSheetProps } from '../../components/common/BottomSheet'

type RestaurantBottomSheetProps = Omit<BottomSheetProps, 'title'>

// Figma: 09
export default function RestaurantBottomSheet(props: RestaurantBottomSheetProps) {
  return <BottomSheet {...props} title="Restaurant" />
}
