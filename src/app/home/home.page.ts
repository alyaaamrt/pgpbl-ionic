import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; // Adjust path as needed

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  totalPoints: number = 0;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getPoints().then((points: any) => {
      if (points) {
        this.totalPoints = Object.keys(points).length;
      } else {
        this.totalPoints = 0;
      }
    }).catch(error => {
      console.error('Error fetching points:', error);
      this.totalPoints = 0; // Set to 0 on error
    });
  }
}
