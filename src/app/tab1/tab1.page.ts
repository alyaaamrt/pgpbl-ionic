import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  categoryStats: any[] = [];
  isLoading = false;

  @ViewChild('barCanvas', { static: false }) barCanvas!: ElementRef;
  @ViewChild('pieCanvas', { static: false }) pieCanvas!: ElementRef;

  barChart: any;
  pieChart: any;

  constructor(private dataService: DataService) { }

  async ionViewWillEnter() {
    await this.loadStats();
  }

  async loadStats() {
    this.isLoading = true;

    try {
      const data: any = await this.dataService.getPoints();

      if (!data) {
        this.categoryStats = [];
        return;
      }

      const points = Object.keys(data).map(key => ({ id: key, ...data[key] }));

      const statsMap: any = {};
      points.forEach(p => {
        const kategori = p.kategori || "Tidak Ada Kategori";
        statsMap[kategori] = (statsMap[kategori] || 0) + 1;
      });

      this.categoryStats = Object.keys(statsMap).map(k => ({
        category: k,
        count: statsMap[k]
      }));

    } catch (err) {
      console.error("Error loading stats:", err);
      this.categoryStats = [];

    } finally {

      setTimeout(() => {
        this.isLoading = false;

        // Render grafik SETELAH DOM SIAP
        setTimeout(() => this.initCharts(), 200);

      }, 250);
    }
  }



 initCharts() {
  if (!this.categoryStats.length) return;

  const labels = this.categoryStats.map(s => s.category);
  const values = this.categoryStats.map(s => s.count);

  if (this.barChart) this.barChart.destroy();
  if (this.pieChart) this.pieChart.destroy();

  /* =====================================================
       BAR CHART — gaya modern, grid halus, padding bagus
  ====================================================== */
  this.barChart = new Chart(this.barCanvas.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Jumlah Laporan',
        data: values,
        backgroundColor: 'rgba(255, 215, 0, 0.45)', // emas lembut
        borderColor: '#8b7903',
        borderWidth: 2,
        borderRadius: 8,        // rounded bar
        hoverBackgroundColor: 'rgba(255, 215, 0, 0.75)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 10, right: 20, bottom: 0, left: 15 }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: 'Poppins', size: 12 },
            color: '#3b3a2f'
          }
        },
        tooltip: {
          backgroundColor: '#3b3a2f',
          titleFont: { family: 'Poppins', size: 12 },
          bodyFont: { family: 'Poppins', size: 12 },
          cornerRadius: 10,
          padding: 10
        }
      },
      scales: {
        x: {
          ticks: {
            font: { family: 'Poppins', size: 10 },
            color: '#3b3a2f'
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            font: { family: 'Poppins', size: 10 },
            color: '#3b3a2f',
            padding: 8
          },
          grid: {
            color: 'rgba(139, 121, 3, 0.12)', // grid halus
            lineWidth: 1
          }
        }
      }
    }
  });

  /* =====================================================
       PIE CHART — warna emas lembut + label rapi
  ====================================================== */
  this.pieChart = new Chart(this.pieCanvas.nativeElement, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          'rgba(255, 215, 0, 0.85)',
          'rgba(230, 185, 30, 0.85)',
          'rgba(190, 160, 40, 0.85)',
          'rgba(245, 230, 120, 0.85)',
          'rgba(180, 150, 20, 0.85)',
          'rgba(240, 210, 60, 0.85)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'Poppins', size: 12 },
            color: '#3b3a2f',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: '#3b3a2f',
          titleFont: { family: 'Poppins', size: 12 },
          bodyFont: { family: 'Poppins', size: 12 },
          cornerRadius: 10,
          padding: 10
        }
      }
    }
  });
}



}
