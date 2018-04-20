import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class ExportFormatsProvider {

  constructor() {
  }


  public getGeoJSONObjectBase(name = "NewFeatureType"){
  	return {
	    "name":name,
	    "type":"FeatureCollection",
	    "features":[]
	};
  }

}
