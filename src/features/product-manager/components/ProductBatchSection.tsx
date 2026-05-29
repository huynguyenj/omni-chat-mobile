import { View, Text, FlatList, Image, StyleSheet, ScrollView } from 'react-native'
import React, { useState } from 'react'
import useGetProductBatchManager from '../hooks/useGetProductBatch'
import usePagination from '@/hooks/usePagination'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag'
import { Plus, Trash } from 'lucide-react-native'
import ProductBatchItem from './ProductBatchItem'
import { PRODUCT_PACKAGE_TYPE, PRODUCT_TYPE } from '../const/product-type'
import Button from '@/components/ui/buttons/Button'
import ProductBatchItemSkeleton from './ui/skeleton/ProductBatchItemSkeleton'
import NoDataCard from '@/components/ui/cards/NodataCard'
import { ProductDetailType } from '../types/product-type-manager'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import useCreateBatchProduct from '../hooks/useCreateProductBatch'
import { Controller } from 'react-hook-form'
import InputDate from '@/components/ui/inputs/InputDate'
import Input from '@/components/ui/inputs/Input'
import { formatDate } from '@/utils/format'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type ProductBatchSectionProps = {
      item: ProductDetailType

}

export default function ProductBatchSection({ item }: ProductBatchSectionProps) {
  const { batchCurrentPage, handleRefresh, loading, productBatchList, setBatchCurrentPage } = useGetProductBatchManager({ productId: item.id })
  const { loadMore } = usePagination({ currentPage: batchCurrentPage, setPage: setBatchCurrentPage, loading: loading, totalPage: productBatchList?.meta.total_items ?? 0 })
  const { handleCreateBatch, listBatchItems, loading: loadingCreateBatch, setListBatchItems, setProductChoseForBatch, handleAddBatch, handleDeleteBatch, manuFactureDate, quantity, setManuFactureDate, setQuantity } = useCreateBatchProduct({ onRefresh: handleRefresh })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const handleOpenCreate = () => {
      setProductChoseForBatch(item.id)
      setIsCreateOpen(prevState => !prevState)
  }
  return (
    <View>
      <FlatList
          data={productBatchList?.items ?? []}
          keyExtractor={(batch) => String(batch.id)}
          renderItem={({ item }) => <ProductBatchItem item={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          onRefresh={handleRefresh}
          refreshing={loading}
          ListHeaderComponent={
            <>
              {/* HEADER */}
              <View style={styles.modalHeader}>
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require('@assets/product-unavailable.png')
                  }
                  style={styles.modalImage}
                />

                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalProductName}>{item.name}</Text>

                  <Tag style={styles.codeTag}>
                    <Text style={styles.codeText}>#{item.code}</Text>
                  </Tag>
                </View>
              </View>

              {/* PRICE + STOCK */}
              <View style={styles.summaryContainer}>
                <Card variant="primary" style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>GIÁ BÁN</Text>
                  <Text style={styles.summaryPrice}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </Card>

                <Card variant="lightGrey" style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>TỒN KHO</Text>
                  <Text style={styles.summaryStock}>
                    {item.quantity.toLocaleString()} hộp
                  </Text>
                </Card>
              </View>

              {/* INFO */}
              <Card style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hãng</Text>
                  <Text style={styles.infoValue}>{item.brand}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Loại sữa</Text>
                  <Text style={styles.infoValue}>
                    {PRODUCT_TYPE[item.productKind].name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Loại hộp</Text>
                  <Text style={styles.infoValue}>
                    {PRODUCT_PACKAGE_TYPE[item.productPackagingType].name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dung tích</Text>
                  <Text style={styles.infoValue}>{item.volumeMl}ml</Text>
                </View>

                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                  <Text style={styles.infoLabel}>Mô tả</Text>

                  <Text
                    style={[
                      styles.infoValue,
                      { maxWidth: 220, textAlign: 'right' }
                    ]}
                  >
                    {item.description || 'Chưa có mô tả'}
                  </Text>
                </View>
              </Card>

              {/* SECTION TITLE */}
              <View style={styles.batchSection}>
                <Text style={styles.sectionTitle}>Danh sách lô hàng</Text>
                <Button
                  icon={{ iconName: Plus, iconDirection: 'center' }}
                  style={styles.createBtn}
                  onPress={handleOpenCreate}
                />
              </View>

              {loading ? <ProductBatchItemSkeleton /> : null}
            </>
          }
          ListEmptyComponent={
            !loading ? (
              <NoDataCard title='Sản phẩm này chưa có lô hàng'/>
            ) : null
          }
      
        />
        <ModalCustom isOpen={isCreateOpen} onClose={handleOpenCreate}>
            <Text style={styles.createModalTitle}>Tạo lô cho sản phẩm</Text>
            <View style={styles.inputContainer}>
                        <InputDate label='Ngày sản xuất' onChange={setManuFactureDate} value={manuFactureDate}/>
                        <Input 
                              keyboardType="numeric"
                              value={quantity ? String(quantity) : ''} 
                              label='Số lượng' 
                              onChangeText={(value) => setQuantity(Number(value))}
                              style={styles.input}
                              placeholder='1'
                        />
            </View>
            <Button content='Thêm lô' icon={{ iconName: Plus, iconDirection: 'left' }} onPress={handleAddBatch}/>
          <ScrollView style={styles.listBatchContainer}>
            { listBatchItems.map((item, i) => (
                  <Card key={i} variant='lightGrey' style={styles.cardBatchItem}>
                        <View>
                              <Text>Lô #{i+1}</Text>
                              <Text>Ngày sản xuất: {formatDate(item.manuFactureDate)}</Text>
                        </View>
                        <Button
                              icon={{ iconName: Trash, iconDirection: 'center' }}
                              onPress={() => handleDeleteBatch(item)}
                              variant='danger'
                              style={styles.deleteBatchItemBtn}
                        />
                  </Card>
            )) }
          </ScrollView>
          { listBatchItems.length > 0 &&
            <View style={styles.btnContainer}>
              { loadingCreateBatch ? 
                <LoadingCircle/>
                :
                <>
                  <Button
                        content='Hủy'
                        variant='outline'
                        style={styles.createModalBtn}
                        onPress={handleOpenCreate}
                  />
                  <Button
                        content='Tạo lô'
                        style={styles.createModalBtn}
                        onPress={handleCreateBatch}
                  />
                </>
              }
            </View>
          }
        </ModalCustom>
    </View>
  )
}

const styles = StyleSheet.create({
modalHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 18,
},

modalImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
},

modalHeaderContent: {
    flex: 1,
},

modalProductName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
},

codeTag: {
    marginTop: 10,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 12,
},

codeText: {
    color: '#3366CC',
    fontWeight: '700',
    fontSize: 13,
},

summaryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
},

summaryCard: {
    flex: 1,
},

summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 8,
},

summaryPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3366CC',
},

summaryStock: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
},

infoCard: {
    marginBottom: 18,
    width: '99%',
    marginHorizontal: 'auto'
},

sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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

batchSection: {
    marginTop: 5,
    maxHeight: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
},
createBtn: {
    width: 35,
    aspectRatio: 1,
    borderRadius: 160
},
createModalTitle:{
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
    textAlign: 'center',
},
inputContainer: {
    gap: 5,
    marginVertical: 15
},
input: {
    height: 45
},
listBatchContainer: {
    maxHeight: 300
},
cardBatchItem: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   gap: 5,
   marginVertical: 5
},
deleteBatchItemBtn: {
   width: 35,
   aspectRatio: 1,
   borderRadius: 100
},
btnContainer: {
   flexDirection: 'row',
   gap: 5
},
createModalBtn: {
   flex: 1,
   marginVertical: 5
}
})