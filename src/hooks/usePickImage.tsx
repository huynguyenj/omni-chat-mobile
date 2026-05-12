import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'

export type PickImageType = {
  uri: string
  name: string
  type: string
}

export default function usePickImage() {
  const [image, setImage] = useState<PickImageType | null>(null)

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Toast.show({
        type: 'error',
        text1: 'Không có quyền truy cập',
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (result.canceled) return

    const asset = result.assets[0]

    const imageData: PickImageType = {
      uri: asset.uri,
      name: asset.fileName || `image-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    }

    setImage(imageData)
  }

  return {
    image,
    pickImage,
    setImage
  }
}