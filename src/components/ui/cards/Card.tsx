import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren & {
   style?: StyleProp<ViewStyle>
   variant?: 'default' | 'lightGrey'| 'primary' | 'success' | 'warning' 
}

export default function Card({ children, style, variant='default' }: CardProps) {
  return (
    <View style={[ styles.container, variants[variant], style ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
   container: {
      paddingVertical: 20,
      paddingHorizontal: 18,
      borderRadius: 12,
      width: '99%'
   },
   default: {
      backgroundColor: '#ffffff',
      elevation: 8,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 2
      
   },
   lightGrey: {
      backgroundColor: '#F2F4F7'
   },
   primary: {
      backgroundColor: '#003366'
   },
   success: {
      backgroundColor: '#2ECC71'
   },
   warning: {
      backgroundColor: '#FF9800'
   }
})

const variants = {
   default: styles.default,
   lightGrey: styles.lightGrey,
   primary: styles.primary,
   success: styles.success,
   warning: styles.warning
}