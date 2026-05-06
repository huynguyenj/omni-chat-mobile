import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { ArrowLeft } from 'lucide-react-native'

type HeaderProps = {
  title: string
  subtitle?: string
  rightElement?: React.ReactNode
  showBack?: boolean
}

export default function CustomStackHeader({ title, rightElement, showBack, subtitle }: HeaderProps) {
  const navigation = useNavigation()

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.inner}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={22} color="#003366" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.right}>
          {rightElement ?? <View style={styles.placeholder} />}
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F4F7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dadde2',
  },

  inner: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholder: {
    width: 40,
    height: 40,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },

  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  right: {
    width: 40,
    alignItems: 'flex-end',
  },
})