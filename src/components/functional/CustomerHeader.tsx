import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import Button from '../ui/buttons/Button';
import { LogOut } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/store/auth-store';

const translateRole: Record<string, string> = {
  Staff: 'Nhân viên',
  Admin: 'Quản trị viên',
  Manager: 'Quản lí',
  Shipper: 'Nhân viên giao hàng'
}

export default function CustomerHeader(props: BottomTabHeaderProps) {
  const removeAuth = useAuthStore((s) => s.removeAuthInfo)
  const { role } = useAuthStore()
  const handleLogout = () => {  
    removeAuth()
  }
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <Image style={styles.logoImage} source={require('@assets/logo.jpg')}/>
        <Text style={styles.headerText}>{translateRole[role ?? '']}</Text>
      </View>
      <Button
        style={styles.headerBtn}
        icon={{
          iconName: LogOut,
          iconDirection: 'right'
        }}
        onPress={handleLogout}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 7,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 150 
  },
  headerText: {
    fontSize: 14,
    color: '#003366',
    fontWeight: 700
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 150
  }
});