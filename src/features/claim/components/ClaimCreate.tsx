import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import { Plus } from 'lucide-react-native'
import Input from '@/components/ui/inputs/Input'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Select from '@/components/ui/select/Select'

import useGetAllClaimType from '@/features/claim/hooks/useGetAllClaimType'
import useCreateClaim from '@/features/claim/hooks/useCreateClaim'
import useGetListConversationByStaffId from '../hooks/useGetListConversationByStaffId'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import { CLAIM_TYPE } from '../const/claim-type'
import PaginationBar from '@/components/ui/pagination/PaginationBar'
import { Controller } from 'react-hook-form'

type ClaimCreateProps = {
  onRefresh: () => void
}

export default function ClaimCreate({ onRefresh }: ClaimCreateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChangeTaskSelected, setIsChangeTaskSelected] = useState(false)

  const { claimCategories } = useGetAllClaimType()
  const {
    handleSubmit,
    onSubmit,
    setConversationId,
    conversationId,
    loading,
    control
  } = useCreateClaim({onRefresh})

  const {
    listConversation,
    currentPage, 
    setCurrentPage,
  } = useGetListConversationByStaffId({
    isChangeTaskTypeSelected: isChangeTaskSelected
  })


  const handleOpenModal = () => setIsModalOpen((prev) => !prev)
  const handleCloseModal = () => setIsModalOpen(false)

  console.log(isChangeTaskSelected);
  
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
          <Controller
            control={control}
            name='claimTypeId'
            render={({ field }) => (
              <Select
                onChange={(value) => {
                        field.onChange(value)
                        const selectedCategory = claimCategories?.find((c) => c.id === value)
                        setIsChangeTaskSelected(selectedCategory?.typeName === 'CHANGETASK')
                    }}
                value={field.value}
                options={
                  claimCategories?.map((c) => ({
                    label: CLAIM_TYPE[c.typeName],
                    value: c.id
                  })) || []
                }
                placeHolder="Chọn loại đơn"
                label="Loại đơn"
          />
            )}
          />
         
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Mô tả"
              placeholder="Mô tả chi tiết về yêu cầu của bạn"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <Input
            label="Lý do"
            placeholder="Lý do cho yêu cầu này"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />

         {isChangeTaskSelected && (
              <View>
                <Text style={{ fontWeight: '600', marginBottom: 5 }}>
                  Danh sách cuộc trò chuyện
                </Text>

                {listConversation && listConversation.items.length > 0 ? (
                  <>
                    <View style={{ maxHeight: 150 }}>
                      <ScrollView showsVerticalScrollIndicator>
                        {listConversation.items.map((item) => (
                          <Button
                            key={item.conversationId}
                            content={item.customerName}
                            onPress={() =>
                              setConversationId(item.conversationId)
                            }
                            style={{
                              marginVertical: 4,
                              backgroundColor:
                                conversationId === item.conversationId
                                  ? '#003366'
                                  : '#E5E7EB'
                            }}
                          />
                        ))}
                      </ScrollView>
                    </View>
                      <PaginationBar
                        currentPage={currentPage}
                        setPage={setCurrentPage}
                        totalPage={listConversation.meta.total_pages}
                      />
                  </>
                  ) : (
                    <View>
                      <Text>Không có cuộc trò chuyện nào</Text>
                    </View>
                  )}
              </View>
            )}     
        </View>

        <View style={styles.btnContainer}>
          { loading ?
            <LoadingCircle/>
            :
            <>
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