import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Button from '@/components/ui/buttons/Button'
import useContextValid from '@/hooks/useContextValid'
import SelectionMessageContext from '../context/ChatProvider'
import { listTabPlatforms } from '../const/platforms'

export default function MessageTabs() {
  const context = useContextValid(SelectionMessageContext)
  const handleChoosePlatform = (platform: string) => {
      context.handleChooseProviderName(platform)
  }
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollList}>
            {listTabPlatforms.map((platform, index) => (
                  <Button 
                        style={styles.btn}
                        variant={context.providerName === platform ? 'primary' : 'outline'} 
                        content={platform} 
                        key={index} 
                        onPress={() => handleChoosePlatform(platform)}
                  />
            ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
      },
      scrollList: {
            paddingVertical: 15,
            paddingHorizontal: 15,
      },
      btn: {
            marginHorizontal: 5,
            paddingHorizontal: 12,
      }
})