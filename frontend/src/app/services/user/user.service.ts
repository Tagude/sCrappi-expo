import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface User {
  id?: number;
  name: string;
  lastName: string;
  document: number;
  userName: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
  phone?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Ajustado al puerto 8080 que vimos en tu consola
  private readonly API_URL = `${environment.apiUrl}/users`;

  login(data: any) {
    return this.http.post(`${this.API_URL}/login`, data);
  }
  constructor(private http: HttpClient) {}
  // El método dice: " devolver una lista de usuarios cuando el backend responda"
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: number, user: any) {
    return this.http.put(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
