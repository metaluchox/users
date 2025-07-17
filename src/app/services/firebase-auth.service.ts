import { inject, Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Auth,
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserData } from '../interfaces/user-data';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  public app = initializeApp(environment.firebase);
  public auth: Auth = getAuth(this.app);
  private readonly loading = inject(LoadingService);

  public userData!: UserData;

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  getUserData(): UserData | null {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        return JSON.parse(userDataString);
      } catch (error) {
        console.error('Error al parsear userData del localStorage:', error);
        return null;
      }
    }
    return null;
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.storeUserCredential(userCredential);
      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.handleAuthError(error as AuthError);
      throw error;
    }
  }

  async registerWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.storeUserCredential(userCredential);
      return userCredential.user;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      this.handleAuthError(error as AuthError);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      this.loading.start();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      try {
        const userCredential = await signInWithPopup(this.auth, provider);
        this.storeUserCredential(userCredential);
        
        this.loading.stop();
        return userCredential.user;
      } catch (popupError: any) {
        this.loading.stop();
        console.error('Error al usar popup para autenticación Google:', popupError);

        if (popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/redirect-cancelled-by-user') {
          console.warn('Popup bloqueado o cerrado. Considera usar signInWithRedirect en su lugar.');
        }

        this.handleAuthError(popupError);
        throw popupError;
      }
    } catch (error) {
      this.loading.stop();
      console.error('Error general al iniciar sesión con Google:', error);
      this.handleAuthError(error as AuthError);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      this.loading.start();
      await signOut(this.auth);
      this.loading.stop();
      localStorage.removeItem('userData');
      localStorage.removeItem('completeUserData');
    } catch (error) {
      this.loading.stop();
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  storeUserCredential(userCredential: any): void {
    if (!userCredential?.user) {
      console.error('Invalid user credential object');
      return;
    }

    const { user } = userCredential;
    this.userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      isAuthenticated: true,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('userData', JSON.stringify(this.userData));
  }

  private handleAuthError(error: AuthError): void {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'El formato del correo electrónico no es válido',
      'auth/user-disabled': 'Esta cuenta de usuario ha sido deshabilitada',
      'auth/user-not-found': 'No existe un usuario con este correo electrónico',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este correo electrónico ya está en uso',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña es demasiado débil',
      'auth/popup-blocked': 'El navegador ha bloqueado la ventana emergente',
      'auth/popup-closed-by-user': 'Ventana de autenticación cerrada por el usuario',
      'auth/cancelled-popup-request': 'Solicitud de ventana emergente cancelada',
      'auth/redirect-cancelled-by-user': 'Redirección cancelada por el usuario',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.',
      'auth/invalid-credential': 'Las credenciales han expirado o son inválidas',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con credenciales diferentes'
    };

    const message = errorMessages[error.code] || `Error de autenticación: ${error.code} - ${error.message}`;
    console.error(message);
  }
}