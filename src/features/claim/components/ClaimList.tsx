import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag';

interface Claim {
  id: string;
  type: string;
  description: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

const LIST_CLAIM: Claim[] = [
  {
    id: '1',
    type: 'Nghỉ phép',
    description: 'Xin nghỉ phép 2 ngày để đi du lịch',
    reason: 'Đã lên kế hoạch từ trước',
    status: 'approved',
    createdAt: '2025-11-20',
    reviewedAt: '2025-11-21'
  },
  {
    id: '2',
    type: 'Nghỉ ốm',
    description: 'Xin nghỉ ốm 1 ngày',
    reason: 'Bị cảm nặng',
    status: 'pending',
    createdAt: '2025-11-24'
  },
   {
    id: '3',
    type: 'Nghỉ ốm',
    description: 'Xin nghỉ ốm 1 ngày',
    reason: 'Bị cảm nặng',
    status: 'pending',
    createdAt: '2025-11-24'
  },
   {
    id: '4',
    type: 'Nghỉ ốm',
    description: 'Xin nghỉ ốm 1 ngày',
    reason: 'Bị cảm nặng',
    status: 'pending',
    createdAt: '2025-11-24'
  },
   {
    id: '5',
    type: 'Nghỉ ốm',
    description: 'Xin nghỉ ốm 1 ngày',
    reason: 'Bị cảm nặng',
    status: 'pending',
    createdAt: '2025-11-24'
  }
]

const tagColor: Record<Claim['status'], 'default' | 'success' | 'danger'> = {
      pending: 'default',
      approved: 'success',
      rejected: 'default'
}

const Item = ({ claim }:{ claim: Claim }) => {
      return (
            <Card variant='lightGrey' key={claim.id} style={{ marginVertical: 10 }}>
                  <View style={styles.itemHeader}>
                        <View style={styles.itemTitleContainer}>
                              <Text style={styles.itemTitle}>{claim.type}</Text>
                                    <Tag variant={tagColor[claim.status]}>
                                          <Text style={styles.itemTagText}>{claim.status}</Text>
                                    </Tag>
                        </View>
                              <Text style={styles.dateText}>{claim.createdAt}</Text>
                        </View>
                        <Text style={styles.contentTextCard}>Lí do: {claim.reason}</Text>
                        <Text style={styles.contentTextCard}>Mô tả: {claim.description}</Text>
                  </Card>
      )
}

export default function ClaimList() {
  const renderItem = ({ item }: { item: Claim }) => {
      return <Item claim={item}/>
  }
  return (
    <View style={styles.container}>
            <Card>
                  <Text style={styles.cardTitle}>Số lượng đơn</Text>
                  <Text style={styles.cardContent}>{LIST_CLAIM.length}</Text>
            </Card>
            <FlatList
                  data={LIST_CLAIM}
                  renderItem={renderItem}
                  style={styles.scrollListContainer}
            />
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.75,
            marginTop: 10,
      },
      cardTitle: {
            color: '#5A5E65',
            fontSize: 14,
            textTransform:'uppercase'
      },
      cardContent: {
            color: '#003366',
            fontSize: 16,
            fontWeight: 700,
            marginTop: 5
      },
      itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10
      },
      itemTitleContainer: {
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center'
      },
      itemTagText: {
          color: '#ffffff'        
      },
      itemTitle: {
         color: '#003366',
         fontSize: 16,
         fontWeight: 700
      },
      scrollListContainer: {
          marginTop: 18
      },
      dateText: {
            color: '#5A5E65',
            fontSize: 12,
            fontWeight: 600
      },
      contentTextCard: {
            fontSize: 13,
            marginTop: 5,
      }

})