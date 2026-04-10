import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import Button from '@/components/ui/buttons/Button'
import { Info } from 'lucide-react-native'

type ChatDetailHeaderProps = {
  customerName: string
  customerImageUrl: string | undefined
}

export default function ChatDetailHeader({ customerImageUrl, customerName }: ChatDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.nameContainer}>
        <Image style={styles.avatarImage} source={customerImageUrl ? { uri: customerImageUrl } : require('@assets/avatar-sample.jpg')}/>
        <Text style={styles.customerText}>{customerName}</Text>
      </View>
      <Button
        style={styles.infoBtn}
        icon={{
          iconDirection: 'right',
          iconName: Info
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 25,
            paddingHorizontal: 12,
      },
      nameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
      },
      avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 100
      },
      customerText: {
        fontSize: 14,
        fontWeight: 600
      },
      infoBtn: {
        width: 40,
        height: 40,
        borderRadius: 100
      }
})