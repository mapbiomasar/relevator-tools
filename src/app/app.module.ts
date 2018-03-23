import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { FilePath } from '@ionic-native/file-path';
import { Diagnostic } from '@ionic-native/diagnostic';

import { RemoveSpacesPipe } from '../components/remove-spaces-pipe.component';

// Plugins
import { IonicStorageModule } from '@ionic/storage';

import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceOrientation} from '@ionic-native/device-orientation';
import { MediaCapture } from '@ionic-native/media-capture';
import { Media } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { Toast } from '@ionic-native/toast';
import { FileChooser } from '@ionic-native/file-chooser';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ConfigPage } from '../pages/config/config';
import { CustomFormsPage } from '../pages/custom-forms/custom-forms';
import { CreateCustomFormPage } from '../pages/create-custom-form/create-custom-form';
import { CreateMapPage } from '../pages/createmap/createmap';
import { ViewMapPage } from '../pages/viewmap/viewmap';
import { DetailMapPage } from '../pages/detailmap/detailmap';
import { MapTabsPage } from '../pages/maptabs/maptabs';
import { CreateMarkerPage } from '../pages/createmarker/createmarker';
import { CreatesurveyPage } from '../pages/createsurvey/createsurvey';
import { DetailsurveyPage } from '../pages/detailsurvey/detailsurvey';
import { ModalselectsurveyPage } from '../pages/modalselectsurvey/modalselectsurvey';
import { ModalSelectLayersPage } from '../pages/modal-select-layers/modal-select-layers';
import { ModalCreateFormFieldPage } from '../pages/modal-create-form-field/modal-create-form-field';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UtilsProvider } from '../providers/utils/utils';
import { AppFilesProvider } from '../providers/appfiles/appfiles';
import { ToastProvider } from '../providers/toast/toast';

import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent }         from '../components/dynamic-form.component';
import { DynamicFormQuestionComponent } from '../components/dynamic-form-question.component';
import { FormsProvider } from '../providers/forms/forms';
import { ConfigProvider } from '../providers/config/config';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ConfigPage,
    CustomFormsPage,
    CreateCustomFormPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage,
    DetailsurveyPage,
    CreatesurveyPage,
    ModalselectsurveyPage,
    ModalSelectLayersPage,
    ModalCreateFormFieldPage,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    RemoveSpacesPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ConfigPage,
    CustomFormsPage,
    CreateCustomFormPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage,
    DetailsurveyPage,
    CreatesurveyPage,
    ModalselectsurveyPage,
    ModalSelectLayersPage,
    ModalCreateFormFieldPage,
    DynamicFormComponent,
    DynamicFormQuestionComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera,
    Geolocation,
    DeviceOrientation,
    MediaCapture,
    Media,
    File,
    Toast,
    UtilsProvider,
    AppFilesProvider,
    ToastProvider,
    FileChooser,
    FormsProvider,
    ConfigProvider,
    Diagnostic,
    FilePath
  ]
})
export class AppModule {}
