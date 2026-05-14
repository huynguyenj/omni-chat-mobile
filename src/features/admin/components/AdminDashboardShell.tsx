import type { PropsWithChildren } from 'react'
import { View, StyleSheet } from 'react-native'

export default function AdminDashboardShell({ children }: PropsWithChildren) {
  return <View style={styles.root}>{children}</View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  }
})
