import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { User } from './user.interface';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Create User Modal -->
    <div *ngIf="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Crear Nuevo Usuario</h3>
        
        <!-- Error Message -->
        <div *ngIf="errorMessage" 
             class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ errorMessage }}
        </div>
        
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
              (click)="cancel()"
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
  `
})
export class AddComponent {
  private firestoreService = inject(FirestoreService);

  @Input() show: boolean = false;
  @Output() userCreated = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();

  isCreating: boolean = false;
  errorMessage: string = '';
  roleIdsString: string = '';
  newUser: Omit<User, 'uid' | 'createdAt' | 'updatedAt' | 'roleIds'> = {
    email: '',
    displayName: '',
    photoURL: '',
    phone: ''
  };

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
      
      // Emit the created user and reset form
      this.userCreated.emit(createdUser);
      this.resetForm();
      
    } catch (error) {
      console.error('Error creating user:', error);
      this.errorMessage = 'Error al crear el usuario. Por favor, inténtalo de nuevo.';
    } finally {
      this.isCreating = false;
    }
  }

  cancel() {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm() {
    this.roleIdsString = '';
    this.errorMessage = '';
    this.newUser = {
      email: '',
      displayName: '',
      photoURL: '',
      phone: ''
    };
  }
}