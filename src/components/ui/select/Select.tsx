import { View, Text, StyleProp, ViewStyle, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CircleCheckBig } from 'lucide-react-native'

type SelectOptionsType = {
   label: string
   value: string
}

type SelectProps = {
      options: SelectOptionsType[]
      label?: string
      value: string
      onChange: (value: string) => void
      placeHolder?: string
      error?: string
      style?: StyleProp<ViewStyle> 
}


export default function Select({ 
      onChange, 
      options, 
      value, 
      error, 
      label, 
      placeHolder='Choose options',
      style 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectValue = options.find((op) => op.value === value)
  const handleOpen = () => {
      setIsOpen((prevState) => !prevState)
  }
  const handleSelected = (value: string) => {
      onChange(value)
  }
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.trigger, style]}
            onPress={handleOpen}
      >
            <Text style={styles.triggerText}>
                  { selectValue ? selectValue.label : placeHolder }
            </Text>
            { isOpen ? 
                  <ChevronUp size={22} strokeWidth={3} color='#979BA2'/> : 
                  <ChevronDown size={22} strokeWidth={3} color='#979BA2'/>
            }
      </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
     <Modal visible={isOpen} transparent animationType="slide">
            <TouchableOpacity
                  style={styles.overlay}
                  activeOpacity={1}
                  onPress={() => setIsOpen(false)}
            >
            <View style={styles.modalContent}>
                  <FlatList
                        data={options}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => {
                        const isItemSelected = item.value === value
                        return (
                              <TouchableOpacity
                                    style={[styles.option, isItemSelected && styles.optionSelected]}
                                    onPress={() => {
                                          handleSelected(item.value)
                                          setIsOpen(false)
                                    }}
                              >
                                    <Text style={[styles.optionText, isItemSelected && styles.optionTextSelected]}>
                                          {item.label}
                                    </Text>
                              </TouchableOpacity>
                  )
                  }}
                  />
            </View>
            </TouchableOpacity>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
      container: {
            flexDirection: 'column',
            gap: 5,
            position: 'relative'
      },
       label: {
            fontWeight: 700,
            fontSize: 12,
            color: '#6F7379',
      },
      trigger: {
            flexDirection: 'row',
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: '#E0E3E6',
            borderRadius: 10,
            height: 65,
            alignItems: 'center',
            justifyContent: 'space-between'
      },
      triggerText: {
           fontSize: 12,
           color: '#616161',
           fontWeight: 600
      },
      inputText: {
            fontWeight: 600,
            fontSize: 12,
            width: '100%',
            height: '100%',
      },
      errorText: {
            color: '#DC2626', 
            fontSize: 12, 
            marginTop: 4
      },
      optionContainer: {
            position: 'absolute',
            borderRadius: 14,
            zIndex: 999,
            top: 100,
            left: 0,
            right: 0,
            maxHeight: 200,
            backgroundColor: 'white',
            paddingVertical: 12,
            paddingHorizontal: 12,
            elevation: 6,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 2
      },
      option: {
            flexDirection: 'row',
            justifyContent:'space-between',
            marginVertical: 4,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
      },
      optionSelected: {
            backgroundColor:'#3366CC'
      },
      optionText:{
            fontSize: 12
      },
      optionTextSelected: {
            color: '#ffffff'
      },
      overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            padding: 20,
      },

      modalContent: {
            backgroundColor: '#fff',
            borderRadius: 12,
            maxHeight: 300,
            padding: 10,
      },
})