import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import z from 'zod'

const updateTaskSchema = z.object({
 newIntentTypeId: z.string({ error: 'Không được để trống' })
})

type UpdateTaskInfoForm = z.infer<typeof updateTaskSchema>

type UseUpdateTaskProps = {
  onRefresh: () => void
}


export default function useUpdateTask({ onRefresh }: UseUpdateTaskProps) {
  const { execute, loading } = useApiCall<null>()
  const [taskId, setTaskId] = useState('')
  const { control, reset, handleSubmit, formState: { errors } } = useForm<UpdateTaskInfoForm>({ resolver: zodResolver(updateTaskSchema) })
  const onSubmit = async (formData: UpdateTaskInfoForm) => {
      const apiData = await execute({
            apiUrl: `/support-task/${taskId}/update-intent-type`,
            method: 'patch',
            type: 'private',
            body: formData
      })
      if (apiData.error) {
            Toast.show({
                  type: 'error',
                  text1: apiData.error
            })
            return
      }
      Toast.show({
            type: 'success',
            text1: 'Cập nhật thành công'
      })
      onRefresh()
  }
  return { control, setTaskId, reset, onSubmit, handleSubmit, loading }
}
