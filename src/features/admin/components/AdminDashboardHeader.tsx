import { View, Text, StyleSheet } from 'react-native'

export default function AdminDashboardHeader() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Tổng quan hệ thống OmniChat</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#003366'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#5C6370'
  }
})
