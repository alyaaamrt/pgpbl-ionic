import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    if (!this.map) {
      this.initMap();
    }
  }

  ionViewWillEnter() {
    if (this.map) {
      this.reloadPoints();
    }
  }

  initMap() {
    setTimeout(() => {
      this.map = L.map('map').setView([-7.5693495, 110.8287048], 12);

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM', maxZoom: 19 });
      const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: 'CARTO & OSM', subdomains: 'abcd', maxZoom: 19 });

      cartoLight.addTo(this.map);

      L.control.layers({
        'OpenStreetMap': osm,
        'Carto Light': cartoLight
      }).addTo(this.map);

      this.loadPoints();
      this.loadGeoJson(); // <-- PANGGIL FUNGSI GEOJSON DI SINI
    });
  }

  // FUNGSI BARU UNTUK MEMUAT GEOJSON
  loadGeoJson() {
    this.http.get('assets/geo/surakarta.geojson').subscribe((res: any) => {
      const geoJsonLayer = L.geoJSON(res, {
        style: () => ({
          color: '#8b7903',      // Warna garis batas
          weight: 1,
          opacity: 1,
          fillColor: '#8b7903',  // Warna isian
          fillOpacity: 0.1
        }),
        onEachFeature: (feature, layer) => {
          // Cek jika ada properti dan nama kecamatan (NAMOBJ)
          if (feature.properties && feature.properties.NAMOBJ) {
            const popupContent = `<strong>Kecamatan:</strong> ${feature.properties.NAMOBJ}`;
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(this.map);

      // Opsional: jika Anda ingin peta otomatis zoom menyesuaikan batas GeoJSON
      // this.map.fitBounds(geoJsonLayer.getBounds());
    });
  }

  async loadPoints() {
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
  <div style="
    width: 260px;
    background: #ffffff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
    font-family: 'Poppins', sans-serif;
    text-align: center;
  ">

    ${point.photoUrl ? `
      <img src="${point.photoUrl}"
        style="width:100%; height:130px; object-fit:cover; border-top-left-radius:18px; border-top-right-radius:18px;">
    ` : ''}

    <div style="padding: 14px 16px 10px 16px; text-align:center;">

      <span style="
        display: inline-block;
        padding: 4px 14px;
        background: linear-gradient(90deg, #fffb00, #8b7903);
        border-radius: 30px;
        color: #000;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-align:center;
      ">
        ${point.kategori}
      </span>

      <p style="
        margin-top: 10px;
        font-size: 14px;
        color: #4b4b4b;
        line-height: 1.4;
        text-align:center;
      ">
        ${point.keterangan}
      </p>
    </div>

    <div style="
      display:flex;
      justify-content:center;
      gap: 20px;
      border-top: 1px solid #e7e4c8;
      padding: 10px 0;
    ">
 <!-- 🔵 TOMBOL RUTE BARU -->
      <button id="route-btn-${key}" style="
        background:none;
        border:none;
        cursor:pointer;
        font-size: 22px;
        color:#3880ff;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <ion-icon name="navigate-outline"></ion-icon>
      </button>
      <button id="edit-btn-${key}" style="
        background:none;
        border:none;
        cursor:pointer;
        font-size: 22px;
        color:#8b7903;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <ion-icon name="create-outline"></ion-icon>
      </button>



      <button id="delete-btn-${key}" style="
        background:none;
        border:none;
        cursor:pointer;
        font-size: 22px;
        color:#eb445a;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <ion-icon name="trash-outline"></ion-icon>
      </button>

    </div>

  </div>
`;

        marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });

        marker.on('popupopen', () => {
          const deleteBtn = document.getElementById(`delete-btn-${key}`);
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
              this.presentDeleteConfirm(key, point.keterangan);
            });
          }

          const editBtn = document.getElementById(`edit-btn-${key}`);
          if (editBtn) {
            editBtn.addEventListener('click', () => {
              this.goToEditPage(key);
            });
          }

          // 🔵 EVENT UNTUK TOMBOL RUTE → GOOGLE MAPS
          const routeBtn = document.getElementById(`route-btn-${key}`);
          if (routeBtn) {
            routeBtn.addEventListener('click', () => {
              this.openRouteInGoogleMaps(point.coordinates);
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
      message: `Yakin menghapus laporan ini?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', handler: () => { this.deletePoint(pointId); } }
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

  // 🔵 FUNGSI UNTUK MEMBUKA GOOGLE MAPS RUTE
  openRouteInGoogleMaps(coords: string) {
    if (!coords) return;
    const [lat, lng] = coords.split(',').map(Number);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }
}
