import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { AlertController, NavController } from '@ionic/angular';


const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  map!: L.Map;
  private dataService = inject(DataService);

  constructor(private alertCtrl: AlertController, private navCtrl: NavController) { }

  ngOnInit() {
    // Map initialization should be done here, but only once.
    if (!this.map) {
      this.initMap();
    }
  }

  ionViewWillEnter() {
    // This will be called every time the page is entered
    if (this.map) {
      this.reloadPoints();
    }
  }

  initMap() {
    setTimeout(() => {
      this.map = L.map('map').setView([-7.7956, 110.3695], 13);

      var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      });

      osm.addTo(this.map);
      this.loadPoints();
    });
  }

  async loadPoints() {
    // Clear existing markers first
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
        const popupContent = `
          <div style="text-align: center;">
            ${point.name}
            <br>
            <ion-button size="small" color="warning" id="edit-btn-${key}">
              <ion-icon name="create-outline"></ion-icon>
            </ion-button>
            <ion-button size="small" color="danger" id="delete-btn-${key}">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </div>
        `;
        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const deleteBtn = document.getElementById(`delete-btn-${key}`);
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
              this.presentDeleteConfirm(key, point.name);
            });
          }
          const editBtn = document.getElementById(`edit-btn-${key}`);
          if (editBtn) {
            editBtn.addEventListener('click', () => {
              this.goToEditPage(key);
            });
          }
        });
      }
    }
  }

  goToEditPage(pointId: string) {
    this.navCtrl.navigateForward(`/editpoint/${pointId}`);
  }

  async presentDeleteConfirm(pointId: string, pointName: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Point',
      message: `Are you sure you want to delete ${pointName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deletePoint(pointId);
          }
        }
      ]
    });
    await alert.present();
  }

  async deletePoint(pointId: string) {
    await this.dataService.deletePoint(pointId);
    this.map.closePopup();
    this.reloadPoints();
  }

  reloadPoints() {
    this.loadPoints();
  }
}
