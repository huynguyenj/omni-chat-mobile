import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import { Plus } from 'lucide-react-native'
import useCreateKeyword from '../hooks/useCreateKeyword'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import { Controller } from 'react-hook-form'
import Input from '@/components/ui/inputs/Input'
import useGetIntentType from '@/features/task/hooks/useGetIntentType'
import Select from '@/components/ui/select/Select'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type CreateSectionProps = {
   onRefresh: () => void
}

export default function CreateSection({ onRefresh }: CreateSectionProps) { 
  const [isCreateKeywordOpen, setIsCreateKeywordOpen] = useState(false)
  const { intentType } = useGetIntentType()
  const { control, errors, handleSubmit, loading, onSubmit, reset } = useCreateKeyword({ onRefresh: onRefresh })
  const handleOpenCreateKeyword = () => {
    setIsCreateKeywordOpen(prev => !prev)
    reset({
      intentTypeId: '',
      keywordText: '',
      weight: 0
    })
  }
  return (
   <View style={styles.btnContainer}>
            <Button
               style={styles.btn}
               icon={{ iconName: Plus, iconDirection: 'right' }}
               onPress={handleOpenCreateKeyword}
            />
   <ModalCustom isOpen={isCreateKeywordOpen} onClose={() => setIsCreateKeywordOpen(false)}>
      <Text style={styles.modalTitle}>Tạo từ khóa</Text>
      <View style={styles.inputContainer}>
            <Controller
                  control={control}
                  name="keywordText"
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Nhập từ khóa..."
                              label="Từ khóa"
                              error={errors.keywordText?.message}
                        />
                        )}
            />
            <Controller
                  control={control}
                  name="weight"
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value ? String(value) : ''}
                              onChangeText={(text) => {
                              const numberValue = Number(text)
                              onChange(isNaN(numberValue) ? undefined : numberValue)
                              }}
                              onBlur={onBlur}
                              placeholder="Nhập mức độ ưu tiên"
                              label="Độ ưu tiên"
                              error={errors.weight?.message}
                              keyboardType="number-pad"
                        />
                  )}
            />
      </View>
      <Controller
         control={control}
         name='intentTypeId'
         render={({ field }) => (
            <Select
                  onChange={field.onChange}
                  value={field.value}
                  options={intentType?.map((c) => ({ label: c.typeName, value: c.id })) || []}
                  placeHolder="Chọn loại đơn"
                  label="Loại đơn"
                 />
            )}
            />
      <View style={styles.actions}>
                    { loading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Hủy"
                                    variant="outline"
                                    style={styles.normalBtn}
                                    onPress={() => setIsCreateKeywordOpen(false)}
                              />
      
                              <Button
                                    content="Tạo"
                                    variant="primary"
                                    icon={{ iconName: Plus, iconDirection: 'left' }}
                                    style={styles.normalBtn}
                                    onPress={handleSubmit(onSubmit)}
                              />
                        </>
                    }
                  </View>
   </ModalCustom>
   </View>
  )
}

const styles = StyleSheet.create({
      btnContainer: {
            flex: 0.15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end'
      },
      btn: {
            width: 50,
            height: 50,
            borderRadius: 50,
      },
      modalTitle: {
            fontSize: 16,
            color: '#003366',
            fontWeight: '600',
            textAlign: 'center',
      },
      inputContainer: {
            gap: 5,
            marginVertical: 10
      },
      actions: {
            flexDirection: 'row',
            gap: 10,
            marginTop: 20,
      },
      normalBtn:{
            flex: 1
      }
})