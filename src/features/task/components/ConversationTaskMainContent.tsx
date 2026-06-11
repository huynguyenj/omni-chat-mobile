import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import useGetConversationTask from '../hooks/useGetConversationTask'
import Card from '@/components/ui/cards/Card'
import NoDataCard from '@/components/ui/cards/NodataCard'
import { formatDate } from '@/utils/format'
import { TASK_STATUS } from '../const/task-status'
import Tag from '@/components/ui/tags/Tag'
import ConversationTaskSkeleton from './ui/skeleton/ConversationTaskSkeleton'
import Button from '@/components/ui/buttons/Button'
import { Check, Edit, Pencil, Trash } from 'lucide-react-native'
import useUpdateTask from '../hooks/useUpdateTask'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import useGetIntentType from '../hooks/useGetIntentType'
import { Controller } from 'react-hook-form'
import Select from '@/components/ui/select/Select'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import useDeleteTask from '../hooks/useDeleteTask'

type ConversationTaskMainContentProps = {
      conversationId: string
}

export default function ConversationTaskMainContent({ conversationId }: ConversationTaskMainContentProps) {
  const { conversationTasks, handleUpdateTask, loading, handleRefresh } = useGetConversationTask({ conversationId })
  const { control, handleSubmit, loading: updateLoading, onSubmit, reset, setTaskId } = useUpdateTask({ onRefresh: handleRefresh })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { handleDelete, loading: deleteLoading, setTaskId: setTaskDeleteId } = useDeleteTask({ onRefresh: handleRefresh })
  const { intentType } = useGetIntentType()
  const disableButton = (status: string) => {
     if (status === 'InProgress') {
      return false
     }
     if (status === 'Reassign') {
      return false
     }
     return true
  }
  const handleOpenEdit = (taskId: string) => {
   setTaskId(taskId)
   setIsEditOpen(prevState => !prevState)
   reset()
  }
  const handleOpenDelete = (taskId: string) => {
   setTaskDeleteId(taskId)
   setIsDeleteOpen(prevState => !prevState)
  }
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
                                    <View key={task.id}>
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
                                          <View style={styles.btnContainer}>
                                             { task.status === 'InProgress' &&
                                             <Button style={styles.btn} icon={{ iconName: Edit, iconDirection: 'center' }} onPress={() => handleOpenEdit(task.id)}/>
                                             }
                                             { task.status !== 'Done' && 
                                             <Button style={styles.btn} variant='secondary' content='' icon={{ iconName: Check, iconDirection: 'center' }} onPress={() => handleUpdateTask(task.id)}/>
                                          }
                                             <Button style={styles.btn} variant='danger' content='' icon={{ iconName: Trash, iconDirection: 'center' }} onPress={() => handleOpenDelete(task.id)}/>
                                          </View>
                                          </Card>
                                    </View>
                              ))}  
                              </ScrollView>
                        </View>
                  </View>
                  :
                  <NoDataCard title='Không có nhiệm vụ' description='Chưa có nhiệm vụ nào được giao'/>
                  }
            </>
      }
      { isEditOpen && 
         <ModalCustom isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <Text style={styles.modalTitle}>Cập nhật lại thông tin nhiệm vụ</Text>
            <Controller
               name='newIntentTypeId'
               control={control}
               render={({ field }) => (
                  <Select
                     onChange={field.onChange}
                     options={intentType?.map((item) => ({ label: item.typeName, value: item.id })) ?? []}
                     value={field.value ?? ''}
                     placeHolder='Chọn loại chức năng'
                     style={{ height: 50, marginVertical: 10 }}
                  />
               )}
            />
                          <View style={styles.btnContainer}>
                    {updateLoading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Hủy"
                                    variant="outline"
                                    style={styles.btn}
                                    onPress={() => setIsEditOpen(false)}
                              />

                              <Button
                                    content="Lưu"
                                    variant="secondary"
                                    icon={{ iconName: Pencil, iconDirection: 'left' }}
                                    style={styles.btn}
                                    onPress={handleSubmit(onSubmit)}
                              />
                        </>
                    }
                  </View>
         </ModalCustom>
      }
      { isDeleteOpen &&
            <ModalCustom isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
            <Text style={styles.modalTitle}>Bạn có chắc chắn muốn xóa nhiệm vụ</Text>
                          <View style={styles.btnContainer}>
                    {deleteLoading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button
                                    content="Không"
                                    variant="outline"
                                    style={styles.btn}
                                    onPress={() => setIsDeleteOpen(false)}
                              />

                              <Button
                                    content="Có"
                                    variant="danger"
                                    icon={{ iconName: Trash, iconDirection: 'left' }}
                                    style={styles.btn}
                                    onPress={handleDelete}
                              />
                        </>
                    }
                  </View>
         </ModalCustom>
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
   },
   btnContainer: {
      flexDirection: 'row',
      gap: 5,
      marginVertical: 10
   },
   btn: {
      flex: 1
   },
   modalTitle: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
    textAlign: 'center',
  },
})