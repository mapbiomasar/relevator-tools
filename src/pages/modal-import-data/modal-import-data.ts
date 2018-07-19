import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import { FileChooser } from '@ionic-native/file-chooser';

import { getManager, getRepository, Repository } from 'typeorm';
import {Map} from "../../entities/map";
import { HomePage } from '../home/home';

declare var Zeep;

@IonicPage()
@Component({
  selector: 'page-modal-import-data',
  templateUrl: 'modal-import-data.html',
})
export class ModalImportDataPage {


  private dataImported:boolean = false;
  private importFileName:string = "";
  private fileToImport:string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public viewCtrl: ViewController,
              private appFilesProvider: AppFilesProvider, 
              private fileChooser: FileChooser,
              public loadingCtrl: LoadingController, 
              private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalImportDataPage');
  }

  selectFileToImport(){
    console.log("import");
    this.appFilesProvider.resetTmpFileDir().then( r =>
      this.fileChooser.open()
      .then(   uri =>  {
              console.log(uri);
              this.fileToImport = uri;
              this.importFileName = this.fileToImport.substr(this.fileToImport.lastIndexOf('/') + 1);
      })
      .catch(e => console.log(e))
    )
  }

  private async loadSchemeData(){
    let schemeContent = await this.appFilesProvider.readFileAsText(this.appFilesProvider.getTmpFileDir() , "scheme.json");
    return JSON.parse(schemeContent);
  }


  private async bindMapData(data){
      console.log("bind!");
      console.log(data);
      let self = this;
      const manager = getManager();
      let mapRepository = getRepository('map') as Repository<Map>;
      let mapEntity = manager.create(Map, data);
      manager.save(Map, mapEntity).then(() => {
        console.log("saved");
        self.showImportSuccessAlert("Importación de Mapa", "El Mapa ha sido importado con éxito!");
      })
  }


  showImportSuccessAlert(title, subtitle) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: [{
        text: 'OK',
        handler: data => {
          this.navCtrl.setRoot(HomePage, {
          });
        }
      }],
    });
    alert.present();
  }


  public unzipData(){
      let self = this;
      var loading = this.loadingCtrl.create({
        content: 'Importando Mapa...'
      });
      loading.present();
      Zeep.unzip({
        from : this.fileToImport,
        to   : this.appFilesProvider.getTmpFileDir() 
    }, function() {
      console.log('unzip success!');
      self.loadSchemeData().then( (schemeData) => {
          self.bindMapData(schemeData);
      })
      loading.dismiss();
  }, function(e) {
      console.log('unzip error: ', e);
      loading.dismiss();
  });
  }

  dismiss() {
    this.viewCtrl.dismiss({
    });
  }



}
