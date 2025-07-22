import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { User } from './user.interface';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Lista de Usuarios</h1>
            </div>
            <div class="flex items-center space-x-4">
              <app-theme-toggle></app-theme-toggle>
              <button
                (click)="showCreateForm = true"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Agregar Usuario
              </button>
              <button
                (click)="goBack()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Create User Modal -->
      <div *ngIf="showCreateForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Crear Nuevo Usuario</h3>
          
          <form (ngSubmit)="createUser()" #userForm="ngForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="newUser.email"
                name="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                [(ngModel)]="newUser.displayName"
                name="displayName"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
              <input
                type="tel"
                [(ngModel)]="newUser.phone"
                name="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles</label>
              <input
                type="text"
                [(ngModel)]="roleIdsString"
                name="roles"
                placeholder="admin,user,editor (separados por comas)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="cancelCreate()"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!userForm.form.valid || isCreating"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isCreating ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage && !isLoading" 
               class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ errorMessage }}
          </div>

          <!-- Users Grid -->
          <div *ngIf="!isLoading && !errorMessage" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      UID
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Correo
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  <tr *ngFor="let user of users" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span class="font-mono text-xs">{{ user.uid | slice:0:8 }}...</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div *ngIf="user.photoURL" class="h-8 w-8 rounded-full mr-3">
                          <img [src]="user.photoURL" [alt]="user.displayName || user.email" 
                               class="h-8 w-8 rounded-full object-cover">
                        </div>
                        <div *ngIf="!user.photoURL" class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
                          <span class="text-white text-xs font-medium">
                            {{ getInitials(user.displayName || user.email) }}
                          </span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ user.email }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {{ user.displayName || 'Sin nombre' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span *ngIf="user.roleIds && user.roleIds.length > 0" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {{ user.roleIds.join(', ') }}
                      </span>
                      <span *ngIf="!user.roleIds || user.roleIds.length === 0" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Sin rol
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        (click)="editUser(user)"
                        class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="users.length === 0" class="text-center py-12">
              <div class="text-gray-500 dark:text-gray-400">
                <p class="text-lg font-medium">No hay usuarios disponibles</p>
                <p class="mt-2">Los usuarios aparecerán aquí cuando se registren.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ListComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Create user form
  showCreateForm: boolean = false;
  isCreating: boolean = false;
  roleIdsString: string = '';
  newUser: Omit<User, 'uid' | 'createdAt' | 'updatedAt' | 'roleIds'> = {
    email: '',
    displayName: '',
    photoURL: '',
    phone: ''
  };

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.users = await this.firestoreService.getAllUsers();
      
    } catch (error) {
      console.error('Error loading users:', error);
      this.errorMessage = 'Error al cargar los usuarios. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  editUser(user: User) {
    // Navigate to edit user page or show edit modal
    console.log('Editing user:', user);
    // Implementation will depend on your routing strategy
    // this.router.navigate(['/user/edit', user.uid]);
  }

  async createUser() {
    if (this.isCreating) return;
    
    try {
      this.isCreating = true;
      this.errorMessage = '';

      // Convert roleIdsString to array
      const roleIds = this.roleIdsString 
        ? this.roleIdsString.split(',').map(role => role.trim()).filter(role => role.length > 0)
        : ['user'];

      const userData = {
        ...this.newUser,
        roleIds
      };

      const createdUser = await this.firestoreService.createUser(userData);
      
      // Add the new user to the list
      this.users.push(createdUser);
      
      // Reset form and close modal
      this.cancelCreate();
      
    } catch (error) {
      console.error('Error creating user:', error);
      this.errorMessage = 'Error al crear el usuario. Por favor, inténtalo de nuevo.';
    } finally {
      this.isCreating = false;
    }
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.isCreating = false;
    this.roleIdsString = '';
    this.newUser = {
      email: '',
      displayName: '',
      photoURL: '',
      phone: ''
    };
  }

  goBack() {
    this.router.navigate(['/user']);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}