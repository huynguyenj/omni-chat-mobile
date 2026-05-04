import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react-native'

type PaginationBarProps = {
  totalPage: number
  currentPage: number
  setPage: (page: number) => void
}

export default function PaginationBar({
  currentPage,
  totalPage,
  setPage
}: PaginationBarProps) {

  const pages = Array.from({ length: totalPage }, (_, i) => i + 1)

  const getVisiblePages = () => {
    if (totalPage <= 5) return pages

    if (currentPage > totalPage - 5) {
      return pages.slice(totalPage - 5)
    }

    return pages.slice(currentPage - 1, currentPage + 4)
  }

  const goFirst = () => setPage(1)
  const goLast = () => setPage(totalPage)
  const goNext = () => currentPage < totalPage && setPage(currentPage + 1)
  const goPrev = () => currentPage > 1 && setPage(currentPage - 1)

  return (
    <View style={styles.container}>

      {/* LEFT */}
      <View style={styles.group}>
        <TouchableOpacity
          onPress={goFirst}
          disabled={currentPage === 1}
          style={[styles.btn, currentPage === 1 && styles.disabled]}
        >
          <ChevronsLeft size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goPrev}
          disabled={currentPage === 1}
          style={[styles.btn, currentPage === 1 && styles.disabled]}
        >
          <ChevronLeft size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* PAGE NUMBERS */}
      <View style={styles.pageContainer}>
        {getVisiblePages().map((page) => (
          <TouchableOpacity key={page} onPress={() => setPage(page)}>
            <Text
              style={[
                styles.pageText,
                page === currentPage && styles.activePage
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RIGHT */}
      <View style={styles.group}>
        <TouchableOpacity
          onPress={goNext}
          disabled={currentPage === totalPage}
          style={[styles.btn, currentPage === totalPage && styles.disabled]}
        >
          <ChevronRight size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goLast}
          disabled={currentPage === totalPage}
          style={[styles.btn, currentPage === totalPage && styles.disabled]}
        >
          <ChevronsRight size={20} color="#333" />
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 10
  },

  group: {
    flexDirection: 'row',
    gap: 8
  },

  btn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#eee'
  },

  disabled: {
    opacity: 0.4
  },

  pageContainer: {
    flexDirection: 'row',
    gap: 10
  },

  pageText: {
    fontSize: 14,
    color: '#333'
  },

  activePage: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: '#3366CC'
  }
})