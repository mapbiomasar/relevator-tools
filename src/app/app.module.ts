import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// Plugins
import { IonicStorageModule } from '@ionic/storage';

import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceOrientation} from '@ionic-native/device-orientation';
import { MediaCapture } from '@ionic-native/media-capture';
import { Media } from '@ionic-native/media';
import { File } from '@ionic-native/file';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { CreateMapPage } from '../pages/createmap/createmap';
import { ViewMapPage } from '../pages/viewmap/viewmap';
import { DetailMapPage } from '../pages/detailmap/detailmap';
import { MapTabsPage } from '../pages/maptabs/maptabs';
import { CreateMarkerPage } from '../pages/createmarker/createmarker';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage
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
    File
  ]
})
export class AppModule {}
