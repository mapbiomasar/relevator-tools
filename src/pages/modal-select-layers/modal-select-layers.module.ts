import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalSelectLayersPage } from './modal-select-layers';

@NgModule({
  declarations: [
    ModalSelectLayersPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalSelectLayersPage),
  ],
})
export class ModalSelectLayersPageModule {}
