import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateCustomFormPage } from './create-custom-form';

@NgModule({
  declarations: [
    CreateCustomFormPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateCustomFormPage),
  ],
})
export class CreateCustomFormPageModule {}
