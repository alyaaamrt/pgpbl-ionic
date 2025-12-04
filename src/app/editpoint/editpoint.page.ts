import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

/* =============================
   LEAFLET ICON SETUP
============================= */
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

interface Point {
  kategori: string;
  keterangan: string;
  coordinates: string;
  photoUrl?: string;
}

/* =============================
   COMPONENT
============================= */
@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage implements OnInit {

  map!: L.Map;
  private pointId: string | null = null;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  /* =============================
     FORM MODEL
  ============================= */
  kategori = '';
  keterangan = '';
  coordinates = '';

  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor() {}

  /* =============================
     INIT
  ============================= */
  ngOnInit() {
    this.pointId = this.route.snapshot.paramMap.get('id');
    if (this.pointId) {
      this.loadPointData();
    }
  }

  /* =============================
     LOAD DATA
  ============================= */
  async loadPointData() {
    if (!this.pointId) return;

    const point = await this.dataService.getPointById(this.pointId) as Point;
    if (!point) {
      // Handle case where point is not found
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Point data not found.',
        buttons: ['OK'],
      });
      await alert.present();
      this.navCtrl.back();
      return;
    }

    this.kategori = point.kategori;
    this.keterangan = point.keterangan;
    this.coordinates = point.coordinates;
    this.previewImage = point.photoUrl || null;

    this.initMap();
  }

  /* =============================
     INIT MAP
  ============================= */
  initMap() {
    if (this.map) {
      this.map.remove();
    }

    const initialCoords = this.coordinates.split(',').map(Number) as [number, number];

    this.map = L.map('mapedit').setView(initialCoords, 15);

   const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM', maxZoom: 19 });
         const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: 'CARTO & OSM', subdomains: 'abcd', maxZoom: 19 });

         cartoLight.addTo(this.map);


         const baseMaps = {
           "OpenStreetMap": osm,
           "Carto Light": cartoLight
         };

         L.control.layers(baseMaps).addTo(this.map);
  

    const marker = L.marker(initialCoords, {
      draggable: true
    }).addTo(this.map);

    marker.on('dragend', (e: any) => {
      const latlng = e.target.getLatLng();
      this.coordinates = `${latlng.lat.toFixed(9)},${latlng.lng.toFixed(9)}`;
    });
  }

  /* =============================
     FOTO PICKER
  ============================= */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /* =============================
     UPDATE DATA
  ============================= */
  async update() {
    if (!this.pointId || !this.kategori || !this.keterangan || !this.coordinates) {
      const alert = await this.alertCtrl.create({
        header: 'Data belum lengkap',
        message: 'Kategori, keterangan, dan koordinat wajib diisi.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      await this.dataService.updatePoint(this.pointId, {
        kategori: this.kategori,
        keterangan: this.keterangan,
        coordinates: this.coordinates,
        foto: this.selectedFile
      });

      this.navCtrl.back();

    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Update Failed',
        message: error.message || 'Gagal memperbarui data.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
