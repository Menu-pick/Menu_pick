import BottomSheet, { type BottomSheetProps } from '../../components/common/BottomSheet'

type DeliveryBottomSheetProps = Omit<BottomSheetProps, 'title'>

// Figma: 09-D
export default function DeliveryBottomSheet(props: DeliveryBottomSheetProps) {
  return <BottomSheet {...props} title="Delivery" />
}
