import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  points: any[] = [];
  isLoading: boolean = false;

  constructor(private dataService: DataService, private navController: NavController) {}

  async ionViewWillEnter() {
    this.getPointsData();
  }

  async getPointsData() {
    this.isLoading = true;

    try {
      const data: any = await this.dataService.getPoints();
      if (data) {
        this.points = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      } else {
        this.points = [];
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      this.points = [];
    } finally {
      // 🔥 Loading cepat → berhenti setelah 250 ms
      setTimeout(() => {
        this.isLoading = false;
      }, 250);
    }
  }

  navigateToRoute(route: string) {
    this.navController.navigateForward(route);
  }

  openInGoogleMaps(point: any) {
  if (!point.coordinates) {
    console.error("Koordinat tidak ditemukan");
    return;
  }

  // Format koordinat "lat,lng"
  const [lat, lng] = point.coordinates.split(',').map(Number);

  // URL untuk membuka Google Maps dengan rute
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Buka Google Maps
  window.open(url, '_blank');
}

}
