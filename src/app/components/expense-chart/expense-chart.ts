import { Component, ElementRef, input, viewChild, effect, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartTransaction {
  amount: number;
  type: string;
  date: string;
}

@Component({
  selector: 'app-expense-chart',
  imports: [],
  template: `<canvas #canvas class="w-full h-64"></canvas>`
})
export class ExpenseChart implements AfterViewInit {
  transactions = input<ChartTransaction[]>([]);
  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    effect(() => {
      const data = this.transactions();
      if (this.chart) {
        this.updateChart(data);
      }
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  private groupByDay(data: ChartTransaction[]) {
    const map = new Map<string, number>();
    for (const t of data) {
      const day = t.date.slice(0, 10);
      const value = t.type === 'EXPENSE' ? -t.amount : t.amount;
      map.set(day, (map.get(day) ?? 0) + value);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }

  private createChart() {
    const ctx = this.canvasRef()?.nativeElement.getContext('2d');
    if (!ctx) return;

    const grouped = this.groupByDay(this.transactions());
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: grouped.map(([day]) => day),
        datasets: [{
          label: 'Số dư theo ngày',
          data: grouped.map(([, value]) => value),
          backgroundColor: grouped.map(([, value]) => value < 0 ? '#ef4444' : '#22c55e')
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  private updateChart(data: ChartTransaction[]) {
  if (!this.chart) return;
  const grouped = this.groupByDay(data);
  this.chart.data.labels = grouped.map(([day]) => day);
  this.chart.data.datasets[0].data = grouped.map(([, value]) => value);
  this.chart.data.datasets[0].backgroundColor = grouped.map(([, value]) => value < 0 ? '#ef4444' : '#22c55e');
  this.chart.update();
}
}