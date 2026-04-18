import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react-native'

type InputType = TextInputProps & {
      label?: string
      error?: string 
      labelTextColor?: string
      icon?: {
            iconName: LucideIcon
            iconDirection: 'left' | 'right'
      }
}

const Input = forwardRef<TextInput, InputType>(
  ({ label, error, labelTextColor = '#979BA2', icon, style: styleCustom, ...rest }, ref) => {
    return (
      <View style={style.container}>
        {label && <Text style={[style.label, { color: '#6F7379' }]}>{label}</Text>}

        <View style={[style.inputBox, styleCustom]}>
          <View style={style.inputInner}>
            {icon && icon.iconDirection === 'left' && (
              <View style={style.iconLeft}>
                <icon.iconName size={22} strokeWidth={3} color={labelTextColor} />
              </View>
            )}

            <TextInput
              ref={ref} 
              style={style.inputText}
              placeholderTextColor={labelTextColor}
              {...rest}
            />

            {icon && icon.iconDirection === 'right' && (
              <View style={style.iconRight}>
                <icon.iconName size={22} strokeWidth={3} color={labelTextColor} />
              </View>
            )}
          </View>
        </View>

        {error && <Text style={style.errorText}>{error}</Text>}
      </View>
    )
  }
)

export default Input
const style = StyleSheet.create({
      container: {
            flexDirection: 'column',
            gap: 5
      },
      label: {
            fontWeight: 700,
            fontSize: 13
      },
      inputBox: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: '#E0E3E6',
            borderRadius: 10,
            height: 65,
      },
      iconLeft: {
            paddingLeft: 20
      },
       iconRight: {
            paddingLeft: 20
      },
      inputInner: {
            flexDirection: 'row',
            gap: 8,
            height: '100%',
            width: '95%',
            alignItems:'center',
            justifyContent:'center',
      },
      inputText: {
            fontWeight: 600,
            fontSize: 12,
            width: '100%',
            height: '100%',
      },
      errorText: {
            color: '#BA1A1A',
            fontWeight: 600,
            textAlign:'left'
      }
})