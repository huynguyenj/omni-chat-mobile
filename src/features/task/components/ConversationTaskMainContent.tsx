import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import useGetConversationTask from '../hooks/useGetConversationTask'
import Card from '@/components/ui/cards/Card'
import NoDataCard from '@/components/ui/cards/NodataCard'
import { TaskType } from '../types/task-type'
import Checkbox from '@/components/ui/inputs/Checkbox'
import { formatDate } from '@/utils/format'
import { TASK_STATUS } from '../const/task-status'
import Tag from '@/components/ui/tags/Tag'
import ConversationTaskSkeleton from './ui/skeleton/ConversationTaskSkeleton'

type ConversationTaskMainContentProps = {
      conversationId: string
}

export default function ConversationTaskMainContent({ conversationId }: ConversationTaskMainContentProps) {
  const { conversationTasks, handleUpdateTask, loading } = useGetConversationTask({ conversationId })
  return (
    <View style={styles.container}>
      { loading ?
            <ConversationTaskSkeleton/>
            :
            <>
                  { conversationTasks ?
                  <View>
                        <Card variant='primary'>
                              <Text style={styles.cardTitle}>Tổng số nhiệm vụ</Text>
                              <View style={styles.cardMainTextContainer}>
                                    <Text style={styles.cardMainText}>{conversationTasks.length < 10 ? String(conversationTasks.length).padStart(2, '0') : conversationTasks.length}</Text>
                                    <Text style={styles.cardSubText}>nhiệm vụ cần hoàn thành</Text>
                              </View>
                        </Card>
                        <View style={styles.listContainer}>
                              <ScrollView>
                              {conversationTasks.map((task) => (
                                    <TouchableOpacity key={task.id} delayLongPress={400} disabled={task.status !== 'InProgress' ? true : false} onLongPress={() => handleUpdateTask(task.id)}>
                                          <Card style={[styles.taskCard, task.status === 'Done' && styles.completedCard]}>
                                          <View style={styles.taskContentContainer}>
                                                <View>
                                                      <Text style={styles.taskContentTitle}>{task.intentTypeName}</Text>
                                                      <Tag variant={TASK_STATUS[task.status].tagVariant} style={styles.tagContainer}>
                                                            <Text style={[styles.tagText, TASK_STATUS[task.status].tagVariant === 'gray' && { color: '#000000' } ]}>{TASK_STATUS[task.status].name}</Text>
                                                      </Tag>
                                                </View>
                                                <Text style={styles.timeText}>{formatDate(task.createdAt)}</Text>
                                          </View>
                                          </Card>
                                    </TouchableOpacity>
                              ))}  
                              </ScrollView>
                        </View>
                  </View>
                  :
                  <NoDataCard title='Không có nhiệm vụ' description='Chưa có nhiệm vụ nào được giao'/>
                  }
            </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
   container: {
      paddingHorizontal: 10,
      marginVertical: 10
   },
   cardTitle: {
      fontSize: 13,
      color: '#4A74AB',
      fontWeight: 600,
   },
   cardMainText: {
      color: '#ffffff',
      fontWeight: 700,
      fontSize: 22
   },
   cardMainTextContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      marginVertical: 5
   },
   cardSubText: {
      fontSize: 11,
      color: '#4A74AB'
   },
   listContainer: {
      maxHeight: 620,
      paddingHorizontal: 5,
      marginTop: 10,
   },
   taskCard: {
      marginVertical: 5,
      flexDirection: 'row',
      gap: 10
   },
   completedCard: {
      borderWidth: 3,
      borderColor: '#2ECC71' 
   },
   taskContentContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: '100%'
   },
   timeText: {
      fontSize: 11,
      color: '#888C94',
      fontWeight: 500
   },
   taskContentTitle: {
      fontSize: 16,
      color: '#003366',
      fontWeight: 700
   },
   tagContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginTop: 5
   },
   tagText: {
      fontWeight: 600,
      color: '#ffffff',
      fontSize: 12,
   }
})