import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { TicketType } from '../types/ticket-type';
import Card from '@/components/ui/cards/Card';
import useGetTicket from '../hooks/useGetTicket';
import NoDataCard from '@/components/ui/cards/NodataCard';
import { formatDate } from '@/utils/format';
import Tag from '@/components/ui/tags/Tag';
import { TICKET_CONVERSATION_STATUS } from '../const/ticket-status';
import TicketMainContentSkeleton from './ui/skeleton/TicketMainContentSkeleton';

type TicketMainContentProps = {
   customerId: string
}

export default function TicketMainContent({ customerId }: TicketMainContentProps) {
  const { listTickets, loading } = useGetTicket({ customerId })
  if (!listTickets) return <NoDataCard title='Chưa có lịch sử hỗ trợ' description='Khách hàng này chưa hỗ trợ qua lần nào cả'/>
  return (
    <View style={styles.container}>
      { loading ?
            <TicketMainContentSkeleton/>
      :
        <View>
             <Card variant='primary'>
                <Text style={styles.cardTitle}>Tổng số lần hỗ trợ</Text>
                <View style={styles.cardMainTextContainer}>
                  <Text style={styles.cardMainText}>{listTickets.length < 10 ? String(listTickets.length).padStart(2, '0') : listTickets.length}</Text>
                  <Text style={styles.cardSubText}>lần đã hỗ trợ</Text>
                </View>                          
            </Card>
            <View style={styles.listContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                  { listTickets.map((ticket) => (
                        <Card key={ticket.id} style={styles.ticketCard}>
                              <Tag style={styles.statusView} variant={TICKET_CONVERSATION_STATUS[ticket.status].tagVariant}>
                                    <Text style={[styles.textStatus, ticket.status === 'Waiting' && { color: '#000000' }]}>{TICKET_CONVERSATION_STATUS[ticket.status].name}</Text>
                              </Tag>
                              <View style={styles.mainTicketContentContainer}>
                                    <Text style={styles.supportText}>Nhân viên hỗ trợ: {ticket.staffName}</Text>
                                    <Text style={styles.timeText}>Ngày hỗ trợ: {ticket.completeDate ? formatDate(ticket.completeDate): 'Chưa được hỗ trợ'}</Text>
                                    <Text style={styles.normalTextContent}>Dạng hỗ trợ: {ticket.keywordType}</Text>
                                    <Text style={styles.normalTextContent}>Nền tảng: {ticket.providerName}</Text>
                              </View>
                        </Card>
                  )) }
              </ScrollView>
            </View>
      </View> 
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
   ticketCard: {
      position: 'relative',
      borderRadius: 10,
      marginVertical: 5
   },
   statusView: {
      position: 'absolute',
      top: 0,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderTopLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
   },
   textStatus: {
      fontSize: 12,
      fontWeight: 600,
      color: '#ffffff'
   },
   mainTicketContentContainer: {
      marginTop: 15
   },
   supportText: {
      fontSize: 15,
      color: '#003366',
      fontWeight: 700
   },
   normalTextContent: {
        fontSize: 12,
      color: '#888C94',
      fontWeight: 500
   },
   timeText: {
      fontSize: 12,
      color: '#888C94',
      fontWeight: 500
   },
})