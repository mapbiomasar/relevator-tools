import { Injectable } from '@angular/core';
import { Toast } from '@ionic-native/toast';

@Injectable()
export class ToastProvider {

  constructor(private toast: Toast) {
  }


  showShortToast(message){
  }

}
