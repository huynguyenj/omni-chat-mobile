import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { CalendarDays } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import { TaskListType, TaskType } from '../types/task-type'
import { formatDate } from '@/utils/format'
import Tag from '@/components/ui/tags/Tag'
import { TASK_STATUS } from '../const/task-status'

export default function TaskHistoryItem({ item }: { item: TaskListType }) {
      return (
            <Card style={styles.cardContainer}>
                  <View style={styles.cardHeader}>
                                          {/* { iconStatus[item.status] } */}
                        <Tag variant={TASK_STATUS[item.status].tagVariant}>
                              <Text style={styles.tagText}>{TASK_STATUS[item.status].name}</Text>
                        </Tag>
                        <View style={styles.contentContainer}>
                                    <Text style={styles.cardTitle}>{item.intentTypeName}</Text>
                                     <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
                                          <CalendarDays size={18} color={'#5A5E65'}/>
                                          <Text style={styles.dateText}>{formatDate(item.completedAt)}</Text>
                                    </View>
                        </View>
                  </View>
                        <Text style={styles.cardContent}>{item.customerName}</Text>
                        <View style={styles.typeTag}>
                              <Text style={styles.typeText}>{item.intentTypeName}</Text>
                        </View>
            </Card>
      )
}

const styles = StyleSheet.create({
     
      cardContainer: {
            gap: 10,
            marginTop: 12,
            overflow: 'hidden',
            backgroundColor: '#F2F4F7'
      },
      cardHeader: {
            flexDirection: 'row',
            gap: 5
      },
      tagText: {
            fontSize: 12,
            fontWeight: 600,
            color: '#ffffff'
      },
      cardTitle: {
            fontSize: 16,
            color: '#003366',
            fontWeight: 700
      },
      dateText: {
            fontSize: 13,
            color: '#5A5E65',
      },
      contentContainer: {
            width: '90%'
      },
      cardContent: {
            fontSize: 14,
            color: '#5A5E65',
            marginTop: 14,
            width: '80%'
      },
      typeTag: {
            position: 'absolute',
            right: -22,
            overflow: 'hidden',
            bottom: -16,
            borderRadius: 200,
            width: 120,
            height: 100,
            alignContent:'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E0E7FF',
            transform: [{ rotate: '-45deg' }]
      },
      typeText: {
            width: '60%',
            textAlign:'center',
            color: '#3366CC',
            fontWeight: 700,
            fontSize: 12
      }
})