import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren & {
   style?: StyleProp<ViewStyle>
   variant?: 'default' | 'lightGrey' 
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
      borderRadius: 12
   },
   default: {
      backgroundColor: '#ffffff',
      elevation: 8,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.05,
      shadowRadius: 6
      
   },
   lightGrey: {
      backgroundColor: '#e6e9ed'
   }
})

const variants = {
   default: styles.default,
   lightGrey: styles.lightGrey
}