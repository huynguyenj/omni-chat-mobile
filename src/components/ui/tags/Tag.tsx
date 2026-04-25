import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'

type TagProps = PropsWithChildren & {
   style?: StyleProp<ViewStyle>
   variant?: 'success' | 'danger' | 'warning' | 'default' | 'gray',
}

export default function Tag({ variant='default', children, style }: TagProps) {
  return (
    <View style={[ styles.container, variants[variant], style ]}>
      {children}
    </View>
  )
}
const styles = StyleSheet.create({
      container: {
            flexDirection: 'row',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
            alignItems:'center',
            justifyContent: 'center'
      },
      success: {
            backgroundColor: '#2ECC71',
      },
      danger: {
            backgroundColor: '#FB2C36'
      },
      warning: {
            backgroundColor: '#FF9800'
      },
      default: {
            backgroundColor: '#3366CC'
      },
      gray: {
            backgroundColor: '#5c5470'
      }
})

const variants = {
      success: styles.success,
      danger: styles.danger,
      warning: styles.warning,
      default: styles.default,
      gray: styles.gray
}