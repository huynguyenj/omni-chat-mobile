import { View, Text, TouchableOpacityProps, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { LucideIcon } from 'lucide-react-native'

type ButtonProps = TouchableOpacityProps & {
   content?: string
   icon?: {
      iconName: LucideIcon
      iconDirection: 'left' | 'right' | 'center'
   }
   variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'default'
}


export default function Button({ content, icon, variant='default', style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, variantStyle[variant], style]} 
      {...rest}
      >
       { icon && icon.iconDirection === 'left' && 
            <icon.iconName 
                  size={20} 
                  strokeWidth={2} 
                  color={variant !== 'outline' ? 'white' : 'black'}
            />
      }
      { content && <Text style={[styles.content, variant !== 'outline' && { color: 'white' } ]}>{content}</Text> }
       { icon && icon.iconDirection === 'center' && 
            <icon.iconName 
                  size={20} 
                  strokeWidth={2} 
                  color={variant !== 'outline' ? 'white' : 'black'}
            />
      }
      { icon && icon.iconDirection === 'right' && 
            <icon.iconName 
                  size={20} 
                  strokeWidth={2}
                  color={variant !== 'outline' ? 'white' : 'black'}
            />
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
      container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 10,
            borderRadius: 12,
            width: '100%',
      },
      primary: {
            backgroundColor: '#002E5E',
      },
      secondary: {
            backgroundColor: '#3366CC',
      },
      danger: {
            backgroundColor: '#BA1A1A',
      },
      outline: {
            borderWidth: 1,
            borderColor: '#94979F'
      },
      content: {
            fontSize: 12,
            fontWeight: 600
      }

})

const variantStyle = {
   primary: styles.primary,
   secondary: styles.secondary,
   danger: styles.danger,
   outline: styles.outline,
   default: styles.primary
}
