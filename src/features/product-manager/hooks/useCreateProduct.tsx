import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'
import usePickImage from '@/hooks/usePickImage'

export const createProductSchema = z.object({
  name: z.string({ error: 'Tên không được để trống' }),
  productPackagingType: z.string({ error: 'Loại hộp không được để trống' }),
  productKind: z.string({ error: 'Loại sữa không được để trống' }),
  volumeMl: z.string(),
  description: z.string().optional(),
  brandId: z.string({ error: 'Hãng sữa không được để trống' }),
  price: z.number().min(0),
  lifeSpan: z.number().min(0),
  image: z.object({
    uri: z.string(),
    name: z.string(),
    type: z.string()
  }).optional()
})

type CreateProductForm = z.infer<typeof createProductSchema>

type UseCreateProduct = {
      onRefresh: () => void
}

export default function useCreateProduct({ onRefresh }: UseCreateProduct) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema)
  })

  const { execute, loading } = useApiCall<null>()
  const { image, pickImage, setImage } = usePickImage()

  const onSubmit = async (formData: CreateProductForm) => {
    const form = new FormData()
    form.append('Name', formData.name)
    form.append('ProductPackagingType', formData.productPackagingType)
    form.append('ProductKind', formData.productKind)
    form.append('VolumeMl', String(formData.volumeMl))
    form.append('Description', formData.description || '')
    form.append('BrandId', formData.brandId)
    form.append('Price', String(formData.price))
    form.append('LifeSpan', String(formData.lifeSpan))
    if (image) {
      form.append('Image', {
            uri: image.uri,
            name: image.name,
            type: image.type,
      } as any)
    }

    const res = await execute({
      apiUrl: '/products/create',
      method: 'post',
      type: 'private',
      body: form
    })

    if (res.error) {
      Toast.show({
            type: 'error',
            text1: res.error
      })
      return
    }
    
    Toast.show({
            type: 'success',
            text1: 'Tạo sản phẩm thành công'
    })
    onRefresh()
    reset()
  }

  return {
    handleSubmit,
    control,
    errors,
    loading,
    onSubmit,
    image,
    pickImage
  }
}