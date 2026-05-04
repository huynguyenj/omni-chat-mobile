 export const getColorByWeight = (weight: number) => {
    if (weight <= 4) {
      return {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: '#DC2626',
        label: 'THẤP'
      }
    }
    if (weight <= 7) {
      return {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#F59E0B',
        label: 'TRUNG BÌNH'
      }
    }
    return {
      bg: '#D1FAE5',
      text: '#065F46',
      border: '#10B981',
      label: 'CAO'
    }
  }