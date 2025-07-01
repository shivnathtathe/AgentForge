import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})

export class ToolService {
  private apiBaseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) { }
  callAPI(task: string, args: any = {}): Observable<any> {
    const payload = {
      task: task,
      args: args
    };
    return this.http.post(`${this.apiBaseUrl}/execute`, payload);
  }

  getTools(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/tools`);
  }
}
