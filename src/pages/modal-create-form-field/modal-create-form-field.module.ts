import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalCreateFormFieldPage } from './modal-create-form-field';

@NgModule({
  declarations: [
    ModalCreateFormFieldPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalCreateFormFieldPage),
  ],
})
export class ModalCreateFormFieldPageModule {}
