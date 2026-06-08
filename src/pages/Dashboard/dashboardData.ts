// Generate mock data for different years
export const generateYearData = (year: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const baseRevenue = 50000 + (year - 2021) * 15000
    const baseUsers = 500 + (year - 2021) * 200
    const baseOrders = 300 + (year - 2021) * 100

    return months.map((month, index) => {
        const seasonMultiplier = index >= 10 || index <= 1 ? 1.3 : index >= 5 && index <= 7 ? 0.85 : 1
        const randomVariation = () => 0.8 + Math.random() * 0.4

        return {
            month,
            revenue: Math.round(baseRevenue * seasonMultiplier * randomVariation() * (1 + index * 0.02)),
            project: Math.round(baseRevenue * 0.7 * seasonMultiplier * randomVariation() * (1 + index * 0.01)),
            users: Math.round(baseUsers * randomVariation() * (1 + index * 0.05)),
            orders: Math.round(baseOrders * seasonMultiplier * randomVariation() * (1 + index * 0.03)),
        }
    })
}

export const yearlyData: Record<string, ReturnType<typeof generateYearData>> = {
    '2026': generateYearData(2026),
    '2025': generateYearData(2025),
    '2024': generateYearData(2024),
    '2023': generateYearData(2023),
    '2022': generateYearData(2022),
    '2021': generateYearData(2021),
}

export const years = ['2026', '2025', '2024', '2023', '2022', '2021']

export const recentOrdersData = [
    {
        sl: '01',
        itemImage:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&q=80',
        title: 'Americano',
        orderId: '#0245847',
        date: '27 Oct 2025',
        time: '13:00 pm',
        customer: 'Rakib Hossain',
        itemCount: '2 Items',
        amount: '$65',
        status: 'Completed',
    },
    {
        sl: '02',
        itemImage:
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=120&q=80',
        title: 'Americano',
        orderId: '#2478852',
        date: '27 Oct 2025',
        time: '13:00 pm',
        customer: 'Rakib Hossain',
        itemCount: '2 Items',
        amount: '$65',
        status: 'Processing',
    },
    {
        sl: '03',
        itemImage:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&q=80',
        title: 'Americano',
        orderId: '#2478852',
        date: '27 Oct 2025',
        time: '13:00 pm',
        customer: 'Rakib Hossain',
        itemCount: '2 Items',
        amount: '$65',
        status: 'Cancelled',
    },
    {
        sl: '04',
        itemImage:
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=120&q=80',
        title: 'Americano',
        orderId: '#2478852',
        date: '27 Oct 2025',
        time: '13:00 pm',
        customer: 'Rakib Hossain',
        itemCount: '2 Items',
        amount: '$65',
        status: 'Completed',
    },
    {
        sl: '05',
        itemImage:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&q=80',
        title: 'Americano',
        orderId: '#2478852',
        date: '27 Oct 2025',
        time: '13:00 pm',
        customer: 'Rakib Hossain',
        itemCount: '2 Items',
        amount: '$65',
        status: 'Completed',
    },
]

export const rentStatusData = [
    { name: 'Upcoming', value: 45, color: '#3B82F6' },
    { name: 'Running', value: 58, color: '#06B6D4' },
    { name: 'Completed', value: 45, color: '#10B981' },
]
