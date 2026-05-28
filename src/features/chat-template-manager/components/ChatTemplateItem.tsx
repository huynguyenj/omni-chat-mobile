import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Card from '@/components/ui/cards/Card'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Input from '@/components/ui/inputs/Input'
import { Controller } from 'react-hook-form'
import Button from '@/components/ui/buttons/Button'
import { Pencil, Trash2 } from 'lucide-react-native'
import { ChatTemplateType } from '../types/chat-template-types'
import useDeleteChatTemplate from '../hooks/useDeleteChatTemplate'
import useUpdateChatTemplate from '../hooks/useUpdateChatTemplate'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

export default function ChatTemplateItem({ item, onRefresh }: { item: ChatTemplateType, onRefresh: () => void }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const { handleDelete, loading: deleteLoading } = useDeleteChatTemplate({ onRefresh: onRefresh, onCloseModalDelete: setIsAlertOpen })
  const { handleSubmit, loading: updateLoading, onSubmit, control, reset, errors } = useUpdateChatTemplate({ onRefresh: onRefresh, id: item.id })

  const handleOpenEdit = () => {
    setIsEditOpen((prev) => !prev)
    reset({
      code: item.code,
      content: item.content
    })
  }

  const handleOpenAlert = () => {
    setIsAlertOpen((prev) => !prev)
  }

  return (
    <Card style={[styles.container]}>
      
      <View style={styles.header}>
          <Text style={[styles.title]}>
            Mã: {item.code}
          </Text>
      </View>

      <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Nội dung: {item.content}
          </Text>
      </View>

      <View style={styles.actions}>
        <Button
          content="Sửa"
          variant="outline"
          icon={{ iconName: Pencil, iconDirection: 'left' }}
          style={styles.btn}
          onPress={handleOpenEdit}
        />

        <Button
          content="Xóa"
          variant="danger"
          icon={{ iconName: Trash2, iconDirection: 'left' }}
          style={styles.btn}
          onPress={handleOpenAlert}
        />
      </View>
      <ModalCustom isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <Text style={styles.titleModal}>Cập nhật từ mẫu</Text>
            <Controller
                  control={control}
                  name='code'
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="H02"
                              label="Mã mẫu"
                              error={errors.code?.message}
                        />
                  ) 
            }
            />
            <Controller
                  control={control}
                  name='content'
                  render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="H02"
                              label="Nội dung"
                              error={errors.content?.message}
                        />
                  ) 
            }
            />
            <View style={styles.actions}>
            { updateLoading ?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Hủy"
                              variant="outline"
                              style={styles.btn}
                              onPress={() => setIsEditOpen(false)}
                        />
            
                        <Button
                              content="Lưu"
                              variant="secondary"
                              icon={{ iconName: Pencil, iconDirection: 'left' }}
                              style={styles.btn}
                              onPress={handleSubmit(onSubmit)}
                        />
                  </>
            }
            </View>
      </ModalCustom>
        <ModalCustom isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
                  <Text style={styles.titleModal}>Bạn có chắc chắn muốn xóa từ khóa này</Text>
                  <View style={styles.actions}>
                    { deleteLoading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Hủy"
                                    variant="outline"
                                    style={styles.btn}
                                    onPress={() => setIsAlertOpen(false)}
                              />
      
                              <Button
                                    content="Xóa"
                                    variant="danger"
                                    icon={{ iconName: Trash2, iconDirection: 'left' }}
                                    style={styles.btn}
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
    marginVertical: 8,
    borderLeftWidth: 4,
    borderRadius: 14,
    width:'99%'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },


  infoContainer: {
    marginTop: 8,
    gap: 4,
  },

  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },

  subText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  btn: {
    flex: 1,
  },
    titleModal: {
      fontSize: 16,
      fontWeight:600,
      marginVertical: 10,
      textAlign: 'center',
      color:'#003366'
  },
})