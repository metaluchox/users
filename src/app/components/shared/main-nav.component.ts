import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './theme-toggle.component';
import { User as UserInterface } from '../user/user.interface';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ title || 'Dashboard' }}
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <app-theme-toggle></app-theme-toggle>
            <div *ngIf="userData" class="flex items-center space-x-3 cursor-pointer" (click)="goToProfile.emit()">
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
              (click)="goToList.emit()"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Ver Lista
            </button>
            <button
              (click)="logout.emit()"
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
  `
})
export class MainNavComponent {
  @Input() title: string = '';
  @Input() userData: UserInterface | null = null;
  @Input() isLoading: boolean = false;

  @Output() goToProfile = new EventEmitter<void>();
  @Output() goToList = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}