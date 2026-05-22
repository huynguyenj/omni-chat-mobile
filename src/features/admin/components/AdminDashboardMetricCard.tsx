import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import type { ReactNode } from 'react'
import Card from '@/components/ui/cards/Card'

type AdminDashboardMetricCardProps = {
  accentColor: string
  iconBg: string
  iconColor: string
  valueColor: string
  Icon: LucideIcon
  topRightIcon?: LucideIcon
  title: string
  value: ReactNode
  unit?: string
  footer: ReactNode
  loading?: boolean
  style?: object
}

export default function AdminDashboardMetricCard({
  accentColor,
  iconBg,
  iconColor,
  valueColor,
  Icon,
  topRightIcon: TopRightIcon,
  title,
  value,
  unit,
  footer,
  loading,
  style
}: AdminDashboardMetricCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.iconRow}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <Icon size={22} color={iconColor} />
          </View>
          {TopRightIcon ? <TopRightIcon size={18} color={iconColor} /> : null}
        </View>
        <Text style={styles.title}>{title}</Text>
        {loading ? (
          <ActivityIndicator color={iconColor} style={styles.loader} />
        ) : (
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
            {unit ? <Text style={[styles.unit, { color: valueColor }]}>{unit}</Text> : null}
          </View>
        )}
        <View style={styles.divider} />
        <Text style={styles.footer}>{footer}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingVertical: 0,
    paddingHorizontal: 0,
    flex: 1,
    minWidth: 150
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  body: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 16
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#003366',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4
  },
  value: {
    fontSize: 28,
    fontWeight: '700'
  },
  unit: {
    fontSize: 16,
    fontWeight: '600'
  },
  loader: {
    marginVertical: 8,
    alignSelf: 'flex-start'
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    marginVertical: 10
  },
  footer: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18
  }
})
