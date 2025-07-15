import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-recovery-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <!-- Theme Toggle -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle></app-theme-toggle>
      </div>
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>
        
        <form [formGroup]="recoveryForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
              />
              <div *ngIf="recoveryForm.get('email')?.invalid && recoveryForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="recoveryForm.get('email')?.errors?.['required']">El email es requerido</div>
                <div *ngIf="recoveryForm.get('email')?.errors?.['email']">Formato de email inválido</div>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="text-green-500 text-sm text-center">
            {{ successMessage }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="recoveryForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Enviar Enlace de Recuperación</span>
              <span *ngIf="isLoading">Enviando...</span>
            </button>
          </div>

          <div class="text-center">
            <div class="text-sm">
              <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RecoveryPassComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private loading = inject(LoadingService);

  recoveryForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.recoveryForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      const { email } = this.recoveryForm.value;

      try {
        this.isLoading = true;
        this.loading.start();
        
        await sendPasswordResetEmail(this.firebaseService.auth, email, {
          url: window.location.origin + '/login',
          handleCodeInApp: false
        });
        
        this.successMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y la carpeta de spam.';
        
        // Limpiar el formulario
        this.recoveryForm.reset();
        
        // Redirigir al login despu�s de 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
        
      } catch (error: any) {
        console.error('Error al enviar email de recuperación:', error);
        
        // Manejar errores espec�ficos
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage = 'No existe una cuenta asociada a este correo electrónico.';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Demasiados intentos. Intenta nuevamente más tarde.';
            break;
          case 'auth/network-request-failed':
            this.errorMessage = 'Error de red. Verifica tu conexión a internet.';
            break;
          default:
            this.errorMessage = 'Error al enviar el correo de recuperación. Intenta nuevamente.';
        }
      } finally {
        this.isLoading = false;
        this.loading.stop();
      }
    }
  }
}