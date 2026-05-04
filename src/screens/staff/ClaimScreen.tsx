import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ClaimHeader from '@/features/claim/components/ClaimHeader'
import ClaimList from '@/features/claim/components/ClaimList'
import ClaimCreate from '@/features/claim/components/ClaimCreate'
import useGetClaimList from '@/features/claim/hooks/useGetClaimList'

export default function ClaimScreen() {
  const { listClaims, loading, setCurrentPage, currentPage, handleRefreshListClaims } = useGetClaimList()
  return (
    <View style={styles.container}>
      <ClaimHeader/>
      <ClaimList
        listClaims={listClaims}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPage={listClaims?.meta.total_pages ?? 1}
        onRefresh={handleRefreshListClaims}
      />
      <ClaimCreate onRefresh={handleRefreshListClaims}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    paddingHorizontal: 20,
    paddingVertical: 10,
  }
})