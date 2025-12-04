import { Component, OnInit, inject } from '@angular/core';
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

/* =============================
   COMPONENT
============================= */
@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {

  map!: L.Map;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  /* =============================
     FORM MODEL
  ============================= */
  kategori = '';
  keterangan = '';
  coordinates = '';

  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor() { }

  /* =============================
     INIT MAP
  ============================= */
  ngOnInit() {

    setTimeout(() => {

      this.map = L.map('mapcreate').setView([-7.5693495, 110.8287048], 13);

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM', maxZoom: 19 });
      const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: 'CARTO & OSM', subdomains: 'abcd', maxZoom: 19 });

      cartoLight.addTo(this.map);


      const baseMaps = {
        "OpenStreetMap": osm,
        "Carto Light": cartoLight
      };

      L.control.layers(baseMaps).addTo(this.map);



      /* =============================
         MARKER
      ============================= */
      const tooltip = 'Drag marker to change coordinates';

      const marker = L.marker([-7.5693495, 110.8287048], {
        draggable: true
      }).addTo(this.map);

      marker.bindPopup(tooltip);
      marker.openPopup();

      // set awal koordinat
      this.coordinates = ' ';

      marker.on('dragend', (e: any) => {
        const latlng = e.target.getLatLng();
        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);
        this.coordinates = `${lat},${lng}`;
      });

    }, 500);

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
    SAVE DATA
 ============================= */
  async save() {

    if (!this.kategori || !this.keterangan || !this.coordinates) {

      const alert = await this.alertCtrl.create({
        header: 'Data belum lengkap',
        message: 'Kategori, keterangan, dan koordinat wajib diisi.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    try {

      await this.dataService.savePoint({
        kategori: this.kategori,
        keterangan: this.keterangan,
        coordinates: this.coordinates,
        foto: this.selectedFile
      });

      this.navCtrl.back();

    } catch (error: any) {

      const alert = await this.alertCtrl.create({
        header: 'Save Failed',
        message: error.message || 'Gagal menyimpan data.',
        buttons: ['OK'],
      });

      await alert.present();

    }

  }


}
