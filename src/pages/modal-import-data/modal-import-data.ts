import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import { FileChooser } from '@ionic-native/file-chooser';

declare var Zeep;

@IonicPage()
@Component({
  selector: 'page-modal-import-data',
  templateUrl: 'modal-import-data.html',
})
export class ModalImportDataPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public viewCtrl: ViewController,
              private appFilesProvider: AppFilesProvider, 
              private fileChooser: FileChooser) {
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
              this.unzipData(uri);
      })
      .catch(e => console.log(e))
    )
  }


  private async loadMapData(){
      let markersContent = await this.appFilesProvider.readFileAsText(this.appFilesProvider.getTmpFileDir() , "markers.json");
      let schemeContent = await this.appFilesProvider.readFileAsText(this.appFilesProvider.getTmpFileDir() , "scheme.json");
      console.log(markersContent);
      console.log(schemeContent);
      let schemeObjects = JSON.parse(schemeContent);
      let markersObjects = JSON.parse(markersContent);
  }



  public unzipData(path){
      let self = this;
      Zeep.unzip({
        from : path,
        to   : this.appFilesProvider.getTmpFileDir() 
    }, function() {
      console.log('unzip success!');
      self.loadMapData();
  }, function(e) {
      console.log('unzip error: ', e);
  });
  }

  dismiss() {
    this.viewCtrl.dismiss({
    });
  }



}
