import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-btn-google',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="signInWithGoogle()"
      [disabled]="isLoading"
      [class]="buttonClasses"
    >
      <div class="flex items-center justify-center">
        <svg *ngIf="!isLoading" class="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        
        <div *ngIf="isLoading" class="w-5 h-5 mr-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
        
        <span>{{ buttonText }}</span>
      </div>
    </button>
  `
})
export class BtnGoogleComponent {
  @Input() buttonText: string = 'Continuar con Google';
  @Input() customClasses: string = '';
  @Input() redirectTo: string = '/user';
  @Output() onSuccess = new EventEmitter<any>();
  @Output() onError = new EventEmitter<any>();

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private loading = inject(LoadingService);

  isLoading: boolean = false;

  get buttonClasses(): string {
    const defaultClasses = 'w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
    return this.customClasses || defaultClasses;
  }

  async signInWithGoogle() {
    if (this.isLoading) return;

    try {
      this.isLoading = true;
      this.loading.start({ message: 'Iniciando sesión con Google...' });
      
      const user = await this.firebaseService.loginWithGoogle();
      
      if (user) {
        this.onSuccess.emit(user);
        
        // Si no hay manejador personalizado, navegar a la ruta por defecto
        if (this.onSuccess.observers.length === 0) {
          await this.router.navigate([this.redirectTo]);
        }
      }
    } catch (error: any) {
      console.error('Error en autenticación con Google:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google';
      
      // Manejar errores espec�ficos
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta nuevamente.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana de autenticación cerrada. Intenta nuevamente.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Solicitud de autenticación cancelada.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas. Intenta nuevamente.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ya existe una cuenta con un método de autenticación diferente.';
          break;
        default:
          if (error.message && !error.message.includes('El registro de nuevos usuarios')) {
            errorMessage = error.message;
          }
      }
      
      this.onError.emit({ 
        error, 
        message: errorMessage 
      });
      
      // Si no hay manejador de error personalizado, mostrar en consola
      if (this.onError.observers.length === 0) {
        alert(errorMessage);
      }
    } finally {
      this.isLoading = false;
      this.loading.stop();
    }
  }
}