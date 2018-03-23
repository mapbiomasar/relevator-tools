import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FileChooser } from '@ionic-native/file-chooser';
import { getRepository, getManager, Repository } from 'typeorm';

import { FilePath } from '@ionic-native/file-path';

import { AlertController } from 'ionic-angular';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import {Map} from "../../entities/map";
import {MapLayer} from "../../entities/maplayer";

import LayerVector from 'ol/layer/vector';
import SourceVector  from 'ol/source/vector';
import KML from 'ol/format/kml';

@IonicPage()
@Component({
  selector: 'page-modal-select-layers',
  templateUrl: 'modal-select-layers.html',
})
export class ModalSelectLayersPage {

  private mapEntity:Map;
  private mapUIObject:any;
  private mapLayers:any;
  private layerRep;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private fileChooser: FileChooser, private appFilesProvider: AppFilesProvider, public alertCtrl: AlertController,  private filePath: FilePath) {
    this.layerRep = getRepository('maplayer') as Repository<MapLayer>;
    this.mapUIObject = navParams.get("mapUI");
  	this.mapEntity = navParams.get("mapEntity");
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter(){
  	this.loadMapSavedLayers();
  }


  loadMapSavedLayers(){
    this.mapLayers = []
  }

  importLayer(){
  	this.fileChooser.open()
  .then(uri => this.importLayerFile(uri))
  .catch(e => alert(e));
  }


  importLayerFile(uri){
    var self = this;

    this.filePath.resolveNativePath(uri)
    .then(filePath => {
          console.log("NUEVO FILEPATH " + filePath);
          var currentName = filePath.substr(filePath.lastIndexOf('/') + 1);
          var correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
          var randomName = this.appFilesProvider.createFileRandomName(".kml");
          console.log(currentName);
          console.log(correctPath);
          this.appFilesProvider.copyFileToLocalDir(correctPath, currentName, randomName, this.appFilesProvider.getFileType())
          .then(result => {
            var newMapLayer = new MapLayer();
            newMapLayer.map = self.mapEntity;
            newMapLayer.tipo = "kml";
            newMapLayer.path = result.name;
            newMapLayer.visible = 1;
            self.presentLayerNamePrompt(newMapLayer);
          }, error => {
            console.log(error);
            alert("Error al importar el archivo");
          });
    })
    .catch(err => console.log(err));

    uri = decodeURIComponent(uri);

  }

  getMapLayerUIByName(name){
      var layer = null;
      this.mapUIObject.getLayers().forEach(function(el) {
          if (el.get('name') === name) {
              layer = el;
          }
      })
    return layer;
  }

  layerChangeVisibility(mapLayerEntity){
      var layerUI = this.getMapLayerUIByName(mapLayerEntity.path);
      if (layerUI){
        layerUI.setVisible(mapLayerEntity.visible);
        // guardo estado en la bd
        mapLayerEntity.visible = (mapLayerEntity.visible) ? 1 : 0;
        this.layerRep.save(mapLayerEntity);
      }
  }

  appendMapUILayer(mapLayerEntity){
    var self = this;
    this.appFilesProvider.getFileContent(mapLayerEntity.path, this.appFilesProvider.getFileType()).then( result => {
        var vectorSource = new SourceVector({
              format: new KML(),
              loader: function(extent, resolution, projection) {
                  vectorSource.addFeatures(
                    vectorSource.getFormat().readFeatures(result));
              }
        });
        var vectorKML = new LayerVector({
          source: vectorSource,
          name: mapLayerEntity.path
        });
        self.mapUIObject.addLayer(vectorKML);
    });
  }


  presentLayerNamePrompt(mapLayerObject) {
    var self = this;
    let prompt = this.alertCtrl.create({
      title: 'Importar capa',
      message: "Ingrese un nombre para la nueva capa",
      inputs: [
        {
          name: 'name',
          placeholder: 'Nombre de la capa'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Importar',
          handler: data => {
            mapLayerObject.name = data.name;
            self.layerRep.save(mapLayerObject)
                .then(function(savedLayer) {
                    self.appendMapUILayer(savedLayer);
                    self.mapEntity.layers.push(savedLayer);
                }, function(reason) {
                  console.log(reason);
                })
          }
        }
      ]
    });
    prompt.present();
  }




  dismiss() {
    this.viewCtrl.dismiss({
      mapEntity: this.mapEntity
    });
  }

}
