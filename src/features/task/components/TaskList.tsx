import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import Input from '@/components/ui/inputs/Input'
import { CalendarDays, CircleCheck, Loader, Search, TriangleAlert } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'

type TypeTaskType = {
      id: string
      name: string
}

const typeList: TypeTaskType[] = [
      { id: 'agagaga', name: 'Tạo đơn' },
      { id: 'ahgerhr', name: 'Hỗ trợ' },
      { id: 'amoomns', name: 'Tra cứu' },

]

type TimeType = {
   value: string
   time: string
}

const timeList: TimeType[] = [
      { time: '7 ngày', value: '7days' },
      { time: '30 ngày', value: '30days' }
]

interface Task {
  id: string;
  conversationId: string;
  customerName: string;
  title: string;
  description: string;
  type: 'lookup' | 'create-order' | 'support' | 'follow-up';
  status: 'completed' | 'pending' | 'warning';
  createdDate: string;
  completedDate?: string;
  duration?: number; // minutes
}
const MOCK_TASKS: Task[] = [
  {
    id: 'T001',
    conversationId: 'C001',
    customerName: 'Nguyễn Văn A',
    title: 'Tra cứu thông tin sản phẩm',
    description: 'Tra cứu thông tin sữa tươi Vinamilk không đường',
    type: 'lookup',
    status: 'completed',
    createdDate: '2026-03-01 10:25',
    completedDate: '2026-03-01 10:28',
    duration: 3
  },
  {
    id: 'T002',
    conversationId: 'C001',
    customerName: 'Nguyễn Văn A',
    title: 'Kiểm tra tồn kho',
    description: 'Kiểm tra tồn kho sữa tươi theo size và màu',
    type: 'lookup',
    status: 'completed',
    createdDate: '2026-03-01 10:30',
    completedDate: '2026-03-01 10:32',
    duration: 2
  },
  {
    id: 'T003',
    conversationId: 'C001',
    customerName: 'Nguyễn Văn A',
    title: 'Tạo đơn hàng',
    description: 'Tạo đơn hàng 5 hộp sữa tươi Vinamilk không đường 1L',
    type: 'create-order',
    status: 'warning',
    createdDate: '2026-03-01 10:35',
    completedDate: '2026-03-01 10:42',
    duration: 7
  },
  {
    id: 'T004',
    conversationId: 'C002',
    customerName: 'Trần Thị B',
    title: 'Hỗ trợ đổi trả hàng',
    description: 'Hướng dẫn chính sách đổi trả sản phẩm sữa',
    type: 'support',
    status: 'completed',
    createdDate: '2026-02-28 14:15',
    completedDate: '2026-02-28 14:25',
    duration: 10
  },
  {
    id: 'T005',
    conversationId: 'C003',
    customerName: 'Lê Văn C',
    title: 'Tra cứu lịch sử đơn hàng',
    description: 'Xem lịch sử mua hàng của khách để tư vấn',
    type: 'lookup',
    status: 'completed',
    createdDate: '2026-02-28 09:40',
    completedDate: '2026-02-28 09:43',
    duration: 3
  },
  {
    id: 'T006',
    conversationId: 'C004',
    customerName: 'Phạm Thị D',
    title: 'Follow-up đơn hàng',
    description: 'Kiểm tra trạng thái giao hàng và thông báo khách',
    type: 'follow-up',
    status: 'completed',
    createdDate: '2026-02-27 16:20',
    completedDate: '2026-02-27 16:28',
    duration: 8
  },
  {
    id: 'T007',
    conversationId: 'C005',
    customerName: 'Hoàng Văn E',
    title: 'Tạo đơn hàng combo',
    description: 'Tạo đơn combo sữa bột cho bé',
    type: 'create-order',
    status: 'completed',
    createdDate: '2026-02-27 11:10',
    completedDate: '2026-02-27 11:20',
    duration: 10
  },
  {
    id: 'T008',
    conversationId: 'C006',
    customerName: 'Vũ Thị F',
    title: 'Tư vấn sản phẩm',
    description: 'Tư vấn loại sữa phù hợp cho người tiểu đường',
    type: 'support',
    status: 'completed',
    createdDate: '2026-02-26 15:30',
    completedDate: '2026-02-26 15:45',
    duration: 15
  },
  {
    id: 'T009',
    conversationId: 'C007',
    customerName: 'Đặng Văn G',
    title: 'Kiểm tra khuyến mãi',
    description: 'Tra cứu các chương trình khuyến mãi hiện hành',
    type: 'lookup',
    status: 'completed',
    createdDate: '2026-02-25 10:05',
    completedDate: '2026-02-25 10:08',
    duration: 3
  },
  {
    id: 'T010',
    conversationId: 'C008',
    customerName: 'Bùi Thị H',
    title: 'Tạo đơn hàng',
    description: 'Đơn hàng sữa chua uống TH True Milk',
    type: 'create-order',
    status: 'completed',
    createdDate: '2026-02-24 14:50',
    completedDate: '2026-02-24 15:00',
    duration: 10
  }
]

const iconStatus = {
      completed: <CircleCheck size={28} color={'#065C44'} strokeWidth={2}/>,
      warning: <TriangleAlert size={28} color={'#92400E'} strokeWidth={2} />,
      pending: <Loader  size={28} color={'#3366CC'} strokeWidth={2}/>
}

const translateWord = {
      'create-order': 'Tạo đơn',
      'lookup': 'Tra cứu',
      'support': 'Hỗ trợ',
      'follow-up': 'Theo dõi'
}

export default function TaskList() {
  const [typeSelected, setTypeSelected] = useState('')
  const [timeSelected, setTimeSelected] = useState('')

  const handelTypeSelected = (value: string) => {
      setTypeSelected(value)
  }
  const handelTimeSelected = (value: string) => {
      setTimeSelected(value)
  }
  return (
    <View style={styles.container}>
      <Input
            icon={{
                  iconName: Search,
                  iconDirection: 'left'
            }} 
            placeholder='Tìm kiếm task với tên...' 
            style={{ height: 55 }}
      />
      <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Loại:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {typeList.map((t) => (
                        <TouchableOpacity
                              key={t.id}
                              onPress={() => handelTypeSelected(t.name)}
                              style={[styles.filterBtn, t.name === typeSelected && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, t.name === typeSelected && styles.filterBtnTextSelected]}>{t.name}</Text>
                        </TouchableOpacity>
                  ))}
            </ScrollView>
      </View>
       <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Thời gian:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {timeList.map((t) => (
                        <TouchableOpacity
                              key={t.time}
                              onPress={() => handelTimeSelected(t.value)}
                              style={[styles.filterBtn, t.value === timeSelected && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, t.value === timeSelected && styles.filterBtnTextSelected]}>{t.time}</Text>
                        </TouchableOpacity>
                  ))}
            </ScrollView>
      </View>
      <FlatList
            data={MOCK_TASKS}
            renderItem={({ item }: { item: Task }) => {
                  return (
                        <Card style={styles.cardContainer}>
                              <View style={styles.cardHeader}>
                                    { iconStatus[item.status] }
                                    <View style={styles.contentContainer}>
                                                <Text style={styles.cardTitle}>{item.title}</Text>
                                                <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
                                                      <CalendarDays size={18} color={'#5A5E65'}/>
                                                      <Text style={styles.dateText}>{item.createdDate}</Text>
                                                </View>
                                    </View>
                              </View>
                                    <Text style={styles.cardContent}>{item.description}</Text>
                                    <View style={styles.typeTag}>
                                          <Text style={styles.typeText}>{translateWord[item.type]}</Text>
                                    </View>
                        </Card>
                  )
            }}
      />
    </View>
  )
}
const styles = StyleSheet.create({
      container: {
            flex: 0.85,
            marginTop: 14
      },
      filterContainer: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            marginVertical: 10
      },
      filterTitle: {
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: 12
      },
      filterBtn: {
            marginHorizontal: 5,
            backgroundColor: '#E6E8EB',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16
      },
      filterBtnSelected: {
            backgroundColor: '#183352'
      },
      filterBtnText: {
            fontWeight: 600,
            fontSize: 13
      },
      filterBtnTextSelected: {
            color: '#ffffff'
      },
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