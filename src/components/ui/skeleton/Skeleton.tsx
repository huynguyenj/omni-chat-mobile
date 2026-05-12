import { Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'

type SkeletonProps = {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity
        },
        style
      ]}
    />
  )
}