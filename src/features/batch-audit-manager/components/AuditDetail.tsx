import { View, Text, StyleSheet } from 'react-native'
import React, { useMemo } from 'react'
import { ProductBatchAuditDetail } from '../types/product-batch-audit-types'
import Tag from '@/components/ui/tags/Tag'
import { PRODUCT_PACKAGE_TYPE } from '@/features/product-manager/const/product-type'
import { formatDate } from '@/utils/format'
import Card from '@/components/ui/cards/Card'
import { MoveRight } from 'lucide-react-native'

export default function AuditDetail({ audit }: { audit: ProductBatchAuditDetail }) {
    const isIncrease =  useMemo(() => {
       return audit.newValue > audit.oldValue
    }, [audit])
  return (
      <View style={styles.card}>
            <Text style={styles.productName}>Sản phẩm: {audit.productName}</Text>
            <Tag style={styles.codeTag}>
                  <Text style={styles.codeText}>{audit.productCode}</Text>
            </Tag>
            <Card style={styles.infoCard}>
                  <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hãng</Text>
                    <Text style={styles.infoValue}>{audit.brandName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kiểu hộp</Text>
                    <Text style={styles.infoValue}>{PRODUCT_PACKAGE_TYPE[audit.packagingType].name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dung tích</Text>
                    <Text style={styles.infoValue}>{audit.volumeML}ml</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Giá</Text>
                    <Text style={styles.infoValue}>{audit.price.toLocaleString()}đ</Text>
                  </View>
            </Card>
            
            <View style={[styles.newValueBox, isIncrease ? styles.increaseBox : styles.decreaseBox]}>
                  <Text style={styles.batchName}>Lô: {audit.batchCode} ({formatDate(audit.batchCreateDate)})</Text>
                  <View style={styles.batchQuantityContainer}>
                        <Text>Số lượng:</Text>
                        <View style={styles.batchQuantityContainer}>
                              <Text style={styles.oldValueText}>{audit.oldValue}</Text>
                              <Text>
                                    <MoveRight color={isIncrease ? '#16A34A':'#DC2626'}/>
                              </Text>
                              <Text style={[isIncrease ? styles.increaseText : styles.decreaseText,styles.newValueText ]}>{audit.newValue}</Text>
                        </View>
                  </View>
                  <Text>Ngày thay đổi: {formatDate(audit.createDate)}</Text>
            </View>
      </View>
  )
}

const styles = StyleSheet.create({
productName: {
    fontSize: 16,
    color: '#003366',
    fontWeight: 600
  },
productCategoryContainer: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 5,
  },
card: {
     marginVertical: 8
  },
codeTag: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 12,
    marginVertical: 8
},

codeText: {
    color: '#3366CC',
    fontWeight: 700,
    fontSize: 13,
},

infoCard: {
    marginTop: 10,
    marginBottom: 18,
    width: '99%',
    marginHorizontal: 'auto'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 14,
},

infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
},

infoLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
},

infoValue: {
    fontSize: 14,
    fontWeight: '700',
},

batchName: {
    fontSize: 14,
    color: '#003366',
    fontWeight: 600
},


tagText: {
    fontSize: 12,
    fontWeight: 500,
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

oldValueText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4B5563',
  },

newValueText: {
    fontSize: 18,
    fontWeight: 900,
  },

increaseText: {
    color: '#15803D',
  },

decreaseText: {
    color: '#DC2626',
  },

batchQuantityContainer: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center'
  }
})