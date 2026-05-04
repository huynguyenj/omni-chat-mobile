import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CalendarDays } from 'lucide-react-native'
type DateFieldProps = {
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  minimumDate?: Date
  maximumDate?: Date
}


export default function InputDate({ disabled, error, label, maximumDate, minimumDate, onChange, placeholder='dd/mm/yyyy', value }: DateFieldProps) {
  const [show, setShow] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value || new Date())

  const handleOpen = () => {
    if (disabled) return
    setShow(true)
  }

  const handleConfirm = () => {
    setShow(false)
    onChange?.(tempDate)
  }

  const formatDate = (date?: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('vi-VN')
  }
   
  return (
     <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input giả */}
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.8}>
        <View
          style={[
            styles.input,
            error && styles.inputError,
            disabled && styles.disabled
          ]}
        >
          <CalendarDays  color={'#9CA3AF'}/>
          <Text style={value ? styles.text : styles.placeholder}>
            {value ? formatDate(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Picker */}
      {show && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDate(selectedDate)

                // Android auto confirm
                if (Platform.OS === 'android') {
                  setShow(false)
                  onChange?.(selectedDate)
                }
              } else {
                setShow(false)
              }
            }}
          />

          {/* iOS cần nút confirm */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  label: {
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 6
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E0E3E6',
    width: 'auto'
  },

  text: {
    color: '#000'
  },

  placeholder: {
    color: '#9CA3AF'
  },

  inputError: {
    borderColor: '#EF4444'
  },

  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4
  },

  disabled: {
    backgroundColor: '#F3F4F6'
  },

  pickerWrapper: {
    marginTop: 10,
    backgroundColor: '#E0E3E6',
    borderRadius: 10,
    padding: 10,
    elevation: 3
  },

  confirmBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#003366',
    borderRadius: 8
  },

  confirmText: {
    color: '#fff',
    fontWeight: '600'
  }
})