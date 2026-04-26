import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useMemo, useState } from 'react'
import Card from '@/components/ui/cards/Card'
import Button from '@/components/ui/buttons/Button'
import { Mail, Shield, Pencil, Trash2 } from 'lucide-react-native'
import { StaffDetailType } from '../types/staff-type'
import useUpdateStaffInfo from '../hooks/useUpdateStaffInfo'
import useDeleteStaff from '../hooks/useDeleteStaff'
import { IntentType } from '@/features/task/types/task-type'
import useGetIntentType from '@/features/task/hooks/useGetIntentType'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Checkbox from '@/components/ui/inputs/Checkbox'
import { Controller } from 'react-hook-form'
import Input from '@/components/ui/inputs/Input'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type StaffItemProps = {
  data: StaffDetailType
  onRefresh: () => void
}

export default function StaffItem({ data, onRefresh }: StaffItemProps) {
   const [isOpenEdit, setIsOpenEdit] = useState(false)
   const [isAlertOpen, setIsAlertOpen] = useState(false)
   const { intentType } = useGetIntentType()
   const {checkedIntentType, errors, handleSubmit, loading:loadingUpdate, onSubmit, control, reset, setCheckIntentType, setStaffInfoEdit } = useUpdateStaffInfo({ onRefresh: onRefresh })
    const { handleDelete, loading: loadingDelete, setStaffId } = useDeleteStaff({ onRefresh: onRefresh, onCloseModalUpdate: setIsAlertOpen })
  const initials = useMemo(() => {
      return data.name
            ?.split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
  }, [data])
   const handleOpenEdit = (staffInfo: StaffDetailType) => {
      const newIntentTypeCheck = new Set('')
      staffInfo.staffIntentTypes.forEach((intent) => newIntentTypeCheck.add(intent.id))
      setCheckIntentType(newIntentTypeCheck)
      setStaffInfoEdit(staffInfo)
  
      reset({
        name: staffInfo.name,
        email: staffInfo.email,
        phone: staffInfo.phone
      })
  
      setIsOpenEdit((prevState) => !prevState)
    }
   const handleCheckedIntentType = (intentType: IntentType) => {
      const checkedIntentTypeSet = new Set(checkedIntentType)
      if (checkedIntentType.has(intentType.id)) {
            checkedIntentTypeSet.delete(intentType.id)
            setCheckIntentType(checkedIntentTypeSet)
            return
      }
      checkedIntentTypeSet.add(intentType.id)
      setCheckIntentType(checkedIntentTypeSet)
    }

   const handleOpenAlert = (staffId: string) => {
      setStaffId(staffId)
      setIsAlertOpen((prev) => !prev)
  }
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {data.avatarUrl ? (
            <Image source={{ uri: data.avatarUrl }} style={styles.image} />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.id}>ID: {data.id}</Text>
        </View>

        {/* <View style={styles.roleTag}>
          <Text style={styles.roleText}>{}</Text>
        </View> */}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Mail size={16} />
          <Text style={styles.infoText}>{data.email}</Text>
        </View>

        <View style={styles.row}>
          <Shield size={16} />
          <Text style={styles.infoText}>
            {data.staffIntentTypes.map((intent => intent.intentTypeName)).join(', ') || 'Chưa có vai trò'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          content="Sửa"
          variant="outline"
          icon={{ iconName: Pencil, iconDirection: 'left' }}
          style={styles.actionBtn}
          onPress={() => handleOpenEdit(data)}
        />

        <Button
          content="Xóa"
          variant="danger"
          icon={{ iconName: Trash2, iconDirection: 'left' }}
          style={styles.actionBtn}
          onPress={() => handleOpenAlert(data.id)}
        />
      </View>

        <ModalCustom isOpen={isOpenEdit} onClose={() => setIsOpenEdit(false)}>
            <Text style={styles.titleModal}>Cập nhật thông tin nhân viên</Text>
                  <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Tên nhân viên"
                              label="Tên nhân viên"
                              error={errors.name?.message}
                        />
                        )}
                  />

                  <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Email"
                              label="Email"
                              error={errors.email?.message}
                              keyboardType="email-address"
                        />
                        )}
                  />

                  <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Số điện thoại"
                              label="Số điện thoại"
                              error={errors.phone?.message}
                              keyboardType="phone-pad"
                        />
                        )}
                  />
            <Card style={{ marginVertical: 10 }}>
              { intentType?.map((intent) => (
                <View key={intent.id} style={styles.checkBoxContainer}>
                  <Checkbox checked={checkedIntentType.has(intent.id)} onChange={() => handleCheckedIntentType(intent)}/>
                  <Text>{intent.typeName}</Text>
                </View>
              )) }
            </Card>
            <View style={styles.actions}>
              {loadingUpdate ?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Hủy"
                              variant="outline"
                              style={styles.actionBtn}
                              onPress={() => setIsOpenEdit(false)}
                        />

                        <Button
                              content="Lưu"
                              variant="secondary"
                              icon={{ iconName: Pencil, iconDirection: 'left' }}
                              style={styles.actionBtn}
                              onPress={handleSubmit(onSubmit)}
                        />
                  </>
              }
            </View>
        </ModalCustom>
        <ModalCustom isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
            <Text style={styles.titleModal}>Bạn có chắc chắn muốn xóa nhân viên này</Text>
            <View style={styles.actions}>
              { loadingDelete ?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Hủy"
                              variant="outline"
                              style={styles.actionBtn}
                              onPress={() => setIsAlertOpen(false)}
                        />

                        <Button
                              content="Xóa"
                              variant="danger"
                              icon={{ iconName: Trash2, iconDirection: 'left' }}
                              style={styles.actionBtn}
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
    borderRadius: 16,
    width: '99%',
    marginHorizontal: 'auto'
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#D9E2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  initials: {
    fontWeight: '700',
    fontSize: 16,
    color: '#003366',
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },

  id: {
    fontSize: 12,
    color: '#6B7280',
  },

  roleTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  roleText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 12,
  },

  infoContainer: {
    marginVertical: 8,
    gap: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  infoText: {
    fontSize: 13,
    color: '#374151',
    width: '95%'
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  actionBtn: {
    flex: 1,
  },

  titleModal: {
      fontSize: 16,
      fontWeight:600,
      marginVertical: 10,
      textAlign: 'center'
  },
  checkBoxContainer: {
      flexDirection: 'row',
      gap: 5,
      marginVertical: 3
  }
})