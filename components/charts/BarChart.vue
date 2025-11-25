<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface DailySlot {
    date: string
    bookedHours: number
    availableHours: number
}

const props = defineProps<{
    data: DailySlot[]
}>()

const chartData = computed(() => ({
    labels: props.data.map(d => d.date),
    datasets: [
        {
            label: 'Terbooking (Jam)',
            backgroundColor: '#3b82f6',
            data: props.data.map(d => d.bookedHours),
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
        },
        {
            label: 'Tersedia (Jam)',
            backgroundColor: '#e5e7eb',
            data: props.data.map(d => d.availableHours),
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            align: 'end' as const,
            labels: { usePointStyle: true, boxWidth: 8 }
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.raw} Jam`
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
        },
        y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6', borderDash: [2, 2] },
            border: { display: false },
            ticks: { stepSize: 5 }
        }
    }
}
</script>

<template>
    <div class="w-full h-full">
        <div class="relative h-64 w-full">
            <Bar :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>