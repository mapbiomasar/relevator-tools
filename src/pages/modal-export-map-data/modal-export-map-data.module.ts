import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalExportMapDataPage } from './modal-export-map-data';

@NgModule({
  declarations: [
    ModalExportMapDataPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalExportMapDataPage),
  ],
})
export class ModalExportMapDataPageModule {}
