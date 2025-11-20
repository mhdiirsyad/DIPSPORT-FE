<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { computed } from 'vue'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DemographicData {
  category: string
  count: number
}

const props = defineProps<{
  data: DemographicData[]
}>()

const chartData = computed(() => ({
  labels: ['Akademik', 'Umum'],
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#f97316'],
      borderColor: '#ffffff',
      borderWidth: 2,
      data: [
        props.data.find(d => d.category === 'Academic')?.count || 0,
        props.data.find(d => d.category === 'Public')?.count || 0
      ]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.chart._metasets[context.datasetIndex].total;
          const percentage = Math.round((value / total) * 100) + '%';
          return `${label}: ${value} (${percentage})`;
        }
      }
    }
  }
}
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="relative h-48 w-full">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>