import { Component} from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';
import { MediafilesProvider } from '../../providers/mediafiles/mediafiles';

// PLUGINS
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Toast } from '@ionic-native/toast';


import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError} from '@ionic-native/media-capture';

import {ViewMapPage} from '../viewmap/viewmap';

import {Marker} from "../../entities/marker";
import {Map} from "../../entities/map";
import {MediaFileEntity} from "../../entities/mediafileentity";

const MEDIA_FILES_KEY = 'mediaFiles';

@Component({
  selector: 'page-createmarker',
  templateUrl: 'createmarker.html'
})
export class CreateMarkerPage {

	category:string;
	point_ubication:string;
	height_overpass:number;
	coverage_percentage:number;
	data_consensus:number;
	orientation:number;
	orientationSubscription:any;
	savedOrientation:boolean;
	markerLocation:any;

	mapViewEntity:Map;
	marker:Marker;

	imageFiles = [];
	audioFiles = [];

	imageDir = "image";
	audioDir = "audio";

	maxImagesNumber:number;
	maxAudiosNumber:number;

	constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, private deviceOrientation: DeviceOrientation, private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media, private toast: Toast, private utils: UtilsProvider, private mediafilesProvider: MediafilesProvider) {

			this.maxImagesNumber = 3; // In the future, load from config, global.
			this.maxAudiosNumber = 1;

			this.markerLocation = navParams.get('location'); 
			this.mapViewEntity = navParams.get('map');

			this.marker = new Marker();
			this.marker.lat = this.markerLocation[0];
			this.marker.lng = this.markerLocation[1];
			this.marker.mediaFiles = [];
			this.populateMediaLists();
			this.startOrientationSubscription();
	}




	// Obtiene los mediaFiles del marker, 
	//y segun sean audios o imagenes los agrega a su lista correspondiente
	populateMediaLists(){

	}

	startOrientationSubscription(){
		this.orientationSubscription = this.deviceOrientation.watchHeading().subscribe(
			  (data: DeviceOrientationCompassHeading) => {
			  		this.orientation = data.magneticHeading;
		  		}
			);
		this.savedOrientation = false;
	}

	stopOrientationSubsctription(){
		this.orientationSubscription.unsubscribe();
		this.savedOrientation = true;
	}

	toogleOrientationSubsctription(){
		if (this.savedOrientation){
			this.startOrientationSubscription();
		} else {
			this.stopOrientationSubsctription();
		}
	}


	ionViewDidLoad() {
	    this.storage.get(MEDIA_FILES_KEY).then(res => {
	      this.audioFiles = JSON.parse(res) || [];
    	})
    }


	takePicture(){
		const options: CameraOptions = {
		  quality: 70,
		  destinationType: this.camera.DestinationType.FILE_URI,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  targetWidth: 300, 
		  targetHeight: 300,
		  saveToPhotoAlbum: false
		}

		this.camera.getPicture(options).then((imageData) => {
			var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
      		var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
      		console.log(currentName);
      		console.log(correctPath);
			this.copyFileToLocalDir(correctPath, currentName, this.mediafilesProvider.createImageFileName(), this.imageDir);
			}, (err) => {
			console.log(err);
		});
	}

	public getPathForMedia(mediaType, filePath){
		return this.mediafilesProvider.getPathForMedia(mediaType, filePath);
	}

	public pathForImage(img) {
	  if (img === null) {
	    return '';
	  } else {
	    return this.file.externalDataDirectory + img;
	  }
	}

	// Copy the image to a local folder
	private copyFileToLocalDir(namePath, currentName, newFileName, mediaType) {
	  this.file.copyFile(namePath, currentName, this.mediafilesProvider.getMediaDir(mediaType), newFileName).then(success => {
	    this.imageFiles.push(newFileName);
	    let newMediaFile = new MediaFileEntity();
	    newMediaFile.tipo = mediaType;
	    newMediaFile.path = newFileName;
	    newMediaFile.marker = this.marker;
	    this.marker.mediaFiles.push(newMediaFile);
	    console.log(this.marker);
	    console.log(this.file.externalDataDirectory);
	  }, error => {
	    console.log(error);
	  });
	}

	deletePicture(index){
		this.imageFiles.splice(index, 1);
	}

	deleteAudio(index){
		this.audioFiles.splice(index, 1);
	}

	captureAudio() {
	    this.mediaCapture.captureAudio().then(audioPath => {
	      console.log(audioPath);

	      this.storeMediaFiles(audioPath);
	    }, (err: CaptureError) => console.error(err));
  	}

  	storeMediaFiles(files) {
	    /*this.storage.get(MEDIA_FILES_KEY).then(res => {
	      if (res) {
	        let arr = JSON.parse(res);
	        arr = arr.concat(files);
	        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
	      } else {
	        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
	      }
	      this.mediaFiles = this.mediaFiles.concat(files);
	    })*/
  	}

  	play(myFile) {
	    if (myFile.name.indexOf('.wav') > -1 || myFile.name.indexOf('.amr') > -1) {
	      const audioFile: MediaObject = this.media.create(myFile.localURL);
	      audioFile.play();
	    }
  	}

  	constructMarkerAttributes(){
  		var attributes = {};
  		attributes['category'] = this.category;
  		attributes['data_consensus'] = this.data_consensus;
  		attributes['point_ubication'] = this.point_ubication;
  		attributes['height_overpass'] = this.height_overpass;
  		attributes['coverage_percentage'] = this.coverage_percentage;
  		attributes['orientation'] = this.orientation;
  		return attributes;
  	}


  	saveMarker(){
	    const markerRepository = getRepository('marker') as Repository<Marker>;
	    var self  = this;
	    markerRepository.save(this.marker)
	    .then(function(savedMarker) {
	    	console.log(savedMarker);
	    	self.toast.showShortTop("Marcador creado con éxito").subscribe(
	    		toast => {
	    			console.log(self.navCtrl.getViews());
				    self.navCtrl.popToRoot();
				  }
	    	);
	    	
	    });
  	}


	saveForm(){
	 	this.marker.attributes = JSON.stringify(this.constructMarkerAttributes());
	 	this.marker.id_survey = 1;
	 	this.marker.creation_date = this.utils.getNowUnixTimestamp();
	 	console.log(this.marker);
	 	this.saveMarker();
	}

}
