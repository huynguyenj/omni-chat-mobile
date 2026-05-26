import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'
import ProductItemV2 from './ProductItemV2'
import useGetListBatchByProductId from '../hooks/useGetProductBatch'
import CounterCard from './CounterCard'
import { BatchType } from '../types/batch-type'
import BatchItem from './BatchItem'
import usePagination from '@/hooks/usePagination'
import Button from '@/components/ui/buttons/Button'
import { ArrowDownNarrowWide, ArrowDownWideNarrow, MoveRight } from 'lucide-react-native'
import NoDataCard from '@/components/ui/cards/NodataCard'

export default function OrderStepTwo() {
  const { listBatchChosen, listProductChose, handleAddBatch, handleNextStep, handlePreviousStep } = useContextValid(OrderContext)

  const [productIdChosen, setProductIdChosen] = useState('')
  const [batchChosen, setBatchChosen] = useState<BatchType>()
  const [batchQuantity, setBatchQuantity] = useState(1)
  
  const { currentPage, handleNewestFilter, newFilter, handleRefreshListProductBatch, listBatch, loading, setCurrentPage, setNewFilter } = useGetListBatchByProductId({ productId: productIdChosen })
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: listBatch?.meta.total_pages ?? 1 })
  
  useEffect(() => {
    setBatchQuantity(1)
  }, [batchChosen])

  const checkListBatchChosenValid = ()  => {
    if (listBatchChosen.size === 0) return false
    if (listBatchChosen.size !== listProductChose.length) return false
    return true
  }
  const handleAgreeBatch = () => {
    if (!batchChosen) return
    handleAddBatch(productIdChosen, {...batchChosen, quantity: batchQuantity})
    setBatchChosen(undefined)
  }
  return (
    <View style={styles.container}>
      <View style={[styles.listContainer, !listBatch && { flex: 1 }]}>
        <FlatList
          data={listProductChose}
          renderItem={({ item }) => <ProductItemV2 item={item} setProductId={setProductIdChosen}/>}
        />
      </View>
      { listBatch ?
        <View style={styles.batchContainer}>
          {listBatch.items.length > 0 ?
            <>
              <View style={styles.textBatchContainer}>
                <Text style={styles.textBatch}>Lô hàng</Text>
                <TouchableOpacity style={styles.sortBtn} onPress={handleNewestFilter}>
                  {newFilter ? <ArrowDownWideNarrow size={22}/> : <ArrowDownNarrowWide size={22}/>}
                  <Text>Sắp xếp</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.batchListContainer}>
                <FlatList
                  data={listBatch?.items}
                  renderItem={({ item }) => <BatchItem item={item} productChosenId={productIdChosen} setBatchChosen={setBatchChosen}/>}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.1}
                  refreshing={loading}
                  onRefresh={handleRefreshListProductBatch}
                />
              </View>
              { batchChosen &&
              <View>
                <Text style={styles.textBatch}>Số lượng</Text>
                <CounterCard value={batchQuantity} setValue={setBatchQuantity} max={batchChosen.quantity} min={1}/>
                <Button content='Xác nhận' onPress={handleAgreeBatch}/>
              </View>
              }
            
            </>
            :
            <NoDataCard title='Không có lô' description='Sản phẩm này hiện tại chưa có lô hàng'/>
          }
        </View>
        : 
        <NoDataCard title='Chưa chọn sản phẩm' description='Hãy chọn sản phẩm để hiển thị lô'/>
      }
      <View style={styles.btnContainer}>
        <Button variant='outline' style={styles.btnLeft} content='Quay lại' onPress={handlePreviousStep}/>
        <Button disabled={checkListBatchChosenValid() ? false : true} style={[styles.btnRight, !checkListBatchChosenValid() && styles.unableBtn]} content='Tiếp theo' icon={{ iconName: MoveRight, iconDirection: 'right' }} onPress={handleNextStep}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
      },
      listContainer: {
            paddingVertical: 8,
            flex: 0.4,
      },
      textBatchContainer: {
            flexDirection: 'row',
            alignItems:'center',
            justifyContent:'space-between'
      },
      sortBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
      },    
      textBatch: {
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: 14,
            color: '#585c65',
      },
      batchContainer: {
            flex: 1,
            marginVertical: 15,
            flexDirection: 'column',
            gap: 20
      },
      batchListContainer: {
            flex: 0.8
      },
      btnContainer: {
            flexDirection: 'row',
            gap: 10,
            justifyContent:'center',
            alignItems: 'center',
      },
      btnRight: {
        width: 220,
        height: 60
      },
      btnLeft: {
        width: 140,
        height: 60
      },
      unableBtn: {
            backgroundColor: '#888C94',
      }
})