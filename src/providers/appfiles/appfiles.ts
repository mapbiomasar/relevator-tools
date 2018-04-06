import { Injectable } from '@angular/core';

import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';

@Injectable()
export class AppFilesProvider {

  imageMediaType:string = "image";
  audioMediaType:string = "audio";
  fileType:string = "files";
  tileFileType:string = "tiles";

  constructor(private file: File, private filePath: FilePath) {
  }


	public checkMediaDirs(){
		this.checkAppDirectory(this.imageMediaType);
		this.checkAppDirectory(this.audioMediaType);
		this.checkAppDirectory(this.fileType);
		this.checkAppDirectory(this.tileFileType);
	}



	public checkAppDirectory(dirName){
		this.file.checkDir(this.file.externalDataDirectory, dirName).then(success => {
			
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


	public getTileFileDir(){
		return this.getAppDir(this.tileFileType);
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
		console.log("COPYING");
		console.log(currentName);
		console.log(newFileName);
		console.log(fileType);
	  	return this.file.copyFile(namePath, currentName, this.getAppDir(fileType), newFileName)
	}


	public getFileContent(filePath, fileType){
		console.log("READING");
		return this.file.readAsText(this.getAppDir(fileType), filePath)
	}


	public async getTilesDirs(){
		let localTilesDirs = await this.getTilesDirectoryContent();
		let dirs = [];
		for (var i in localTilesDirs){
			if (localTilesDirs[i].isDirectory){
				dirs.push({"name": localTilesDirs[i].name, "fullPath":localTilesDirs[i].nativeURL});
			}
		}
		return dirs;
	}


	getTilesDirectoryContent(){
		return this.file.listDir(this.file.externalDataDirectory, this.tileFileType);
	}


}
