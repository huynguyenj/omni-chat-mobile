import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Inbox, LucideIcon, PackageOpen } from 'lucide-react-native'
import Button from '@/components/ui/buttons/Button'

type NoDataCardProps = {
  title?: string
  description?: string
  icon?: LucideIcon
  showAction?: boolean
  actionText?: string
//   onActionPress?: () => void
}

export default function NoDataCard({
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có nội dung để hiển thị',
  icon: Icon = PackageOpen,
  showAction = false,
  actionText = 'Tải lại',
//   onActionPress
}: NoDataCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconBox}>
          <Icon size={64} color="#D1D5DB" strokeWidth={1.5} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {/* Action */}
        {/* {showAction && onActionPress && (
          <Button
            content={actionText}
            variant="outline"
            onPress={onActionPress}
            style={styles.button}
          />
        )} */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8
  }
})