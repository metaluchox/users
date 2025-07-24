import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from './user.interface';
import { MainNavComponent } from '../shared/main-nav.component';
import { AddComponent } from './add.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MainNavComponent, AddComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <app-main-nav
        title="Lista de Usuarios"
        [userData]="userData"
        [isLoading]="isLoading"
        (goToProfile)="goToProfile()"
        (goToList)="goToProfile()"
        (logout)="logout()"
      ></app-main-nav>

      <app-user-add 
        [show]="showCreateForm"
        (userCreated)="onUserCreated($event)"
        (cancelled)="onAddCancelled()">
      </app-user-add>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Busca y administra usuarios del sistema
            </p>
          </div>
          <button
            (click)="showCreateForm = true"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <span class="text-lg">+</span>
            Agregar Usuario
          </button>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buscar Usuarios</h2>
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar por email, nombre o teléfono..."
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                (keyup.enter)="searchUsers()"
              />
              <div class="flex gap-2">
                <button
                  (click)="searchUsers()"
                  [disabled]="isLoading || !searchTerm.trim()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-blue-600 disabled:cursor-not-allowed text-white rounded-md font-medium"
                >
                  {{ isLoading ? 'Buscando...' : 'Buscar' }}
                </button>
                <button
                  (click)="clearSearch()"
                  [disabled]="isLoading"
                  class="px-4 py-2 bg-blue-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-blue-600 disabled:cursor-not-allowed text-white rounded-md font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400">Buscando usuarios...</p>
          </div>

          <div *ngIf="errorMessage && !isLoading" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-red-700 dark:text-red-400"><strong>Error:</strong> {{ errorMessage }}</p>
          </div>

          <div *ngIf="!isLoading && !errorMessage">
            
            <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Información</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr *ngFor="let user of users" class="hover:bg-gray-50 dark:hover:bg-gray-700" (click)="editUser(user)">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img *ngIf="user.photoURL" class="h-10 w-10 rounded-full" [src]="user.photoURL" [alt]="getUserDisplayName(user)">
                          <div *ngIf="!user.photoURL" class="h-10 w-10 rounded-full bg-blue-300 dark:bg-purple-600 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ getInitials(getUserDisplayName(user)) }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ getUserDisplayName(user) }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                          <div class="text-xs text-gray-400 dark:text-gray-500">ID: {{ user.uid | slice:0:12 }}...</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.phone || 'Sin teléfono' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                            [class]="getRoleBadgeClass(user.roleIds)">{{ getRoleText(user.roleIds) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="md:hidden space-y-4">
              <div *ngFor="let user of users" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4" (click)="editUser(user)" >
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <img *ngIf="user.photoURL" class="h-12 w-12 rounded-full" [src]="user.photoURL" [alt]="getUserDisplayName(user)">
                    <div *ngIf="!user.photoURL" class="h-12 w-12 rounded-full bg-blue-300 dark:bg-blue-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ getInitials(getUserDisplayName(user)) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ getUserDisplayName(user) }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                      </div>
                    </div>
                    
                    <div class="mt-2 space-y-1">
                      <p class="text-sm text-gray-600 dark:text-gray-400">Teléfono: {{ user.phone || 'Sin teléfono' }}</p>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Rol:</span>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                              [class]="getRoleBadgeClass(user.roleIds)">{{ getRoleText(user.roleIds) }}</span>
                      </div>
                      <p class="text-xs text-gray-400 dark:text-gray-500">ID: {{ user.uid | slice:0:16 }}...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="users.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <div class="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ hasSearched ? 'No hay resultados' : 'Busca usuarios' }}</h3>
              <p class="text-gray-600 dark:text-gray-400">{{ hasSearched ? 'No se encontraron usuarios con los criterios de búsqueda. Intenta con términos diferentes.' : 'Utiliza el buscador para encontrar usuarios por email, nombre o teléfono' }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ListComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  users: User[] = [];
  userData: User | null = null;
  isLoading = false;
  errorMessage = '';
  showCreateForm = false;
  searchTerm = '';
  hasSearched = false;

  async ngOnInit() {
    this.userData = await this.firebaseService.getCompleteUserData();
    if (!this.userData) {
      this.router.navigate(['/login']);
    }
  }

  async searchUsers() {
    if (!this.searchTerm.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      this.users = await this.firestoreService.searchUsers(this.searchTerm.trim());
      this.hasSearched = true;
    } catch (error) {
      console.error('Error searching users:', error);
      this.errorMessage = 'Error al buscar usuarios. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.users = [];
    this.hasSearched = false;
    this.errorMessage = '';
  }

  editUser(user: User) {
    this.router.navigate(['/user/edit', user.uid]);
  }

  onUserCreated(user: User) {
    this.users.push(user);
    this.showCreateForm = false;
  }

  onAddCancelled() {
    this.showCreateForm = false;
  }

  goToProfile() {
    this.router.navigate(['/user']);
  }

  async logout() {
    try {
      await this.firebaseService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.router.navigate(['/login']);
    }
  }

  getUserDisplayName(user: User): string {
    return user.displayName || user.email || 'Sin nombre';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length >= 2 
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name[0].toUpperCase();
  }

  getRoleText(roleIds: string[] | undefined): string {
    return roleIds && roleIds.length > 0 ? roleIds.join(', ') : 'Sin rol';
  }

  getRoleBadgeClass(roleIds: string[] | undefined): string {
    return roleIds && roleIds.length > 0
      ? 'bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-300'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }
}