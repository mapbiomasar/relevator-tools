import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { getRepository, getManager, Repository } from 'typeorm';

import { SocialSharing } from '@ionic-native/social-sharing';
import {MediaFileEntity} from "../../entities/mediafileentity";

import { ExportFormatsProvider } from '../../providers/export-formats/export-formats';
import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import {Map} from "../../entities/map";

import tokml from 'tokml';

@IonicPage()
@Component({
  selector: 'page-modal-export-map-data',
  templateUrl: 'modal-export-map-data.html',
})
export class ModalExportMapDataPage {

  mapEntity: Map;
  mediafilesRepository:any;

  private exportOutputFormat:string = null;

  private exportFileName:string = null;
  private fileExported = null; 
  private fileExportedDataType:string;
  private exportDataConfig:any = {};


  private shareSubjectText:string = "MapbiomasApp - Datos";
  private shareBodyText:string = "Este es un archivo generado desde MapbiomasAPP";


  constructor(public navCtrl: NavController, public navParams: NavParams,  public viewCtrl: ViewController, public exportFormats: ExportFormatsProvider,  private appFilesProvider: AppFilesProvider, private socialSharing: SocialSharing) {
      this.mediafilesRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
  		this.mapEntity = navParams.get("mapEntity");
      this.exportDataConfig = {"surveys":{}};
  }

  ionViewDidLoad() {
    
  }

  async exportData(){
      let fileContent = await this.initExportData();
      if (fileContent){
          this.saveMapData(fileContent);
      }
  }

  async initExportData(){
    this.fileExported = null;
    if (this.exportOutputFormat){
      	let geoJSONObject = this.exportFormats.getGeoJSONObjectBase();
      	let jsonObject = await this.populateWithMapMarkers(geoJSONObject);
      	console.log(jsonObject);
        let outFileContent = "";
        switch(this.exportOutputFormat){
          case "geojson":
                outFileContent = JSON.stringify(jsonObject);
                break;
          case "kml":
                outFileContent = tokml(jsonObject); // tokml retorna string
        }
        return outFileContent;
    }
    return null;
  }


  private async populateWithMapMarkers(geoJSONObject){
      let self = this;
      this.mapEntity.surveys.forEach(function(survey){
          console.log(survey);
          if (self.exportDataConfig.surveys[survey.id]){
                survey.markers.forEach(async function(marker){
                     console.log(marker);
                     let feature = await self.getFeatureFromMarker(survey, marker);
                     geoJSONObject.features.push(feature);
                })
          }
      })
      return geoJSONObject;
  }

  private async getFeatureFromMarker(survey, marker){
    if (!marker.mediaFiles){
      marker.mediaFiles = [];
      const manager = getManager();
        let mediaFiles = await  manager.query(`SELECT * FROM mediafile WHERE markerID = ` + marker.id);
        for (let i = 0; i < mediaFiles.length; ++i){
            var tmpMediafile = this.mediafilesRepository.create(mediaFiles[i]);
            marker.mediaFiles.push(tmpMediafile);
        }
    }
    let markerData =  {
           "type": "Feature",
           "geometry": {
               "type": "Point",
               "coordinates": [marker.lat, marker.lng]
           },
           "properties": {
               "survey_id": survey.id,
               "atrributes": marker.attributes,
               "orientation": marker.orientation,
               "media_files": {
                    "images":[],
                    "audio": []
               }
       }
    }
    for (let m in marker.mediaFiles){
      if (marker.mediaFiles[m].tipo == this.appFilesProvider.getImageMediaType()){
            markerData.properties.media_files.images.push(marker.mediaFiles[m]);
      } else { 
            markerData.properties.media_files.audio.push(marker.mediaFiles[m]);
      }
    }
    return markerData;
  }

  removeExportedFile(){
      if (this.fileExported != null){
          this.appFilesProvider.removeFile(this.fileExportedDataType, this.fileExported.name).then( result =>{
            this.fileExported = null;
            this.fileExportedDataType = null;
          });
      }
  }


  private shareViaEmail(){
    this.socialSharing.shareViaEmail(this.shareBodyText, this.shareSubjectText, [''],[''],[''],this.fileExported.nativeURL ).then( () => {

    })
  }

  private shareData(){
      // Check if sharing via email is supported
      /*  this.socialSharing.canShareViaEmail().then(() => {
          console.log("Sharing via email is possible")
        }).catch(() => {
          console.log("Sharing via email is not possible")
        });*/

        // Share via email
        this.socialSharing.share(this.shareBodyText, this.shareSubjectText, this.fileExported.nativeURL).then(() => {
          console.log("success");
        }).catch(() => {
          console.log("Error!");
        });
  }

  private async saveMapData(content){
    console.log(content);
    let fileName = this.exportFileName + this.exportFormats.getFileExtension(this.exportOutputFormat);
    let fileType = this.appFilesProvider.getExportedDataType();
    this.appFilesProvider.writeFile(fileType, fileName, content).then( result => {
        console.log(result);
        this.fileExported = result;
        this.fileExportedDataType = fileType;
    });
  }


  private canInitExport(){
    return this.exportOutputFormat && this.exportFileName;
  }

  dismiss() {
    this.viewCtrl.dismiss({
      mapEntity: this.mapEntity
    });
  }

}
