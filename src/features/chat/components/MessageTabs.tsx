import { View, Text, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import Button from '@/components/ui/buttons/Button'
import useContextValid from '@/hooks/useContextValid'
import SelectionMessageContext from '../context/ChatProvider'
import { listTabPlatforms } from '../const/platforms'
import useGetTotalConversation from '../hooks/useGetTotalConversation'

export default function MessageTabs() {
  const context = useContextValid(SelectionMessageContext)
  const { totalConversation } = useGetTotalConversation()
  const handleChoosePlatform = (platform: string) => {
      context.handleChooseProviderName(platform)
  }
  const getTotal = (platform: string) => {
    return totalConversation?.find(
      p => p.providerName.toLowerCase() === platform.toLowerCase()
      )?.total ?? 0
  }
      
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollList}>
            {listTabPlatforms.map((platform, index) => (
                  <View key={index} style={{ position: 'relative', marginRight: 2}}>
                  <Button
                        style={styles.btn}
                        variant={context.providerName === platform ? 'primary' : 'outline'}
                        content={platform}
                        onPress={() => handleChoosePlatform(platform)}
                  />

                  {getTotal(platform)!== undefined && getTotal(platform) > 0  && (
                        <View style={styles.notice}>
                              <Text style={styles.noticeText}>
                                    {getTotal(platform)}
                              </Text>
                        </View>
                  )}
                  </View>
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
            paddingVertical: 10,
            paddingHorizontal: 15,
      },
      btn: {
            marginHorizontal: 5,
            paddingHorizontal: 10,
            flex: 1
      },
      notice: {
            position: 'absolute',
            width: 18,
            aspectRatio: 1,
            borderRadius: 100,
            top: -5,
            right: 0,
            backgroundColor: 'red',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
      },
      noticeText: {
            color: 'white',
            fontWeight: 600,
            fontSize: 10
      }
})