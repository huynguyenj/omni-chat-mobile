import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import { Plus, Image as ImageIcon } from 'lucide-react-native'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Card from '@/components/ui/cards/Card'
import Input from '@/components/ui/inputs/Input'
import Select from '@/components/ui/select/Select'
import { Controller } from 'react-hook-form'
import useCreateProduct from '../hooks/useCreateProduct'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import { LIST_PRODUCT_CAPACITY, LIST_PRODUCT_KIND_FILTER, LIST_PRODUCT_PACKAGE_TYPE } from '../const/filter-sort-list'
import useGetAllBrand from '@/features/order/hooks/useGetAllBrand'
import ImagePicker from '@/components/ui/inputs/ImagePicker'


type ProductCreationProps = {
  onRefresh: () => void
}

export default function ProductCreation({ onRefresh }: ProductCreationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { listBrand } = useGetAllBrand()
  const { handleSubmit, control, errors, loading, onSubmit, image, pickImage} = useCreateProduct({ onRefresh })

  const handleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      <View style={styles.btnContainer}>
        <Button
          style={styles.btn}
          icon={{ iconName: Plus, iconDirection: 'right' }}
          onPress={handleOpen}
        />
      </View>

      <ModalCustom isOpen={isOpen} onClose={handleOpen}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>Tạo sản phẩm mới</Text>
          <View style={styles.formContainer}>
            {/* IMAGE PICKER */}
            <ImagePicker previewImage={image} onPress={pickImage}/>

            {/* NAME */}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  label="Tên sản phẩm"
                  placeholder="Nhập tên sản phẩm"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.name?.message}
                  style={styles.inputContainer}
                />
              )}
            />
            <View style={styles.selectOuterContainer}>
                  {/* PRODUCT KIND */}
                  <Controller
                        control={control}
                        name="productKind"
                        render={({ field }) => (
                        <Select
                              label="Loại sữa"
                              value={field.value}
                              onChange={field.onChange}
                              options={LIST_PRODUCT_KIND_FILTER.map((item) => {
                                    return {
                                          label: item.label,
                                          value: item.value
                                    }
                              })}
                              placeHolder="Chọn loại sữa"
                              error={errors.productKind?.message}
                              style={styles.selectContainer}
                        />
                        )}
                  />

                  {/* PACKAGE TYPE */}
                  <Controller
                        control={control}
                        name="productPackagingType"
                        render={({ field }) => (
                        <Select
                              label="Loại hộp"
                              value={field.value}
                              onChange={field.onChange}
                              options={LIST_PRODUCT_PACKAGE_TYPE.map((item) => {
                                    return {
                                          label: item.label,
                                          value: item.value
                                    }
                              })}
                              placeHolder="Chọn loại hộp"
                              error={errors.productPackagingType?.message}
                              style={styles.selectContainer}
                        />
                        )}
                  />
            </View>
            <View style={styles.selectOuterContainer}>
                  {/* VOLUME */}
                  <Controller
                        control={control}
                        name="volumeMl"
                        render={({ field }) => (
                        <Select
                              label="Dung tích"
                              value={field.value ? String(field.value) : ''}
                              onChange={(value) => field.onChange(value)}
                              options={LIST_PRODUCT_CAPACITY.map((item) => {
                                    return {
                                          label: item.label,
                                          value: item.value
                                    }
                              })}
                              placeHolder="Chọn dung tích"
                              error={errors.volumeMl?.message}
                              style={styles.selectContainer}
                        />
                        )}
                  />

                  {/* BRAND */}
                  <Controller
                        control={control}
                        name="brandId"
                        render={({ field }) => (
                  <Select
                        label="Hãng sữa"
                        value={field.value}
                        options={listBrand.map((item) => {
                              return {
                                    label: item.name,
                                    value: item.id
                              }
                        })}
                        onChange={field.onChange}
                        placeHolder='Chọn hãng sữa'
                        error={errors.brandId?.message}
                        style={styles.selectContainer}
                  />
                  )}
                  />
            </View>

            {/* PRICE */}
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Input
                  label="Giá bán"
                  placeholder="Nhập giá sản phẩm"
                  keyboardType="numeric"
                  value={field.value ? String(field.value) : ''}
                  onChangeText={(value) => field.onChange(Number(value))}
                  error={errors.price?.message}
                  style={styles.inputContainer}
                />
              )}
            />

            {/* LIFE SPAN */}
            <Controller
              control={control}
              name="lifeSpan"
              render={({ field }) => (
                <Input
                  label="Hạn sử dụng (ngày)"
                  placeholder="Ví dụ: 180"
                  keyboardType="numeric"
                  value={field.value ? String(field.value) : ''}
                  onChangeText={(value) => field.onChange(Number(value))}
                  error={errors.lifeSpan?.message}
                  style={styles.inputContainer}
                />
              )}
            />

            {/* DESCRIPTION */}
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  label="Mô tả"
                  placeholder="Nhập mô tả sản phẩm"
                  value={field.value}
                  onChangeText={field.onChange}
                  multiline
                  numberOfLines={4}
                  style={[styles.inputContainer, styles.descriptionInput]}
                />
              )}
            />

            {/* ACTIONS */}
            <View style={styles.actions}>
             {loading ? 
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                        content="Hủy"
                        variant="outline"
                        style={styles.normalBtn}
                        onPress={handleOpen}
                        />
      
                        
                        <Button
                        content="Tạo sản phẩm"
                        style={styles.normalBtn}
                        onPress={handleSubmit(onSubmit)}
                        />
                  </>
             }
            </View>
          </View>
        </ScrollView>
      </ModalCustom>
    </>
  )
}

const styles = StyleSheet.create({
  btnContainer: {
    flex: 0.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  btn: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },

  modalTitle: {
    fontSize: 20,
    color: '#003366',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalContentContainer: {
    height: 550
  },
  formContainer: {
    gap: 14,
  },

  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imagePlaceholder: {
    alignItems: 'center',
    gap: 10,
  },

  imageText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },

  inputContainer: {
    marginTop: 5,
  },

  selectOuterContainer: {
      gap: 5
  },

  selectContainer: {
    height: 50,
  },

  descriptionInput: {
    minHeight: 100,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 45,
    justifyContent: 'center'
  },

  normalBtn: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})