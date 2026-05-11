import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag';
import { ClaimType } from '../types/claim-type';
import { CLAIM_STATUS, CLAIM_TYPE, tagClaimColor } from '../const/claim-type';
import { formatDate } from '@/utils/format';

export default function ClaimItem ({ claim }:{ claim: ClaimType }) {
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

const styles = StyleSheet.create({
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
