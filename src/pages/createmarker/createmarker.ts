import { Component} from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';

// PLUGINS
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';


import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError} from '@ionic-native/media-capture';

import {ViewMapPage} from '../viewmap/viewmap';

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
	base64Image : string;
	orientation:number;
	mediaFiles = [];
	markerLocation:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, private deviceOrientation: DeviceOrientation, private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media) {
			this.markerLocation = navParams.get('location'); 
			console.log(this.markerLocation);
			this.deviceOrientation.watchHeading().subscribe(
			  (data: DeviceOrientationCompassHeading) => {
			  		this.orientation = data.magneticHeading;
		  		}
			);


	}	


	ionViewDidLoad() {
	    this.storage.get(MEDIA_FILES_KEY).then(res => {
	      this.mediaFiles = JSON.parse(res) || [];
    	})
    }


	takePicture(){
		const options: CameraOptions = {
		  quality: 100,
		  destinationType: this.camera.DestinationType.FILE_URI,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE
		}

		this.camera.getPicture(options).then((imageData) => {
			this.base64Image = imageData;
			}, (err) => {
			console.log(err);
		});
	}

	captureAudio() {
	    this.mediaCapture.captureAudio().then(res => {
	      this.storeMediaFiles(res);
	    }, (err: CaptureError) => console.error(err));
  	}

  	storeMediaFiles(files) {
	    this.storage.get(MEDIA_FILES_KEY).then(res => {
	      if (res) {
	        let arr = JSON.parse(res);
	        arr = arr.concat(files);
	        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
	      } else {
	        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
	      }
	      this.mediaFiles = this.mediaFiles.concat(files);
	    })
  	}

  	play(myFile) {
    if (myFile.name.indexOf('.wav') > -1 || myFile.name.indexOf('.amr') > -1) {
      const audioFile: MediaObject = this.media.create(myFile.localURL);
      audioFile.play();
    }
  }

	saveForm(){
	 
	}

}
