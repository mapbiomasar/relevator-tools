import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatesurveyPage } from './createsurvey';

@NgModule({
  declarations: [
    CreatesurveyPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatesurveyPage),
  ],
})
export class CreatesurveyPageModule {}
