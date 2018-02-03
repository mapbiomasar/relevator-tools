import { Injectable } from '@angular/core';

@Injectable()
export class UtilsProvider {

  constructor() {
  }


  // Recibe unix timestamp en segundos y retorna string date
  getDateFromUNIX(intTimestamp){
  	return new Date(intTimestamp * 1000);
  }


  // retorna timestamp unix ("now") en segundos
  getNowUnixTimestamp(){
  	return Date.now() / 1000;
  }

}
