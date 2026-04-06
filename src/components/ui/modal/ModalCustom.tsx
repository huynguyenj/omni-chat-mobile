import { View, StyleProp, ViewStyle, StyleSheet, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native'
import React, { PropsWithChildren } from 'react'

type ModalCustomProps = PropsWithChildren & {
      style?: StyleProp<ViewStyle>
      onClose: () => void
      isOpen: boolean
}

export default function ModalCustom({ children, style, onClose, isOpen }: ModalCustomProps) {
  return (
     <Modal
           animationType="slide"
           visible={isOpen}
           transparent={true}        
           statusBarTranslucent         // backdrop covers status bar on Android
           onRequestClose={onClose}
         >
           {/* Backdrop — tap outside to close */}
           {/* <TouchableWithoutFeedback onPress={onClose}> */}
             <View style={styles.backdrop}>
                 <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                 style={{ width: '100%' }}
             >
                  <View style={styles.modalContainer}>
                    {children}
                  </View>
              </KeyboardAvoidingView>
             </View>
           {/* </TouchableWithoutFeedback> */}
         </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent:'center'
  },
  modalContainer: {
    backgroundColor: '#ffffff',    
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    zIndex: 100,
  },

})