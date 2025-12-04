import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ref, push, onValue, remove, get, update } from 'firebase/database';
import { database } from './firebase.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);

  // TODO: Ganti dengan kredensial Cloudinary Anda dari Langkah 1
  private cloudinaryCloudName = 'dkafe3nhm';
  private cloudinaryUploadPreset = 'ionic_unsigned';

  /* =============================
     UPLOAD FOTO KE CLOUDINARY
  ============================= */
  private async uploadToCloudinary(foto: File) {
    const formData = new FormData();
    formData.append('file', foto);
    formData.append('upload_preset', this.cloudinaryUploadPreset);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`;

    try {
      const response: any = await lastValueFrom(
        this.http.post(cloudinaryUrl, formData)
      );
      return response.secure_url; // URL gambar yang aman (https)
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      // Lemparkan error agar bisa ditangkap oleh komponen yang memanggil
      throw new Error('Gagal mengunggah gambar ke Cloudinary.');
    }
  }

  /* =============================
     SAVE POINT (dengan foto via Cloudinary)
  ============================= */
  async savePoint(data: {
    kategori: string;
    keterangan: string;
    coordinates: string;
    foto?: File | null;
  }) {
    let photoUrl: string | null = null;

    // UPLOAD FOTO JIKA ADA
    if (data.foto) {
      photoUrl = await this.uploadToCloudinary(data.foto);
    }

    // DATA FINAL KE DATABASE
    const pointData = {
      kategori: data.kategori,
      keterangan: data.keterangan,
      coordinates: data.coordinates,
      photoUrl,
      createdAt: new Date().toISOString(),
    };

    const pointsRef = ref(database, 'points');
    return push(pointsRef, pointData);
  }

  /* =============================
     GET ALL POINTS
  ============================= */
  getPoints() {
    const pointsRef = ref(database, 'points');
    return new Promise((resolve, reject) => {
      onValue(
        pointsRef,
        (snapshot) => resolve(snapshot.val()),
        (error) => reject(error)
      );
    });
  }

  /* =============================
     DELETE POINT
  ============================= */
  deletePoint(pointId: string) {
    const pointRef = ref(database, `points/${pointId}`);
    return remove(pointRef);
  }

  /* =============================
     UPDATE POINT (dengan foto via Cloudinary)
  ============================= */
  async updatePoint(
    pointId: string,
    data: {
      kategori: string;
      keterangan: string;
      coordinates: string;
      foto?: File | null;
    }
  ) {
    let photoUrl: string | null = null;

    // JIKA ADA FOTO BARU UNTUK DI-UPLOAD
    if (data.foto) {
      photoUrl = await this.uploadToCloudinary(data.foto);
    }

    const updateData: any = {
      kategori: data.kategori,
      keterangan: data.keterangan,
      coordinates: data.coordinates,
    };

    // Hanya perbarui photoUrl jika ada foto baru yang diunggah
    if (photoUrl) {
      updateData.photoUrl = photoUrl;
    }

    const pointRef = ref(database, `points/${pointId}`);
    return update(pointRef, updateData);
  }

  /* =============================
     GET SINGLE POINT
  ============================= */
  getPointById(pointId: string) {
    const pointRef = ref(database, `points/${pointId}`);
    return new Promise((resolve, reject) => {
      get(pointRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            reject('No such point!');
          }
        })
        .catch((error) => reject(error));
    });
  }
}
