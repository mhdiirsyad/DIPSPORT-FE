<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DailyBookingCount {
    date: string
    count: number
}

const props = defineProps<{
    data: DailyBookingCount[]
}>()

const chartData = computed(() => ({
    labels: props.data.map(d => d.date),
    datasets: [
        {
            label: 'Jumlah Booking',
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                return gradient;
            },
            borderColor: '#3b82f6',
            borderWidth: 2,
            data: props.data.map(d => d.count),
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#2563eb',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#2563eb',
            pointHoverBorderColor: '#fff'
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1e293b',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: (context: any) => `${context.parsed.y} Booking`
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: {
                color: '#f3f4f6',
                drawBorder: false,
            },
            border: { display: false }
        },
        x: {
            grid: { display: false },
            border: { display: false }
        }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
}
</script>

<template>
    <div class="w-full h-full">
        <div class="relative h-64 w-full">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>