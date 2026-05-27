import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native'
import React from 'react'
import useGetAllBrand from '../hooks/useGetAllBrand'
import Select from '@/components/ui/select/Select'
import useGetProductForOrderProcess from '../hooks/useGetProductList'
import ProductItem from './ProductItem'
import Button from '@/components/ui/buttons/Button'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'

export default function OrderStepOne() {
  const { listBrand } = useGetAllBrand()
  const { handleNextStep, listProductChose } = useContextValid(OrderContext)
  const { loading, productKind, productList, productVolume, productPackagingType, setProductBrand, productBrand, setProductKind, setProductPackageType, setProductVolume } = useGetProductForOrderProcess()
  return (
    <View style={styles.container}>
      <View style={styles.selectContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Select
                        value={productBrand}
                        onChange={(value) => setProductBrand(value)}
                        placeHolder='Hãng sữa'
                        label='Tên hãng'
                        style={styles.select}
                        options={[{
                              label: 'Tất cả',
                              value: ''
                        }, ...listBrand.map((brand) => {
                              return {
                                    label: brand.name,
                                    value: brand.id
                              }
                        })]} 
                  />
            <Select
                  value={productPackagingType}
                  onChange={(value) => setProductPackageType(value)}
                  placeHolder='Loại hộp'
                  label='Loại hộp'
                  style={styles.select}
                  options={[
                        {
                              label: 'Tất cả',
                              value: ''
                        },
                        {
                              label: 'Chai',
                              value: 'Bottle'
                        },
                        {
                              label: 'Hộp giấy',
                              value: 'Carton'
                        },
                  ]} 
                  />
            <Select
                  value={productVolume}
                  onChange={(value) => setProductVolume(value)}
                  placeHolder='Dung tích'
                  label='Dung tích'
                  style={styles.select}
                  options={[
                        {
                              label: 'Tất cả',
                              value: ''
                        },
                        {
                              label: '180ml',
                              value: '180'
                        },
                        {
                              label: '490ml',
                              value: '490'
                        },
                        {
                              label: '880ml',
                              value: '880'
                        },
                        {
                              label: '1760ml',
                              value: '1760'
                        }
                  ]} 
            />
            <Select
                  value={productKind}
                  onChange={(value) => setProductKind(value)}
                  placeHolder='Loại'
                  label='Loại'
                  style={styles.select}
                  options={[
                        {
                              label: 'Tất cả',
                              value: ''
                        },
                        {
                              label: 'Sữa chua',
                              value: 'Yogurt'
                        },
                        {
                              label: 'Có đường',
                              value: 'Sugar'
                        },
                        {
                              label: 'Không đường',
                              value: 'NoSugar'
                        },
                  ]} 
            />
            </ScrollView>
      </View>
      <Text style={styles.productText}>Danh sách sản phấm</Text>
      <View style={styles.listContainer}>
           <FlatList
              data={productList}
              renderItem={({ item }) => <ProductItem item={item}/>}
           /> 
      </View>
      <Button disabled={listProductChose.length > 0 ? false : true}  content='Tiếp theo' style={listProductChose.length > 0 ? styles.btn : styles.unableBtn} onPress={handleNextStep}/>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 1
      },
      selectContainer: {
            flexDirection: 'row',
            gap: 10,
            marginVertical: 5,
            minHeight: 100,
            maxHeight: 250,
      },
      select: {
            height: 50,
            width: 182,
            marginRight: 2
      },
      productText: {
            color: '#003366',
            fontWeight: 700,
            fontSize: 14,
            textTransform: 'uppercase',
            marginTop: 20,
            marginBottom: 10  
      },
      listContainer: {
            flex: 0.9,
            marginBottom: 10,
      },
      btn: {
            height: 50
      },
      unableBtn: {
            backgroundColor: '#888C94',
            height: 50
      }
})