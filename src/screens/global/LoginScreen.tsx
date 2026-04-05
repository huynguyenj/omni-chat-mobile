import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import Input from '@components/ui/inputs/Input'
import { LockKeyhole, MoveRight, UserRound } from 'lucide-react-native'
import Button from '@components/ui/buttons/Button'
import useLogin from '@/features/auth/hooks/useLogin'
import { Controller } from 'react-hook-form'

export default function LoginScreen() {
  const { errors, handleSubmit, loading, onSubmit, control } = useLogin()
  return (
    <View style={styles.container}>
      <Image 
        source={require('@assets/logo.jpg')} 
        style= {styles.image}
        />
      <View style={styles.headerSection}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Đăng nhập vào không gian làm việc của bạn
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='username'
          render={({ field: { onChange, onBlur, value }}) => (
            <Input
              label='Username'
              icon={{ iconName: UserRound, iconDirection: 'left' }} 
              placeholder='Nhập username của bạn'
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.username?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value }}) => (
            <Input
              label='Password'
              icon={{ iconName: LockKeyhole, iconDirection: 'left' }} 
              secureTextEntry={true} 
              placeholder='Nhập mật khẩu của bạn'
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}  
            />
          )}
        />
       
      </View>
      <Button 
        icon={{ iconName: MoveRight, iconDirection: 'right' }}
        content='Đăng nhập' 
        variant='primary'
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingTop: 60,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginBottom: 20
  },
  headerSection: {
    width: '90%',
    marginVertical: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 500,
    color: '#676B71',
    lineHeight: 20
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 20,
    marginTop: 15,
    marginBottom: 25
  }
})