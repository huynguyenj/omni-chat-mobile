import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native'
import { BookImage, ChevronRight, Edit, Pencil, Trash } from 'lucide-react-native'
import { ProductDetailType } from '../types/product-type-manager'
import { PRODUCT_PACKAGE_TYPE, PRODUCT_TYPE } from '../const/product-type'
import Card from '@/components/ui/cards/Card'
import Button from '@/components/ui/buttons/Button'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import useGetProductBatchManager from '../hooks/useGetProductBatch'
import usePagination from '@/hooks/usePagination'
import ProductBatchItem from './ProductBatchItem'
import Tag from '@/components/ui/tags/Tag'
import useUpdateProduct from '../hooks/useUpdateProduct'
import { Controller } from 'react-hook-form'
import Input from '@/components/ui/inputs/Input'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import ImagePicker from '@/components/ui/inputs/ImagePicker'
import useDeleteProduct from '../hooks/useDeleteProduct'
import ProductBatchItemSkeleton from './ui/skeleton/ProductBatchItemSkeleton'
import NoDataCard from '@/components/ui/cards/NodataCard'

export default function ProductManagementItem({ item, onRefresh }: { item: ProductDetailType, onRefresh: () => void }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditImageOpen, setIsEditImageOpen] = useState(false)
  const { batchCurrentPage, handleRefresh, loading, productBatchList, setBatchCurrentPage, setProductForBatchId } = useGetProductBatchManager()
  const { loadMore } = usePagination({ currentPage: batchCurrentPage, setPage: setBatchCurrentPage, loading: loading, totalPage: productBatchList?.meta.total_items ?? 0 })
  const { controlProductInfo, errors, image, loading: loadingUpdate, pickImage, handleSubmitProductInfo, onProductImageSubmit, onProductInfoSubmit, resetProductInfo, setImage } = useUpdateProduct({ onRefresh, productId: item.id })
  const { handleDelete, loading: deleteLoading } = useDeleteProduct({ onRefresh, onCloseModalDelete: setIsDeleteOpen })

  const handleDetailOpen = () => {
    setIsDetailOpen(prevState => !prevState)
    setProductForBatchId(item.id)
  }
  const handleOpenEdit = () => {
    resetProductInfo({
      name: item.name,
      description: item.description,
      price: item.price
    })
    setIsEditOpen(prevState => !prevState)
  }
  const handleOpenEditImage = () => {
    setIsEditImageOpen(prevState => !prevState)
    setImage(null)
  }

  const handleOpenDelete = () => {
    setIsDeleteOpen(prevState => !prevState)
  }
  return (
    <Card style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name} - {item.brand}</Text>
          <Text style={styles.milkType}>
            Loại sữa: <Text style={styles.bold}>{PRODUCT_TYPE[item.productKind].name}</Text>
          </Text>
          <Text style={styles.milkType}>
            Loại hộp: <Text style={styles.bold}>{PRODUCT_PACKAGE_TYPE[item.productPackagingType].name}</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={handleOpenEditImage}>
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : require('@assets/product-unavailable.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.label}>TỒN KHO</Text>
          <View style={styles.valueRow}>
            <Text style={styles.stockText}>
              {item.quantity.toLocaleString()}
            </Text>
            <Text style={styles.unit}> hộp</Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>GIÁ BÁN</Text>
          <View style={styles.valueRow}>
            <Text style={styles.priceText}>
              {item.price.toLocaleString()}
            </Text>
            <Text style={styles.unit}> đ</Text>
          </View>
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Button
          activeOpacity={0.8}
          style={styles.button}
          content='Xem chi tiết'
          icon={{ iconName: ChevronRight, iconDirection: 'right' }}
          onPress={handleDetailOpen}
        />
        <Button
          variant='secondary'
          onPress={handleOpenEdit}
          style={styles.editBtn}
          icon={{ iconName: Edit, iconDirection: 'center' }}
        />
        <Button
          variant='danger'
          onPress={handleOpenDelete}
          style={styles.editBtn}
          icon={{ iconName: Trash, iconDirection: 'center' }}
        />
      </View>
      <ModalCustom isOpen={isDetailOpen} onClose={handleDetailOpen}>
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
            </ModalCustom>
            {/*Update product info */}
            <ModalCustom isOpen={isEditOpen} onClose={handleOpenEdit}>
              <Text style={styles.editTitleModal}>Cập nhật thông tin sản phẩm</Text>
              <View style={styles.editInputContainer}>
                <Controller
                  control={controlProductInfo}
                  name='name'
                  render={({ field }) => (
                    <Input label='Tên' value={field.value} placeholder='Sữa long thành' onChangeText={field.onChange} error={errors.name?.message}/>
                  )}
                />
                <Controller
                  control={controlProductInfo}
                  name='description'
                  render={({ field }) => (
                    <Input label='Mô tả' value={field.value} placeholder='Sữa long thành được lấy từ...' onChangeText={field.onChange}/>
                  )}
                />
                <Controller
                  control={controlProductInfo}
                  name='price'
                  render={({ field }) => (
                    <Input label='Giá' value={String(field.value)} placeholder='10.000' onChangeText={field.onChange} keyboardType='number-pad'/>
                  )}
                />
              </View>
              <View style={styles.btnContainer}>
                    {loadingUpdate ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Hủy"
                                    variant="outline"
                                    style={styles.button}
                                    onPress={() => setIsEditOpen(false)}
                              />

                              <Button
                                    content="Lưu"
                                    variant="secondary"
                                    icon={{ iconName: Pencil, iconDirection: 'left' }}
                                    style={styles.button}
                                    onPress={handleSubmitProductInfo(onProductInfoSubmit)}
                              />
                        </>
                    }
                  </View>
      </ModalCustom>
      {/*Update product image */}
      <ModalCustom isOpen={isEditImageOpen} onClose={handleOpenEditImage}>
      <Text style={styles.editTitleModal}>Cập nhật ảnh sản phẩm</Text>
      <View style={styles.imageEditContentContainer}>
          <Text style={styles.bold}>Ảnh cũ</Text>
          {item.imageUrl ?
          <Image
              source={{ uri: item.imageUrl }}
              style={styles.modalImage}
            />
          :
          <Text>Hiện tại sản phẩm này chưa có ảnh</Text>
          }
      </View>
      <Text style={styles.bold}>Ảnh mới</Text>
      <ImagePicker previewImage={image} onPress={pickImage} label='Chọn ảnh mới'/>
        <View style={styles.btnContainer}>
              {loadingUpdate ?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Hủy"
                              variant="outline"
                              style={styles.button}
                              onPress={() => setIsEditImageOpen(false)}
                        />

                        <Button
                              content="Lưu"
                              variant="secondary"
                              icon={{ iconName: Pencil, iconDirection: 'left' }}
                              style={styles.button}
                              onPress={onProductImageSubmit}
                        />
                  </>
              }
            </View>
      </ModalCustom>
      <ModalCustom isOpen={isDeleteOpen} onClose={handleDetailOpen}>
        <Text style={styles.editTitleModal}>Xác nhận</Text>
        <Text>Bạn có chắc chắn muốn xóa sản phẩm {item.name} không ?</Text>
         <View style={styles.btnContainer}>
              {deleteLoading ?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Không"
                              variant="outline"
                              style={styles.button}
                              onPress={handleOpenDelete}
                        />

                        <Button
                              content="Có"
                              variant="danger"
                              icon={{ iconName: Trash, iconDirection: 'left' }}
                              style={styles.button}
                              onPress={() => handleDelete(item.id)}
                        />
                  </>
              }
            </View>
      </ModalCustom>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    marginVertical: 8,
    gap: 18,
    width: '99%',
    marginHorizontal: 'auto'
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },

  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 30,
    maxWidth: 260
  },

  milkType: {
    marginTop: 6,
    color: '#7B8190',
    fontSize: 14,
    fontWeight: '500',
  },

  bold: {
    color: '#4B5563',
    fontWeight: '700',
  },

  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover',
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    color: '#9CA3AF',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  stockText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#003366',
  },

  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3366CC',
  },

  unit: {
    fontSize: 14,
    color: '#7B8190',
    marginBottom: 4,
  },
  btnContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 15 
  },
  button: {
    paddingVertical: 14,
    flex: 0.9
  },
  editBtn: {
    flex: 0.2,
    paddingHorizontal: 5,
  },
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
},
editTitleModal: {
    fontSize: 16,
    fontWeight:600,
    marginVertical: 8,
    textAlign: 'center'
},
editInputContainer: {
  marginVertical: 15,
  flexDirection: 'column',
  gap: 8
},
imageEditContentContainer: {
  gap: 10,
  marginVertical: 10
},
 imagePreview: {
  width: 150,
  height: 150,
 }
})