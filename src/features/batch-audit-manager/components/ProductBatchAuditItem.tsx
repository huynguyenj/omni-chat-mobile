import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag'
import { ArrowDownRight, ArrowUpRight, Eye, RotateCcw} from 'lucide-react-native'
import { formatDate } from '@/utils/format'
import { ProductBatchAuditItem } from '../types/product-batch-audit-types'
import { actionConfig } from '../const/action-config'
import useGetDetailAudit from '../hooks/useGetDetailAudit'
import Button from '@/components/ui/buttons/Button'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import AuditDetail from './AuditDetail'
import NoDataCard from '@/components/ui/cards/NodataCard'


type ProductBatchAuditItemProps = {
  item: ProductBatchAuditItem
}
export default function ProductAuditItem({ item }: ProductBatchAuditItemProps) {
  const isIncrease =  useMemo(() => {
     return item.newValue > item.oldValue
  }, [item])
  const difference =  useMemo(() => {
     return Math.abs(item.newValue - item.oldValue)
  }, [item])
  const ActionIcon = useMemo(() => {
     return actionConfig[item.action].icon || RotateCcw
  }, [item])
  const { auditDetail } = useGetDetailAudit({ auditId: item.id })
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const handleOpenDetail = () => {
    setIsDetailOpen(prevState => !prevState)
  }
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.staffContainer}>
          <Text style={styles.staffLabel}>Nhân viên thao tác</Text>

          <Text style={styles.staffName}>
            {item.staffName}
          </Text>
        </View>

        <Tag>
          <View style={styles.tagContent}>
            <ActionIcon
              size={14}
              color="#FFFFFF"
              strokeWidth={2.4}
            />

            <Text style={styles.tagText}>
              {actionConfig[item.action].label ?? item.action}
            </Text>
          </View>
        </Tag>
      </View>

      <View style={styles.quantityWrapper}>
        <View style={styles.oldValueBox}>
          <Text style={styles.quantityLabel}>
            Số lượng cũ
          </Text>
          <Text style={styles.oldValueText}>
            {item.oldValue}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          {isIncrease ? (
            <ArrowUpRight
              size={26}
              color="#16A34A"
              strokeWidth={2.5}
            />
          ) : (
            <ArrowDownRight
              size={26}
              color="#DC2626"
              strokeWidth={2.5}
            />
          )}
        </View>

        <View
          style={[styles.newValueBox,
            isIncrease
              ? styles.increaseBox
              : styles.decreaseBox,
          ]}
        >
          <Text style={styles.quantityLabel}>
            Số lượng mới
          </Text>

          <Text
            style={[
              styles.newValueText,
              isIncrease
                ? styles.increaseText
                : styles.decreaseText,
            ]}
          >
            {item.newValue}
          </Text>

          <Text
            style={[
              styles.diffText,
              isIncrease
                ? styles.increaseText
                : styles.decreaseText,
            ]}
          >
            {isIncrease ? `+${difference}` : `-${difference}`}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {actionConfig[item.action].description ||
            'Đã cập nhật số lượng tồn kho'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {formatDate(item.createDate)}
        </Text>
        <Button style={styles.detailBtn} content='Chi tiết' icon={{ iconName: Eye, iconDirection: 'left'  }} onPress={handleOpenDetail}/>
      </View>
      <ModalCustom isOpen={isDetailOpen} onClose={handleOpenDetail}>
        { auditDetail ?
        <AuditDetail audit={auditDetail}/>
        :
        <NoDataCard/>
        }
      </ModalCustom>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 18,
    padding: 16,
    gap: 16,
    width: '99%',
    marginHorizontal: 'auto',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  staffContainer: {
    flex: 1,
  },

  staffLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
    fontWeight: '600',
  },

  staffName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  oldValueBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  newValueBox: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },

  increaseBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },

  decreaseBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },

  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },

  oldValueText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B5563',
  },

  newValueText: {
    fontSize: 24,
    fontWeight: '900',
  },

  increaseText: {
    color: '#15803D',
  },

  decreaseText: {
    color: '#DC2626',
  },

  diffText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
  },

  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailBtn: {
    width: 100
  }
})