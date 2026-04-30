import Toast from 'react-native-toast-message'

export function notifyError(message: string) {
  Toast.show({ type: 'error', text1: message })
}

export function notifyInfo(message: string) {
  Toast.show({ type: 'info', text1: message })
}

export function notifySuccess(message: string) {
  Toast.show({ type: 'success', text1: message })
}
