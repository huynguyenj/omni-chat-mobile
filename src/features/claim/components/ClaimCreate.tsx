import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import { Plus } from 'lucide-react-native'
import Input from '@/components/ui/inputs/Input'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Select from '@/components/ui/select/Select'

export default function ClaimCreate() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen((prev) => !prev)
  const handleCloseModal = () => setIsModalOpen(false)
  const [selected, setSelected] = useState('')
  return (
    <View style={styles.container}>
      <Button
        style={styles.btn}
        icon={{ iconName: Plus, iconDirection: 'center' }}
        onPress={handleOpenModal}
      />

      <ModalCustom onClose={handleCloseModal} isOpen={isModalOpen}>
            <Text style={styles.modalTitle}>Tạo đơn mới</Text>
            <Text style={styles.modalSubtitle}>
                  Hãy điền đầy đủ thông tin bên dưới
            </Text>
            <View style={styles.inputContainer}>
                  <Select 
                        onChange={setSelected}
                        value={selected}
                        options={[
                              { label: 'Nghỉ phép', value: 'absent' },
                              { label: 'Nghỉ ốm', value: 'sick' },
                              { label: 'Nghỉ việc riêng', value: 'personal' },
                              { label: 'Đổi ca', value: 'shift' },
                        ]}
                        placeHolder='Chọn loại đơn'
                        label='Loại đơn'
                  />
                  <Input label="Mô tả" placeholder="Mô tả chi tiết về yêu cầu của bạn" />
                  <Input label="Lý do" placeholder="Lý do cho yêu cầu này" /> 
          </View>
          <View style={styles.btnContainer}>
            <Button
              content="Hủy"
              variant="outline"
              style={{ width: 100, paddingVertical: 5, height: 50 }}
              onPress={handleCloseModal}
            />
            <Button
              content="Gửi đơn"
              variant="secondary"
              style={{ width: 100, paddingVertical: 5, height: 50 }}
            />
          </View>
      </ModalCustom>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0.05,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 20,
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
  modalSubtitle: {
    color: '#5A5E65',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'column',
    gap: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
})