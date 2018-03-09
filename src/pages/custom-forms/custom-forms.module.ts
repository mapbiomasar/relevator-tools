import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomFormsPage } from './custom-forms';

@NgModule({
  declarations: [
    CustomFormsPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomFormsPage),
  ],
})
export class CustomFormsPageModule {}
