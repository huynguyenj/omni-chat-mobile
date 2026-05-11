import { View, StyleSheet, FlatList } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import { ClaimType } from '../types/claim-type';
import usePagination from '@/hooks/usePagination';
import LoadingCircle from '@/components/ui/loading/LoadingCircle';
import { PaginationStructure } from '@/types/api.response';
import NoDataCard from '@/components/ui/cards/NodataCard';
import ClaimItem from './ClaimItem';
import OverviewCardClaim from './OverviewCardClaim';
import ClaimItemSkeleton from './ui/skeleton/ClaimItemSkeleton';
import OverviewCardClaimSkeleton from './ui/skeleton/OverviewClaimCardSkeleton';

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
  return (
    <View style={styles.container}>
      { loading ?
            <OverviewCardClaimSkeleton/>
            :
            <OverviewCardClaim totalItem={listClaims?.meta.total_items ?? 0}/>
      }
        { loading ? 
            Array.from({ length: 3 }).map((_, i) => (
                  <ClaimItemSkeleton key={i}/>
            ))
            :
            <>
                  { listClaims &&  listClaims.items.length > 0 ?
                  <>
                        <FlatList
                              data={listClaims.items}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => <ClaimItem claim={item}/>}
                              onEndReached={loadMore}
                              onEndReachedThreshold={0.1}
                              refreshing={loading}
                              onRefresh={onRefresh}
                              ListFooterComponent={ loading ? <LoadingCircle size={40}/> : null }
                        />
                  </>
                  :
                  <NoDataCard/>
                  }
            </>
        }
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.75,
            marginTop: 5,
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
            fontWeight: 500,
            marginLeft: 15
      }

})