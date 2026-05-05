import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'
import OrderStepOne from './OrderStepOne'
import OrderStepTwo from './OrderStepTwo'
import OrderStepThree from './OrderStepThree'

export default function OrderMainContent({ activeCustomerId }: { activeCustomerId: string }) {
  const { currentStep, handleNextStep, handlePreviousStep } = useContextValid(OrderContext)
  const getCurrentPercentWidth = (currentStep: number) => {
    const totalStep = 3
    return (currentStep - 1) / (totalStep - 1) * 100
  }
  return (
    <View style={styles.container}>
      {/*Header */}
     <View style={styles.headerContainer}>
        <View style={styles.lineWrapper}>
          <View style={styles.progressLine} />
          <View style={[styles.progressSuccessLine, { width: `${getCurrentPercentWidth(currentStep)}%` }]} />
        </View>

        <View style={[styles.stepContainer]}>
          <View style={[styles.numberContainer, currentStep >= 1 && styles.numberContainerChosen]}>
            <Text style={[styles.textNumber, currentStep >= 1 && styles.numberTextChosen]}>1</Text>
          </View>
          <Text style={[styles.text, currentStep === 1 && styles.textChosen ]}>Sản phẩm</Text>
        </View>

        <View style={[styles.stepContainer]}>
          <View style={[styles.numberContainer, currentStep >= 2 && styles.numberContainerChosen]}>
            <Text style={[styles.textNumber, currentStep >= 2 && styles.numberTextChosen]}>2</Text>
          </View>
          <Text style={[styles.text, currentStep === 2 && styles.textChosen]}>Chọn lô</Text>
        </View>

        <View style={[styles.stepContainer]}>
          <View style={[styles.numberContainer, currentStep >= 3 && styles.numberContainerChosen]}>
            <Text style={[styles.textNumber, currentStep >= 3 && styles.numberTextChosen]}>3</Text>
          </View>
          <Text style={[styles.text, currentStep >= 3 && styles.textChosen]}>Xác nhận</Text>
        </View>
      </View>
      {/*Body */}
      <View style={styles.bodyContainer}>
        { currentStep === 1 &&
          <OrderStepOne/>
        }
        { currentStep === 2 &&
          <OrderStepTwo/>
        }
        { currentStep === 3 &&
          <OrderStepThree activeCustomerId={activeCustomerId}/>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 0,
  },

  lineWrapper: {
    position: 'absolute',
    top: 25, 
    left: 40,
    right: 40,
    zIndex: 0
  },

  progressLine: {
    height: 3,
    backgroundColor: '#E5E7EB'
  },

  progressSuccessLine: {
    height: 3,
    backgroundColor: '#003366'
  },

  stepContainer: {
    alignItems: 'center',
    zIndex: 1 
  },

  numberContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E3E6'
  },

  textNumber: {
    color: '#888C94',
    fontWeight: 600,
    fontSize: 14
  },
  text: {
    color: '#888C94',
    fontWeight: 600,
    fontSize: 12
  },
  textChosen: {
    color: '#003366',
    fontWeight: 600,
    fontSize: 14
  },
  numberTextChosen: {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 16
  },
  numberContainerChosen: {
    backgroundColor: '#003366',
    width: 55,
    height: 55,
    borderRadius: 100,
  },
  bodyContainer: {
    marginTop: 10,
    flex: 1
  }
})