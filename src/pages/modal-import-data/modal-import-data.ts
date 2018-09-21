import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import { FileChooser } from '@ionic-native/file-chooser';

import { getManager} from 'typeorm';
import {Map} from "../../entities/map";
import {CustomForm} from "../../entities/customForm";
import { HomePage } from '../home/home';

declare var Zeep;

@IonicPage()
@Component({
  selector: 'page-modal-import-data',
  templateUrl: 'modal-import-data.html',
})
export class ModalImportDataPage {


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
  }

  selectFileToImport(){
    this.appFilesProvider.resetTmpFileDir().then( r =>
      this.fileChooser.open()
      .then(   uri =>  {
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


  private async loadFormsData(){
    let formsContent = await this.appFilesProvider.readFileAsText(this.appFilesProvider.getTmpFileDir() , "forms.json");
    return JSON.parse(formsContent);
  }

  private async bindMapData(forms, scheme){
      let self = this;
      const manager = getManager();
      let formIdsMap = {};
      for (let f in forms){
        let formEntity = manager.create(CustomForm, forms[f]);
        let newForm = await manager.save(CustomForm, formEntity);
        //self.mapNewSurveyForm(forms[f].id, newForm, scheme);
        formIdsMap[forms[f].id] = newForm;
      }
      this.bindSchemeForms(formIdsMap, scheme);
      let mapEntity = manager.create(Map, scheme);
      manager.save(Map, mapEntity).then(() => {

        self.showImportSuccessAlert("Importación de Mapa", "El Mapa ha sido importado con éxito!");
      })
  }


  private bindSchemeForms(formsIdMap, scheme){
    for (let i in scheme.surveys){
      scheme.surveys[i].form = formsIdMap[scheme.surveys[i].id];
    }
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
    }, async function() {
      let formsData = await self.loadFormsData();
      let schemeData = await self.loadSchemeData();
      self.bindMapData(formsData, schemeData);
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
