import Card from "@/components/ui/cards/Card"
import Skeleton from "@/components/ui/skeleton/Skeleton"
import { StyleSheet } from "react-native"

export function OverviewProductManagementCardSkeleton() {
  return (
    <Card style={styles.overviewCard}>
      <Skeleton width={140} height={14} borderRadius={6} />
      <Skeleton
        width={180}
        height={28}
        borderRadius={8}
        style={{ marginTop: 14 }}
      />
    </Card>
  )
}

const styles = StyleSheet.create({

  overviewCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#003366'
  },


})