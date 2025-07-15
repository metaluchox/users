import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingService } from '../../services/loading.service';
import { UserData } from '../../interfaces/user-data';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
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
          <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ¡Bienvenido a tu Dashboard!
              </h2>
              
              <div *ngIf="userData" class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Usuario</h3>
                <div class="space-y-3 text-left">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{{ userData.email }}</span>
                  </div>
                  <div *ngIf="userData.displayName">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{{ userData.displayName }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">UID:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-xs">{{ userData.uid }}</span>
                  </div>
                  <div *ngIf="userData.lastLogin">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Último acceso:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(userData.lastLogin) }}</span>
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

  userData: UserData | null = null;
  isLoading: boolean = false;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Get user data from localStorage first
    this.userData = this.firebaseService.getUserData();
    
    // Also listen to auth state changes
    this.firebaseService.currentUser$.subscribe(user => {
      if (user) {
        // Update userData if we have a Firebase user but no stored data
        if (!this.userData) {
          this.userData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            isAuthenticated: true,
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // User is not authenticated, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
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