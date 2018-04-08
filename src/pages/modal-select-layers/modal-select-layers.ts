import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FileChooser } from '@ionic-native/file-chooser';
import { getRepository, getManager, Repository } from 'typeorm';
import { UtilsProvider }  from '../../providers/utils/utils';

import { FilePath } from '@ionic-native/file-path';

import { Diagnostic } from '@ionic-native/diagnostic';

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



  private surveyColors:any;

  private mapConfig:any;
  private localTiles:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private fileChooser: FileChooser, private appFilesProvider: AppFilesProvider, public alertCtrl: AlertController,  private filePath: FilePath, private diagnostic: Diagnostic,  private utilsProvider: UtilsProvider) {
    this.layerRep = getRepository('maplayer') as Repository<MapLayer>;
    this.mapUIObject = navParams.get("mapUI");
  	this.mapEntity = navParams.get("mapEntity");
    this.mapConfig = navParams.get("mapConfig");
    this.localTiles = navParams.get("localTiles");

    this.surveyColors = this.utilsProvider.getSurveyColors();
  }

  ionViewDidLoad() {
      
  }

  ionViewWillEnter(){
  	this.loadMapSavedLayers();
  }


  loadMapSavedLayers(){
    this.mapLayers = []
  }

  // Inicia proceso para importar archivo. Se deben preguntar por los permisos
  initImportLayer(){
      let self = this;
      this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.READ_EXTERNAL_STORAGE).then((status) => {
            console.log(`AuthorizationStatus`);
            console.log(status);
            if (status != this.diagnostic.permissionStatus.GRANTED) {
              this.diagnostic.requestRuntimePermission(this.diagnostic.permission.READ_EXTERNAL_STORAGE).then((data) => {
                console.log(`getREADAuthorizationStatus`);
                console.log(data);
                self.importLayer();
              })
            } else {
                self.importLayer();
            }
          }, (statusError) => {
            console.log(`statusError`);
            console.log(statusError);
          });
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
          console.log(el.get('name'));
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


  getSurveyColorName(i){
    let name = this.surveyColors[i]['name'];
    console.log(name);
    return name;
  }


  getSurveyLayerName(survey){
    return "surveyLayer" + survey.id;
  }



  layerLocalVisibility(event, localLayerName){
      this.updateLayerVisibility(localLayerName, event.checked);
  }



  layerSurveyVisibility(event, survey){
      let surveyLayerName = this.getSurveyLayerName(survey);
      this.updateLayerVisibility(surveyLayerName, event.checked);
      
  }


  updateLayerVisibility(layerName, visible){
      console.log(this.mapConfig);
      let layer = this.getMapLayerUIByName(layerName);
      if (layer){
        layer.setVisible(visible);
      }
  }



  dismiss() {
    this.viewCtrl.dismiss({
      mapEntity: this.mapEntity
    });
  }

}
