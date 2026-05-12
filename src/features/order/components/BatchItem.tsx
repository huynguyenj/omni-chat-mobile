import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { BatchType } from '../types/batch-type'
import Card from '@/components/ui/cards/Card'
import Checkbox from '@/components/ui/inputs/Checkbox'
import { formatDate } from '@/utils/format'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'
import Button from '@/components/ui/buttons/Button'
import { CircleX } from 'lucide-react-native'

export default function BatchItem({ item, productChosenId, setBatchChosen }: { item: BatchType, productChosenId: string, setBatchChosen: Dispatch<SetStateAction<BatchType | undefined>> }) {
  const [isChecked, setIsChecked] = useState(false)
  const { listBatchChosen, handleRemoveBatch } = useContextValid(OrderContext)
  const checkBatchItemExisted = () => {
     const allListBatchChosen = Array.from(listBatchChosen.values()).flat()
     return allListBatchChosen.find((batch) => batch.id === item.id) ? true : false
  }

  const getCurrentQuantity = () => {
     const allListBatchChosen = Array.from(listBatchChosen.values()).flat()
     return allListBatchChosen.find((batch) => batch.id === item.id)?.quantity ?? 0
  }
  console.log(getCurrentQuantity());
  
  return (
      <TouchableOpacity onPress={() => setBatchChosen(item)}>
            <Card style={[ checkBatchItemExisted() && styles.cardChosen, styles.cardContainer ]}>
                  {/* <Checkbox checked={isChecked} onChange={setIsChecked}/> */}
                  <View>
                        <Text style={styles.mainText}>{item.code}</Text>
                        <View style={styles.subtextContainer}>
                              <Text style={styles.subtext}>HSD: {formatDate(item.expiryDate)}</Text>
                              <Text style={styles.subtext}>Số lượng: {item.quantity}</Text>
                        </View>
                  </View>
                  { checkBatchItemExisted() &&
                  <>
                        <Button variant='danger' icon={{ iconName: CircleX, iconDirection: 'center' }} style={styles.closeBtn} onPress={() => handleRemoveBatch(productChosenId, item.id)}/>
                  </>
                  }
            </Card>
            { checkBatchItemExisted() &&
                        <Text style={styles.totalText}>Số lượng đã chọn: {getCurrentQuantity()}</Text>
            }
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
      cardContainer: {
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center',
            justifyContent: 'space-between'
      },
      cardChosen: {
            borderWidth: 2
      },
      mainText: {
            fontSize: 15,
            color: '#003366',
            fontWeight: 600
      },
      subtextContainer: {
            flexDirection: 'row',
            gap: 10
      },
      subtext: {
            color: '#888C94',
            fontSize: 12
      },
      closeBtn: {
            width: 30,
            aspectRatio: 1,
            borderRadius: 100
      },
      totalText: {
            marginLeft: 10,
            marginVertical: 5,
            fontSize: 12,
            fontWeight: 600
      }
})