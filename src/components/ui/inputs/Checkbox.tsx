import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Check } from 'lucide-react-native'

type CheckboxProps = {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  disabled?: boolean
  indeterminate?: boolean
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false
}: CheckboxProps) {

  const handlePress = () => {
    if (disabled) return
    onChange(!checked)
  }

  return (
    <Pressable
      onPress={handlePress}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.box,
          checked && styles.checkedBox,
          disabled && styles.disabled
        ]}
      >
        {checked && !indeterminate && (
          <Check size={16} color="#fff" strokeWidth={3} />
        )}

        {indeterminate && (
          <View style={styles.indeterminate} />
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            disabled && styles.disabledText
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },

  checkedBox: {
    backgroundColor: '#3366CC',
    borderColor: '#3366CC'
  },

  indeterminate: {
    width: 10,
    height: 2,
    backgroundColor: '#fff'
  },

  label: {
    fontSize: 14,
    color: '#111827'
  },

  disabled: {
    opacity: 0.5
  },

  disabledText: {
    color: '#9CA3AF'
  }
})