import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Button from '@/components/ui/buttons/Button'
import useCreateChatTemplate from '../hooks/useCreateChatTemplate'
import { Plus } from 'lucide-react-native'
import Input from '@/components/ui/inputs/Input'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type ChatTemplateCreationProps = {
   onRefresh: () => void
}

export default function ChatTemplateCreation({ onRefresh }: ChatTemplateCreationProps) {
  const { errors, handleSubmit, loading, onSubmit, control, reset } = useCreateChatTemplate({ onRefresh })
    const [isCreateChatTemplateOpen, setIsCreateChatTemplateOpen] = useState(false)
  const handleOpenCreateChatTemplate = () => {
    setIsCreateChatTemplateOpen(prev => !prev)
    reset({
      code: '',
      content: ''
    })
  }
  return (
      <View style={styles.btnContainer}>
            <Button
               style={styles.btn}
               icon={{ iconName: Plus, iconDirection: 'right' }}
               onPress={handleOpenCreateChatTemplate}
            />
   <ModalCustom isOpen={isCreateChatTemplateOpen} onClose={handleOpenCreateChatTemplate}>
      <Text style={styles.modalTitle}>Tạo từ khóa</Text>
      <View style={styles.inputContainer}>
            <Controller
                  control={control}
                  name="code"
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Nhập từ khóa mẫu..."
                              label="Từ khóa"
                              error={errors.code?.message}
                        />
                        )}
            />
            <Controller
                  control={control}
                  name="content"
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Nhập nội dung từ khóa mẫu"
                              label="Nội dung"
                              error={errors.content?.message}
                        />
                  )}
            />
      </View>
      <View style={styles.actions}>
                    { loading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Hủy"
                                    variant="outline"
                                    style={styles.normalBtn}
                                    onPress={handleOpenCreateChatTemplate}
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