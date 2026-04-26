import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Card from '@/components/ui/cards/Card'
import Button from '@/components/ui/buttons/Button'
import { Pencil, Trash2, TrendingUp } from 'lucide-react-native'
import { KeywordDetailType } from '../types/keyword-types'
import { getColorByWeight } from '../utils/badge-selector'
import useDeleteKeyword from '../hooks/useDeleteKeyword'
import useUpdateKeyword from '../hooks/useUpdateKeyword'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import { Controller } from 'react-hook-form'
import Input from '@/components/ui/inputs/Input'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import { formatDate } from '@/utils/format'

type KeywordItemProps = {
  data: KeywordDetailType
  onRefresh: () => void
}

export default function KeywordItem({ data, onRefresh }: KeywordItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const { handleDelete, loading: deleteLoading, setKeywordId } = useDeleteKeyword({ onRefresh: onRefresh, onCloseModalDelete: setIsAlertOpen })
  const { handleSubmit, loading: updateLoading, onSubmit, control, reset, setKeywordSelected } = useUpdateKeyword({ onRefresh: onRefresh })
  const color = getColorByWeight(data.weight)

  const handleOpenEdit = (keyword: KeywordDetailType) => {
    setKeywordSelected(keyword)
    setIsEditOpen((prev) => !prev)
    reset({
      weight: keyword.weight
    })
  }

  const handleOpenAlert = (keywordId: string) => {
    setKeywordId(keywordId)
    setIsAlertOpen((prev) => !prev)
  }

  return (
    <Card style={[styles.container, { borderLeftColor: color.border }]}>
      
      <View style={styles.header}>
        <Text style={styles.title}>{data.keywordText}</Text>

        <View style={[styles.badge, { backgroundColor: color.bg }]}>
          <Text style={[styles.badgeText, { color: color.text }]}>
            {color.label}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <TrendingUp size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Độ ưu tiên • Weight: {data.weight}
          </Text>
        </View>

        <Text style={styles.subText}>
          Chức năng: {data.intentTypeName}
        </Text>
         <Text style={styles.subText}>
          Ngày tạo: {formatDate(data.createDate)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          content="Sửa"
          variant="outline"
          icon={{ iconName: Pencil, iconDirection: 'left' }}
          style={styles.btn}
          onPress={() => handleOpenEdit(data)}
        />

        <Button
          content="Xóa"
          variant="danger"
          icon={{ iconName: Trash2, iconDirection: 'left' }}
          style={styles.btn}
          onPress={() => handleOpenAlert(data.id)}
        />
      </View>
      <ModalCustom isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <Text>Cập nhật từ khóa</Text>
            <Controller
            control={control}
            name='weight'
            render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                        value={String(value)}
                        onChangeText={(text) => {
                              const numberValue = Number(text)
                              onChange(isNaN(numberValue) ? undefined : numberValue)
                        }}
                        onBlur={onBlur}
                        placeholder="2"
                        label="Độ ưu tiên"
                        keyboardType="number-pad"
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
                                    onPress={handleDelete}
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

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  infoContainer: {
    marginTop: 8,
    gap: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
      textAlign: 'center'
  },
})