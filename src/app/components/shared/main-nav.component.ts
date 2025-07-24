import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './theme-toggle.component';
import { User as UserInterface } from '../user/user.interface';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <style>
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
      }
      @keyframes slide-down {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes title-shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      .animate-slide-down {
        animation: slide-down 0.3s ease-out;
      }
      .title-shimmer {
        background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #06b6d4 50%, #8b5cf6 75%, #3b82f6 100%);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: title-shimmer 3s linear infinite;
      }
    </style>
    <nav class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200/20 dark:border-gray-700/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Title Section -->
          <div class="flex items-center space-x-4">
            <h1 class="text-xl lg:text-2xl font-bold title-shimmer hover:scale-105 transition-transform duration-300 cursor-default">
              {{ title || 'Dashboard' }}
            </h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-3 lg:space-x-4">
            <app-theme-toggle></app-theme-toggle>
            
            <!-- User Profile Section -->
            <div *ngIf="userData" 
                 class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                 (click)="goToProfile.emit()">
              <div class="relative">
                <img 
                  *ngIf="userData.photoURL" 
                  [src]="userData.photoURL" 
                  [alt]="userData.displayName || userData.email"
                  class="h-9 w-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                />
                <div *ngIf="!userData.photoURL" 
                     class="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg">
                  <span class="text-white text-sm font-semibold">
                    {{ getInitials(userData.displayName || userData.email) }}
                  </span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div class="hidden lg:block">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {{ userData.displayName || userData.email }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <button
              (click)="goToIndex.emit()"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Inicio
            </button>
            
            <button
              *ngIf="isAdmin()"
              (click)="goToList.emit()"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 animate-pulse-glow"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Ver Lista
            </button>
            
            <button
              (click)="logout.emit()"
              [disabled]="isLoading"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span *ngIf="!isLoading">Cerrar Sesión</span>
              <span *ngIf="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cerrando...
              </span>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center space-x-2">
            <app-theme-toggle></app-theme-toggle>
            <button
              (click)="toggleMobileMenu()"
              class="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [attr.aria-expanded]="isMobileMenuOpen"
            >
              <svg class="w-6 h-6" [class.hidden]="isMobileMenuOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg class="w-6 h-6" [class.hidden]="!isMobileMenuOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div class="md:hidden" [class.hidden]="!isMobileMenuOpen">
          <div class="px-2 pt-2 pb-3 space-y-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <!-- Mobile User Profile -->
            <div *ngIf="userData" 
                 class="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                 (click)="goToProfile.emit(); toggleMobileMenu()">
              <div class="relative">
                <img 
                  *ngIf="userData.photoURL" 
                  [src]="userData.photoURL" 
                  [alt]="userData.displayName || userData.email"
                  class="h-10 w-10 rounded-full ring-2 ring-blue-500 hover:scale-110 transition-transform duration-300 shadow-md"
                />
                <div *ngIf="!userData.photoURL" 
                     class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-blue-500 hover:scale-110 transition-transform duration-300 shadow-md">
                  <span class="text-white font-semibold">
                    {{ getInitials(userData.displayName || userData.email) }}
                  </span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">Perfil</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {{ userData.displayName || userData.email }}
                </p>
              </div>
            </div>

            <!-- Mobile Action Buttons -->
            <button
              (click)="goToIndex.emit(); toggleMobileMenu()"
              class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Inicio
            </button>
            
            <button
              *ngIf="isAdmin()"
              (click)="goToList.emit(); toggleMobileMenu()"
              class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Ver Lista
            </button>
            
            <button
              (click)="logout.emit(); toggleMobileMenu()"
              [disabled]="isLoading"
              class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span *ngIf="!isLoading">Cerrar Sesión</span>
              <span *ngIf="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cerrando...
              </span>
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
  @Output() goToIndex = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  isAdmin(): boolean {
    return this.userData?.roleIds?.includes('admin_role') ?? false;
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