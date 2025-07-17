import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BtnGoogleComponent } from './btn-google.component';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BtnGoogleComponent, ThemeToggleComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <!-- Theme Toggle -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle></app-theme-toggle>
      </div>
      
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Iniciar Sesión
          </h2>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="loginForm.get('email')?.errors?.['required']">El email es requerido</div>
                <div *ngIf="loginForm.get('email')?.errors?.['email']">Formato de email inválido</div>
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</div>
                <div *ngIf="loginForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</div>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Iniciar Sesión</span>
              <span *ngIf="isLoading">Iniciando sesión...</span>
            </button>
          </div>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">O continúa con</span>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <app-btn-google 
              buttonText="Iniciar sesión con Google"
              (onSuccess)="onGoogleSuccess($event)"
              (onError)="onGoogleError($event)">
            </app-btn-google>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <a routerLink="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                ¿No tienes cuenta? Regístrate
              </a>
            </div>
            <div class="text-sm">
              <a routerLink="/recovery-pass" class="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  public loading = inject(LoadingService);
  private ngxLoader = inject(NgxUiLoaderService);

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;

      try {
        this.isLoading = true;
        this.loading.start();
        const user = await this.firebaseService.loginWithEmailAndPassword(email, password);
        
        if (user) {
          this.router.navigate(['/user']);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Error al iniciar sesión';
        console.error('Error en login:', error);
      } finally {
        this.isLoading = false;
        this.loading.stop();
      }
    }
  }

  onGoogleSuccess(user: any) {
    console.log('Google login successful:', user);
    // Navigation is handled automatically by the btn-google component
  }

  onGoogleError(error: any) {
    this.errorMessage = error.message;
    console.error('Google login error:', error);
  }
}