import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-register',
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
            Crear Cuenta
          </h2>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">El email es requerido</div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">Formato de email inválido</div>
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
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</div>
                <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</div>
              </div>
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar contraseña"
              />
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-1">
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Confirmar contraseña es requerido</div>
              </div>
              <div *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-1">
                Las contraseñas no coinciden
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
              [disabled]="registerForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Crear Cuenta</span>
              <span *ngIf="isLoading">Creando cuenta...</span>
            </button>
          </div>

          <div class="text-center">
            <div class="text-sm">
              <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Ya tienes cuenta? Inicia sesión
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private loading = inject(LoadingService);

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      const { email, password } = this.registerForm.value;

      try {
        this.isLoading = true;
        this.loading.start();
        
        const user = await this.firebaseService.registerWithEmailAndPassword(email, password);
        
        if (user) {
          this.firebaseService.storeUserCredential({ user });
          this.successMessage = 'Cuenta creada exitosamente. Redirigiendo...';
          
          setTimeout(() => {
            this.router.navigate(['/user']);
          }, 2000);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Error al crear la cuenta';
        console.error('Error en registro:', error);
      } finally {
        this.isLoading = false;
        this.loading.stop();
      }
    }
  }
}