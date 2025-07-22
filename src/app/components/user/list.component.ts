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
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
    
    /* Smooth hover effects for cards */
    .user-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* Gradient animation for buttons */
    .gradient-button {
      background-size: 200% 100%;
      transition: background-position 0.3s ease;
    }
    
    .gradient-button:hover {
      background-position: 100% 0;
    }
    
    /* Pulse animation for online indicator */
    .online-indicator {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
    
    /* Smooth backdrop blur transition */
    .backdrop-blur-card {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-500">
      <app-main-nav
        title="Lista de Usuarios"
        [userData]="userData"
        [isLoading]="isLoading"
        (goToProfile)="goToProfile()"
        (goToList)="goToProfile()"
        (logout)="logout()"
      ></app-main-nav>

      <!-- Add User Component -->
      <app-user-add 
        [show]="showCreateForm"
        (userCreated)="onUserCreated($event)"
        (cancelled)="onAddCancelled()">
      </app-user-add>

      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div class="w-full sm:w-auto">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white opacity-0 animate-fade-in-up" style="animation-delay: 0.1s">
              Gestión de Usuarios
            </h1>
            <p class="text-gray-600 dark:text-gray-400 opacity-0 animate-fade-in-up" style="animation-delay: 0.2s">
              Busca y administra usuarios del sistema
            </p>
          </div>
          <button
            (click)="showCreateForm = true"
            class="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 opacity-0 animate-fade-in-up flex items-center justify-center gap-2"
            style="animation-delay: 0.3s"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Agregar Usuario
          </button>
        </div>
      </div>

      <main class="max-w-7xl mx-auto pb-6 px-4 sm:px-6 lg:px-8">
        <div class="space-y-6">
          <!-- Search Form -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 opacity-0 animate-fade-in-up" style="animation-delay: 0.4s">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Buscar Usuarios</h2>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Buscar por email, nombre o teléfono..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-300 hover:shadow-md"
                  (keyup.enter)="searchUsers()"
                />
              </div>
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  (click)="searchUsers()"
                  [disabled]="isLoading || !searchTerm.trim()"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg *ngIf="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <div *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Buscar
                </button>
                <button
                  (click)="clearSearch()"
                  [disabled]="isLoading"
                  class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Limpiar
                </button>
              </div>
            </div>
          </div>
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col justify-center items-center py-16 opacity-0 animate-fade-in" style="animation-delay: 0.5s">
            <div class="relative">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900"></div>
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p class="mt-4 text-gray-600 dark:text-gray-400 font-medium animate-pulse">Buscando usuarios...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage && !isLoading" 
               class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl shadow-lg opacity-0 animate-fade-in-up flex items-center gap-3" style="animation-delay: 0.5s">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium">Error</p>
              <p class="text-sm opacity-90">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Users Grid -->
          <div *ngIf="!isLoading && !errorMessage" class="opacity-0 animate-fade-in-up" style="animation-delay: 0.6s">
            
            <!-- Desktop Table View -->
            <div class="hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Información
                      </th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr *ngFor="let user of users; let i = index" 
                        class="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 transform hover:scale-[1.02] opacity-0 animate-fade-in-up"
                        [style.animation-delay]="(0.7 + i * 0.1) + 's'">
                      <td class="px-6 py-6">
                        <div class="flex items-center space-x-4">
                          <div class="relative">
                            <div *ngIf="user.photoURL" class="h-12 w-12 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
                              <img [src]="user.photoURL" [alt]="user.displayName || user.email" 
                                   class="h-12 w-12 rounded-full object-cover transform hover:scale-110 transition-transform duration-300">
                            </div>
                            <div *ngIf="!user.photoURL" class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-indigo-500/20 transform hover:scale-110 transition-transform duration-300">
                              <span class="text-white text-sm font-semibold">
                                {{ getInitials(user.displayName || user.email) }}
                              </span>
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          </div>
                          <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {{ user.displayName || 'Sin nombre' }}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                            <p class="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">ID: {{ user.uid | slice:0:12 }}...</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-6">
                        <div class="space-y-1">
                          <div class="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            {{ user.email }}
                          </div>
                          <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            {{ user.phone || 'Sin teléfono' }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-6">
                        <span *ngIf="user.roleIds && user.roleIds.length > 0" 
                              class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800/20 dark:to-emerald-800/20 dark:text-green-300 shadow-sm">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          {{ user.roleIds.join(', ') }}
                        </span>
                        <span *ngIf="!user.roleIds || user.roleIds.length === 0" 
                              class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 dark:from-gray-700/50 dark:to-gray-600/50 dark:text-gray-400 shadow-sm">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                          </svg>
                          Sin rol
                        </span>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <button 
                          (click)="editUser(user)"
                          class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Editar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Mobile/Tablet Card View -->
            <div class="lg:hidden space-y-4">
              <div *ngFor="let user of users; let i = index" 
                   class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 opacity-0 animate-fade-in-up"
                   [style.animation-delay]="(0.7 + i * 0.1) + 's'">
                <div class="flex items-start space-x-4">
                  <div class="relative flex-shrink-0">
                    <div *ngIf="user.photoURL" class="h-16 w-16 rounded-full overflow-hidden ring-3 ring-indigo-500/20">
                      <img [src]="user.photoURL" [alt]="user.displayName || user.email" 
                           class="h-16 w-16 rounded-full object-cover">
                    </div>
                    <div *ngIf="!user.photoURL" class="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-3 ring-indigo-500/20">
                      <span class="text-white text-lg font-semibold">
                        {{ getInitials(user.displayName || user.email) }}
                      </span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-800"></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="min-w-0 flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {{ user.displayName || 'Sin nombre' }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                      </div>
                      <button 
                        (click)="editUser(user)"
                        class="ml-2 inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Editar
                      </button>
                    </div>
                    
                    <div class="mt-4 space-y-2">
                      <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        {{ user.phone || 'Sin teléfono' }}
                      </div>
                      
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span *ngIf="user.roleIds && user.roleIds.length > 0" 
                              class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800/20 dark:to-emerald-800/20 dark:text-green-300">
                          {{ user.roleIds.join(', ') }}
                        </span>
                        <span *ngIf="!user.roleIds || user.roleIds.length === 0" 
                              class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 dark:from-gray-700/50 dark:to-gray-600/50 dark:text-gray-400">
                          Sin rol
                        </span>
                      </div>
                      
                      <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-xs font-mono text-gray-400 dark:text-gray-500">ID: {{ user.uid | slice:0:16 }}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="users.length === 0 && !isLoading" class="text-center py-16 opacity-0 animate-fade-in-up" style="animation-delay: 0.6s">
              <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12">
                <div class="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  <svg class="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="text-gray-600 dark:text-gray-400 space-y-2">
                  <h3 *ngIf="!hasSearched" class="text-xl font-semibold text-gray-900 dark:text-gray-100">Busca usuarios</h3>
                  <p *ngIf="!hasSearched" class="text-gray-600 dark:text-gray-400">Utiliza el buscador para encontrar usuarios por email, nombre o teléfono</p>
                  
                  <h3 *ngIf="hasSearched" class="text-xl font-semibold text-gray-900 dark:text-gray-100">No hay resultados</h3>
                  <p *ngIf="hasSearched" class="text-gray-600 dark:text-gray-400">No se encontraron usuarios con los criterios de búsqueda. Intenta con términos diferentes.</p>
                </div>
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
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  users: User[] = [];
  userData: User | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  showCreateForm: boolean = false;
  searchTerm: string = '';
  hasSearched: boolean = false;

  ngOnInit() {
    // Cargar datos del usuario en sesión
    this.userData = this.firebaseService.getCompleteUserData();
    if (!this.userData) {
      this.router.navigate(['/login']);
    }
  }

  async searchUsers() {
    if (!this.searchTerm.trim()) {
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
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

  goBack() {
    this.router.navigate(['/user']);
  }

  goToProfile() {
    this.router.navigate(['/user']);
  }

  async logout() {
    try {
      await this.firebaseService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      this.router.navigate(['/login']);
    }
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