import { Injectable } from '@angular/core';

@Injectable()
export class UtilsProvider {

  constructor() {
  }


  // Recibe unix timestamp en segundos y retorna string date
  getDateFromUNIX(intTimestamp){
  	return new Date(intTimestamp * 1000);
  }

  getFormattedDate(date){
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    if (hh < 10) {hh = "0"+hh;}
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
    var t = day+"/"+month+"/"+year+" "+hh+":"+mm+":"+ss;
    return t;
  }


  // retorna timestamp unix ("now") en segundos
  getNowUnixTimestamp(){
  	return Date.now() / 1000;
  }

}
