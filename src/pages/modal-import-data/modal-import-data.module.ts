import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalImportDataPage } from './modal-import-data';

@NgModule({
  declarations: [
    ModalImportDataPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalImportDataPage),
  ],
})
export class ModalImportDataPageModule {}
