import { Injectable } from '@angular/core';
import { ref, push, onValue, remove, get, update } from 'firebase/database';
import { database } from './firebase.service';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Save a new point
  savePoint(point: { name: string, coordinates: string }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  //get all point
  getPoints() {
    const pointsRef = ref(database, 'points');
    return new Promise((resolve, reject) => {
      onValue(pointsRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }

  // Delete a point
  deletePoint(pointId: string) {
    const pointRef = ref(database, `points/${pointId}`);
    return remove(pointRef);
  }

  // Update a point
  updatePoint(pointId: string, data: { name: string, coordinates: string }) {
    const pointRef = ref(database, `points/${pointId}`);
    return update(pointRef, data);
  }

  // Get a single point by ID
  getPointById(pointId: string) {
    const pointRef = ref(database, `points/${pointId}`);
    return new Promise((resolve, reject) => {
      get(pointRef).then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          reject('No such point!');
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }
}



