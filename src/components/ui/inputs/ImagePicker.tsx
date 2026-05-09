import { View, Text, TouchableOpacityProps, TouchableOpacity, StyleSheet, StyleProp, TextStyle, Image } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { ImageIcon } from 'lucide-react-native'
import { PickImageType } from '@/hooks/usePickImage'

type ImagePickerType = TouchableOpacityProps & PropsWithChildren & {
      label?: string
      error?: string 
      textStyle?: StyleProp<TextStyle>
      previewImage: PickImageType | null
}


export default function ImagePicker({ label, error, style, previewImage, textStyle, ...rest }:ImagePickerType) {
  return (
    <TouchableOpacity style={[styles.imagePicker, style, error && styles.imagePickerError]} {...rest}>
        {previewImage ? (
            <Image
               source={{ uri: previewImage.uri }}
               style={styles.previewImage}
            />
            ) : (
                      <View style={styles.imagePlaceholder}>
                        <ImageIcon size={28} color="#3366CC" />
                        <Text style={styles.imageText}>{label ? label: 'Chọn ảnh sản phẩm'}</Text>
                      </View>
                    )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
imagePickerError: {
   borderColor: 'red'
},
previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

imagePlaceholder: {
    alignItems: 'center',
    gap: 10,
  },

imageText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
})