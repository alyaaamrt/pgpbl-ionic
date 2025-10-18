import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController, IonicModule } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditpointPage implements OnInit {
  map!: L.Map;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  pointId = '';
  name = '';
  coordinates = '';

  constructor() { }

  ngOnInit() {
    this.pointId = this.route.snapshot.paramMap.get('id') as string;
    if (this.pointId) {
      this.dataService.getPointById(this.pointId).then((point: any) => {
        this.name = point.name;
        this.coordinates = point.coordinates;
        this.loadMap();
      });
    }
  }

  loadMap() {
    setTimeout(() => {
      const coords = this.coordinates.split(',').map(c => parseFloat(c));
      this.map = L.map('mapedit').setView(coords as L.LatLngExpression, 13);

      var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      osm.addTo(this.map);

      var marker = L.marker(coords as L.LatLngExpression, { draggable: true });
      marker.addTo(this.map);

      marker.on('dragend', (e) => {
        let latlng = e.target.getLatLng();
        let lat = latlng.lat.toFixed(9);
        let lng = latlng.lng.toFixed(9);
        this.coordinates = lat + ',' + lng;
      });
    });
  }

  async update() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.pointId, { name: this.name, coordinates: this.coordinates });
        this.navCtrl.back();
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Update Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}
