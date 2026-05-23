import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { ProductDetailType } from '../types/product-type-manager'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'
import usePickImage from '@/hooks/usePickImage'

const updateProductSchema = z.object({
  name: z.string({ error: 'Tên không được để trống' }),
  description: z.string().optional(),
  price: z.number().min(0)
})


type UpdateProductFormType = z.infer<typeof updateProductSchema>

type UseUpdateProductProps = {
  onRefresh: () => void,
  productId: string
}

export default function useUpdateProduct({ onRefresh, productId }: UseUpdateProductProps) {
  const { control: controlProductInfo, formState: { errors }, handleSubmit: handleSubmitProductInfo, reset: resetProductInfo } = useForm<UpdateProductFormType>({ resolver: zodResolver(updateProductSchema) })
  const { execute, loading } = useApiCall<null>()
  const { image, pickImage, setImage } = usePickImage()
  const onProductInfoSubmit = async (formData: UpdateProductFormType) => {
    if (!productId) return
    const apiData = await execute({
      apiUrl: `/products/update/${productId}`,
      method: 'put',
      type: 'private',
      body: formData
    })
    if (apiData.error) {
      Toast.show({
            type: 'error',
            text1: apiData.error
      })
      return
    }
    Toast.show({
      type: 'success',
      text1: 'Cập nhật thông tin sản phẩm thành công'
    })
    onRefresh()
  }

  const onProductImageSubmit = async () => {
    if (!productId) return
    if (!image) return
    const form = new FormData()
    form.append('Image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any)
    const apiData = await execute({
      apiUrl: `/products/update/${productId}/image`,
      method: 'put',
      type: 'private',
      body: form
    })
    if (apiData.error) {
      Toast.show({
            type: 'error',
            text1: apiData.error
      })
      return
    }
    Toast.show({
      type: 'success',
      text1: 'Cập nhật thông tin sản phẩm thành công'
    })
    onRefresh()
  }

  return {  handleSubmitProductInfo, onProductImageSubmit, onProductInfoSubmit, loading, errors, resetProductInfo, image, pickImage, setImage, controlProductInfo,  productId }
}