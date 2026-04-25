import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag';
import { ClaimType } from '../types/claim-type';
import { CLAIM_STATUS, CLAIM_TYPE, tagClaimColor } from '../const/claim-type';
import { formatDate } from '@/utils/format';
import usePagination from '@/hooks/usePagination';
import LoadingCircle from '@/components/ui/loading/LoadingCircle';
import { PaginationStructure } from '@/types/api.response';


const Item = ({ claim }:{ claim: ClaimType }) => {
      return (
            <Card variant='lightGrey' key={claim.id} style={{ marginVertical: 10 }}>
                  <View style={styles.itemHeader}>
                        <View style={styles.itemTitleContainer}>
                              <Text style={styles.itemTitle}>{CLAIM_TYPE[claim.claimType]}</Text>
                                    <Tag variant={tagClaimColor[claim.status]}>
                                          <Text style={styles.itemTagText}>{CLAIM_STATUS[claim.status]}</Text>
                                    </Tag>
                        </View>
                              <Text style={styles.dateText}>{formatDate(claim.submitDate)}</Text>
                        </View>
                        <Text style={styles.contentTextCard}>Lí do: {claim.reason}</Text>
                        <Text style={styles.contentTextCard}>Mô tả: {claim.description}</Text>
                  </Card>
      )
}

type ClaimListProps = {
   currentPage: number
   setCurrentPage: Dispatch<SetStateAction<number>>
   loading: boolean
   totalPage: number
   listClaims?: PaginationStructure<ClaimType>
   onRefresh: () => void
}

export default function ClaimList({ currentPage, loading, setCurrentPage, totalPage, listClaims, onRefresh }: ClaimListProps) {
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: totalPage })
  const renderItem = ({ item }: { item: ClaimType }) => {
      return <Item claim={item}/>
  }
  return (
    <View style={styles.container}>
              { listClaims && 
                  <>
                  <Card>
                        <Text style={styles.cardTitle}>Số lượng đơn</Text>
                        <Text style={styles.cardContent}>{listClaims?.items.length ?? 0}</Text>
                  </Card>
                        <FlatList
                              data={listClaims.items}
                              keyExtractor={(item) => item.id}
                              renderItem={renderItem}
                              onEndReached={loadMore}
                              onEndReachedThreshold={0.1}
                              refreshing={loading}
                              onRefresh={onRefresh}
                              ListFooterComponent={ loading ? <LoadingCircle size={40}/> : null }
                        />
                  </>
                                 }
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