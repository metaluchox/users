import { inject, Injectable } from '@angular/core';
import { getAnalytics } from 'firebase/analytics';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserData } from '../interfaces/user-data';
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
  
  public analytics = getAnalytics(this.authService.app);

  // Delegación de propiedades del servicio de autenticación
  get currentUser$(): Observable<User | null> {
    return this.authService.currentUser$;
  }

  get userData(): UserData {
    return this.authService.userData;
  }

  constructor() {}

  // Métodos de autenticación - delegados al AuthService
  getUserData(): UserData | null {
    return this.authService.getUserData();
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const user = await this.authService.loginWithEmailAndPassword(email, password);
      // Obtener información completa del usuario desde Firestore
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      this.firestoreService.storeCompleteUserData(userInfo);
      return user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async registerWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      // Verificar si está permitido el registro
      const registrationAllowed = await this.firestoreService.isUserRegistrationAllowed();
      
      if (!registrationAllowed) {
        throw new Error('El registro de nuevos usuarios está deshabilitado. Solo usuarios registrados pueden acceder.');
      }
      
      const user = await this.authService.registerWithEmailAndPassword(email, password);
      // Crear información completa del usuario en Firestore
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      this.firestoreService.storeCompleteUserData(userInfo);
      return user;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      this.loading.start();
      
      const user = await this.authService.loginWithGoogle();
      
      // Obtener o crear información completa del usuario
      const userInfo = await this.firestoreService.getOrCreateUserInfo(user);
      
      // Almacenar información completa del usuario
      this.firestoreService.storeCompleteUserData(userInfo);
      
      await this.firestoreService.handleUserLogin(user);
      
      this.loading.stop();
      return user;
    } catch (error) {
      this.loading.stop();
      console.error('Error general al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  // Métodos de Firestore - delegados al FirestoreService
  getCompleteUserData(): UserInterface | null {
    return this.firestoreService.getCompleteUserData();
  }

  async updateUser(uid: string, userData: Partial<UserInterface>): Promise<void> {
    return this.firestoreService.updateUser(uid, userData);
  }

  async getUserById(uid: string): Promise<UserInterface | null> {
    return this.firestoreService.getUserById(uid);
  }

  // Métodos de configuración - delegados al FirestoreService
  async setUserRegistrationConfig(allowRegistration: boolean): Promise<void> {
    const userEmail = this.authService.getCurrentUser()?.email || undefined;
    return this.firestoreService.setUserRegistrationConfig(allowRegistration, userEmail);
  }

  async getUserRegistrationConfig(): Promise<boolean> {
    return this.firestoreService.getUserRegistrationConfig();
  }

  async isUserRegistrationAllowed(): Promise<boolean> {
    return this.firestoreService.isUserRegistrationAllowed();
  }

  async getSpecialEmails(): Promise<string[]> {
    return this.firestoreService.getSpecialEmails();
  }
}