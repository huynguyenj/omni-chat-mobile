import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import Card from '@/components/ui/cards/Card'

type CounterCardProps = {
   setValue: Dispatch<SetStateAction<number>>
   value: number
   max: number
   min: number
}

export default function CounterCard({ max, min, value, setValue  }: CounterCardProps) {


  const handleIncrease = () => {
    setValue((prev) => Math.min(prev + 1, max))
  }

  const handleDecrease = () => {
    setValue((prev) => Math.max(prev - 1, min))
  }

  const handleQuickAdd = (amount: number) => {
    setValue((prev) => Math.min(prev + amount, max))
  }

  const handleMax = () => {
    setValue(max)
  }

  const handleMin = () => {
    setValue(min)
  }


  
  return (
    <Card style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.circleBtn} onPress={handleDecrease}>
          <Text style={styles.icon}>−</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <View style={styles.underline} />
        </View>

        <TouchableOpacity style={styles.circleBtnPrimary} onPress={handleIncrease}>
          <Text style={styles.iconWhite}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <QuickButton label="Tối thiểu" onPress={handleMin} />
        <QuickButton label={`+${Math.floor(max / 8)}`} onPress={() => handleQuickAdd(Math.floor(max / 8))} />
        <QuickButton label={`+${Math.floor(max / 4)}`} onPress={() => handleQuickAdd(Math.floor(max / 4))} />
        <QuickButton label={`+${Math.floor(max / 2)}`} onPress={() => handleQuickAdd(Math.floor(max / 2))} />
        <QuickButton label="Tối đa" onPress={handleMax} />
      </View>
    </Card>
  )
}

function QuickButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress}>
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  valueContainer: {
    alignItems: 'center',
  },

  value: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0B2545',
  },

  underline: {
    height: 3,
    width: 40,
    backgroundColor: '#0B2545',
    marginTop: 4,
    borderRadius: 2,
  },

  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  circleBtnPrimary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0B2545',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
  },

  iconWhite: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  quickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },

  quickText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
})