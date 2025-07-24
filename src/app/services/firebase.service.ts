import { inject, Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { User as UserInterface } from '../components/user/user.interface';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly loading = inject(LoadingService);
  private readonly authService = inject(FirebaseAuthService);
  private readonly firestoreService = inject(FirestoreService);
  

  // Delegación de propiedades del servicio de autenticación
  get currentUser$(): Observable<User | null | undefined> {
    return this.authService.currentUser$;
  }

  get auth() {
    return this.authService.auth;
  }


  constructor() {}

  // Métodos de autenticación - delegados al AuthService

  // Inicia sesión con email/contraseña y almacena datos del usuario
  async loginWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      this.loading.start();
      console.log('🔐 Iniciando sesión...');
      const user = await this.authService.loginWithEmailAndPassword(email, password);
      console.log('🔐 Usuario autenticado, obteniendo datos...');
      // Obtener información completa del usuario desde Firestore
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      console.log('🔐 Datos obtenidos, encriptando y almacenando...');
      await this.firestoreService.storeCompleteUserData(userInfo);
      console.log('🔐 Datos almacenados correctamente');
      this.loading.stop();
      return user;
    } catch (error) {
      this.loading.stop();
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Registra nuevo usuario y crea su información en Firestore
  async registerWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      this.loading.start();
      const user = await this.authService.registerWithEmailAndPassword(email, password);
      // Crear información completa del usuario en Firestore
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      await this.firestoreService.storeCompleteUserData(userInfo);
      this.loading.stop();
      return user;
    } catch (error) {
      this.loading.stop();
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Inicia sesión con Google y gestiona la información del usuario
  async loginWithGoogle(): Promise<User> {
    try {
      this.loading.start();
      
      const user = await this.authService.loginWithGoogle();
      
      // Obtener o crear información completa del usuario
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      
      // Almacenar información completa del usuario
      await this.firestoreService.storeCompleteUserData(userInfo);
      
      
      this.loading.stop();
      return user;
    } catch (error) {
      this.loading.stop();
      console.error('Error general al iniciar sesión con Google:', error);
      throw error;
    }
  }

  // Cierra sesión del usuario
  async logout(): Promise<void> {
    return this.authService.logout();
  }

  // Verifica estado de autenticación
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Obtiene usuario autenticado actual
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  // Métodos de Firestore - delegados al FirestoreService
  // Obtiene datos completos del usuario desde localStorage
  async getCompleteUserData(): Promise<UserInterface | null> {
    return await this.firestoreService.getCompleteUserData();
  }

  // Actualiza información del usuario
  async updateUser(uid: string, userData: Partial<UserInterface>): Promise<void> {
    return this.firestoreService.updateUser(uid, userData);
  }

  // Busca usuario por ID
  async getUserById(uid: string): Promise<UserInterface | null> {
    return this.firestoreService.getUserById(uid);
  }

}