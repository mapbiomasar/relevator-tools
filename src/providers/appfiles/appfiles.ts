import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

@Injectable()
export class AppFilesProvider {

  imageMediaType:string = "image";
  audioMediaType:string = "audio";
  fileType:string = "files";

  constructor(private file: File) {
  }


	public checkMediaDirs(){
		this.checkAppDirectory(this.imageMediaType);
		this.checkAppDirectory(this.audioMediaType);
		this.checkAppDirectory(this.fileType);
	}



	public checkAppDirectory(dirName){
		this.file.checkDir(this.file.externalDataDirectory, dirName).then(success => {
			console.log("Directorio chequeado " + dirName);
		}, error => {
			this.createAppDir(dirName);
		});
	}



	public createAppDir(dirName){
		this.file.createDir(this.file.externalDataDirectory, dirName, false).then(success => {
			console.log("Directorio creado: " + this.file.externalDataDirectory + dirName);
		}, error => {
			console.log("Fallo al crear directorio " + dirName);
		})
	}

	// Remove media files
	removeMediaFiles(mediaEntity){
		console.log("removing file" + this.getAppDir(mediaEntity.tipo) + ", " + mediaEntity.path);
		this.file.removeFile(this.getAppDir(mediaEntity.tipo), mediaEntity.path);
	}


	public getImageDir(){
		return this.getAppDir(this.imageMediaType);
	}

	public getAudioDir(){
		return this.getAppDir(this.audioMediaType);
	}

	public getFileDir(){
		return this.getAppDir(this.fileType);
	}


	public getAppDir(mediaType){
		return this.file.externalDataDirectory + mediaType;
	}

	public getPathForMedia(mediaType, filePath){
		if (filePath === null){
			return '';
		} else {
			return this.file.externalDataDirectory + mediaType + "/" + filePath;
		}
	}


	public createImageFileName() {
	  return this.createFileRandomName(".jpg");
	}

	public createFileRandomName(extension) {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < 16; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text + extension;
	}

	public getImageMediaType(){
		return this.imageMediaType;
	}

	public getAudioMediaType(){
		return this.audioMediaType;
	}

	public getFileType(){
		return this.fileType;
	}

	public copyFileToLocalDir(namePath, currentName, newFileName, fileType) {
	  return this.file.copyFile(namePath, currentName, this.getAppDir(fileType), newFileName)
	}


	public getFileContent(filePath, fileType){
		return this.file.readAsText(this.getAppDir(fileType), filePath)
	}


}
