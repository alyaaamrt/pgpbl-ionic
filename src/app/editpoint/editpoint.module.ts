import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditpointPageRoutingModule } from './editpoint-routing.module';

import { EditpointPage } from './editpoint.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditpointPageRoutingModule
  ],
  declarations: [EditpointPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditpointPageModule {}
