import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';
import { User as UserInterface } from './user.interface';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <app-theme-toggle></app-theme-toggle>
              <div *ngIf="userData" class="flex items-center space-x-3">
                <img 
                  *ngIf="userData.photoURL" 
                  [src]="userData.photoURL" 
                  [alt]="userData.displayName || userData.email"
                  class="h-8 w-8 rounded-full"
                />
                <div *ngIf="!userData.photoURL" class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ getInitials(userData.displayName || userData.email) }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ userData.displayName || userData.email }}
                </span>
              </div>
              <button
                (click)="goToIndex()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Ir al Inicio
              </button>
              <button
                (click)="goToList()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Ver Lista
              </button>
              <button
                (click)="logout()"
                [disabled]="isLoading"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Cerrar Sesión</span>
                <span *ngIf="isLoading">Cerrando...</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Información del Usuario -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ¡Bienvenido a tu Dashboard!
              </h2>
              
              <div *ngIf="userData" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Usuario</h3>
                <div class="space-y-3">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{{ userData.email }}</span>
                  </div>
                  <div *ngIf="userData.displayName">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{{ userData.displayName }}</span>
                  </div>
                  <div *ngIf="userData.phone">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{{ userData.phone }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">UID:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-xs">{{ userData.uid }}</span>
                  </div>
                  <div *ngIf="userData.updatedAt">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Última actualización:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(userData.updatedAt) }}</span>
                  </div>
                  <div *ngIf="userData.roleIds && userData.roleIds.length > 0">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Roles:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-sm">{{ userData.roleIds.join(', ') }}</span>
                  </div>
                </div>
              </div>

              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Tu sesión está activa y todos los servicios de Firebase están funcionando correctamente.
              </p>
              
              <div class="flex justify-center space-x-4">
                <button
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Explorar Funciones
                </button>
                <button
                  class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Configuraciones
                </button>
              </div>
            </div>

            <!-- Formulario de Actualización de Perfil -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Actualizar Perfil</h3>
              
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    formControlName="displayName"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre completo"
                  />
                  <div *ngIf="profileForm.get('displayName')?.touched && profileForm.get('displayName')?.errors?.['required']" 
                       class="text-red-600 text-sm mt-1">
                    El nombre es requerido
                  </div>
                </div>

                <!-- Teléfono -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    formControlName="phone"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+56 9 1234 5678"
                  />
                  <div *ngIf="profileForm.get('phone')?.touched && profileForm.get('phone')?.errors?.['pattern']" 
                       class="text-red-600 text-sm mt-1">
                    Formato de teléfono inválido
                  </div>
                </div>

                <!-- URL de Foto -->
                <div>
                  <label for="photoURL" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de la foto de perfil
                  </label>
                  <input
                    type="url"
                    id="photoURL"
                    formControlName="photoURL"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://ejemplo.com/tu-foto.jpg"
                  />
                  <div *ngIf="profileForm.get('photoURL')?.touched && profileForm.get('photoURL')?.errors?.['pattern']" 
                       class="text-red-600 text-sm mt-1">
                    URL inválida
                  </div>
                </div>

                <!-- Vista previa de la imagen -->
                <div *ngIf="profileForm.get('photoURL')?.value && profileForm.get('photoURL')?.valid" 
                     class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Vista previa:</span>
                  <img 
                    [src]="profileForm.get('photoURL')?.value" 
                    alt="Vista previa"
                    class="h-12 w-12 rounded-full object-cover"
                    (error)="onImageError($event)"
                  />
                </div>

                <!-- Botones -->
                <div class="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || isUpdating"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <span *ngIf="!isUpdating">Actualizar Perfil</span>
                    <span *ngIf="isUpdating">Actualizando...</span>
                  </button>
                  <button
                    type="button"
                    (click)="resetForm()"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Restablecer
                  </button>
                </div>
              </form>

              <!-- Mensaje de éxito/error -->
              <div *ngIf="updateMessage" class="mt-4 p-3 rounded-md" 
                   [class.bg-green-100]="updateMessage.type === 'success'"
                   [class.text-green-800]="updateMessage.type === 'success'"
                   [class.bg-red-100]="updateMessage.type === 'error'"
                   [class.text-red-800]="updateMessage.type === 'error'">
                {{ updateMessage.text }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class UserComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private loading = inject(LoadingService);
  private fb = inject(FormBuilder);

  userData: UserInterface | null = null;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  updateMessage: { type: 'success' | 'error', text: string } | null = null;

  profileForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
    photoURL: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]]
  });

  ngOnInit() {
    this.loadUserData();
  }

  // Carga datos del usuario desde localStorage o Firestore
  loadUserData() {
    // Get complete user data from localStorage
    this.userData = this.firebaseService.getCompleteUserData();
    if (this.userData) {
      this.initializeForm();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Inicializa el formulario con los datos actuales del usuario
  initializeForm() {
    if (this.userData) {
      this.profileForm.patchValue({
        displayName: this.userData.displayName || '',
        phone: this.userData.phone || '',
        photoURL: this.userData.photoURL || ''
      });
    }
  }

  // Restablece el formulario a los valores originales
  resetForm() {
    this.initializeForm();
    this.updateMessage = null;
  }

  // Actualiza el perfil del usuario
  async updateProfile() {
    if (this.profileForm.valid && this.userData) {
      try {
        this.isUpdating = true;
        this.updateMessage = null;

        const formData = this.profileForm.value;
        const updatedUserData = {
          ...this.userData,
          displayName: formData.displayName,
          phone: formData.phone,
          photoURL: formData.photoURL,
          updatedAt: new Date().toISOString()
        };

        // Actualizar en Firestore
        // await this.firebaseService.updateUserProfile(this.userData.uid, updatedUserData);
        
        // Actualizar los datos locales
        // this.userData = updatedUserData;
        
        // Actualizar en localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        this.updateMessage = {
          type: 'success',
          text: 'Perfil actualizado exitosamente'
        };

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          this.updateMessage = null;
        }, 3000);

      } catch (error) {
        console.error('Error updating profile:', error);
        this.updateMessage = {
          type: 'error',
          text: 'Error al actualizar el perfil. Inténtalo de nuevo.'
        };
      } finally {
        this.isUpdating = false;
      }
    }
  }

  // Maneja errores de carga de imagen
  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  // Redirige al índice
  goToIndex() {
    this.router.navigate(['/']);
  }

  // Redirige a la lista
  goToList() {
    this.router.navigate(['/user/list']);
  }

  // Obtiene iniciales del nombre para avatar
  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  // Formatea fecha para mostrar en la UI
  formatDate(dateInput: string | Date): string {
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  // Cierra sesión y redirige al login
  async logout() {
    try {
      this.isLoading = true;
      await this.firebaseService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.isLoading = false;
    }
  }
}