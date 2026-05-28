import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag';
import { ClaimType } from '../types/claim-type';
import { CLAIM_STATUS, CLAIM_TYPE, tagClaimColor } from '../const/claim-type';
import { formatDate } from '@/utils/format';
import useUpdateClaim from '../hooks/useUpdateClaim';
import LoadingCircle from '@/components/ui/loading/LoadingCircle';
import { Controller } from 'react-hook-form';
import Input from '@/components/ui/inputs/Input';
import ModalCustom from '@/components/ui/modal/ModalCustom';
import Button from '@/components/ui/buttons/Button';

export default function ClaimItem ({ claim, onRefresh }:{ claim: ClaimType, onRefresh: () => void }) {
      const { control, errors, handleSubmit, loading,onSubmit, setChosenClaimId, reset } = useUpdateClaim({ onRefresh })
      const [isUpdateOpen, setUpdateOpen] = useState(false)
      const handleOpenUpdate = () => {
            setChosenClaimId(claim.id)
            reset({
                  description: claim.description,
                  reason: claim.reason
            })
            setUpdateOpen(prevState => !prevState)
      }
      return (
            <>
            <TouchableOpacity onPress={handleOpenUpdate}>
                  <Card variant='lightGrey' key={claim.id} style={{ marginVertical: 10 }}>
                        <View style={styles.itemHeader}>
                              <View style={styles.itemTitleContainer}>
                                    <Text style={styles.itemTitle}>{CLAIM_TYPE[claim.claimType]}</Text>
                                          <Tag variant={tagClaimColor[claim.status]}>
                                                <Text style={styles.itemTagText}>{CLAIM_STATUS[claim.status]}</Text>
                                          </Tag>
                              </View>
                                    <Text style={styles.dateText}>{formatDate(claim.submitDate)}</Text>
                              </View>
                              <Text style={styles.contentTextCard}>Lí do: {claim.reason}</Text>
                              <Text style={styles.contentTextCard}>Mô tả: {claim.description}</Text>
                        </Card>
            </TouchableOpacity>
   <ModalCustom onClose={() => setUpdateOpen(false)} isOpen={isUpdateOpen}>
        <Text style={styles.modalTitle}>Cập nhật đơn</Text>
        <Text style={styles.modalSubtitle}>
          Hãy điền đầy đủ thông tin bên dưới
        </Text>

        <View style={styles.inputContainer}>
         
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }}) => (
            <Input
              label="Mô tả"
              placeholder="Mô tả chi tiết về yêu cầu của bạn"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, onBlur, value }}) => (
          <Input
            label="Lý do"
            placeholder="Lý do cho yêu cầu này"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.reason?.message}
          />
        )}
      />   
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
              onPress={() => setUpdateOpen(false)}
            />
            <Button
              content="Lưu"
              variant="secondary"
              style={{ width: 100, paddingVertical: 5, height: 50 }}
              onPress={handleSubmit(onSubmit)} 
            />
            </>
          }
        </View>
      </ModalCustom>
            </>
      )
}

const styles = StyleSheet.create({
      itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10
      },
      itemTitleContainer: {
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center'
      },
      itemTagText: {
          color: '#ffffff'        
      },
      itemTitle: {
         color: '#003366',
         fontSize: 16,
         fontWeight: 700
      },
      scrollListContainer: {
          marginTop: 18
      },
      dateText: {
            color: '#5A5E65',
            fontSize: 12,
            fontWeight: 600
      },
      contentTextCard: {
            fontSize: 13,
            marginTop: 5,
            fontWeight: 500,
            marginLeft: 15
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
