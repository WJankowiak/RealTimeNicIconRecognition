import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  private API_URL = 'http://51.38.132.13:1338';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  saveSign(data) {
    return this.http.post(this.API_URL + '/save', data, this.httpOptions);
  }
}
