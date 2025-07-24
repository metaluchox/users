import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavComponent } from './nav.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [NavComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <app-nav 
        [title]="'Inicio'" 
        (goToProfile)="handleGoToProfile()"
        (logout)="handleLogout()">
      </app-nav>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenido al Index
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Esta es la página principal con soporte para temas claro, oscuro y sistema.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700/50 transition-colors duration-300">
                <div class="text-blue-600 dark:text-blue-400 mb-4">
                  <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rápido</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Interfaz optimizada para una experiencia fluida.</p>
              </div>
              
              <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700/50 transition-colors duration-300">
                <div class="text-green-600 dark:text-green-400 mb-4">
                  <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confiable</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Sistema robusto y estable para tus necesidades.</p>
              </div>
              
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700/50 transition-colors duration-300">
                <div class="text-purple-600 dark:text-purple-400 mb-4">
                  <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Moderno</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Diseño actual con las mejores prácticas.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class IndexComponent implements OnInit{

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  handleGoToProfile(): void {
    this.router.navigate(['/user']);
  }

  handleLogout(): void {
    console.log('Cerrando sesión');
    // Aquí puedes agregar la lógica de cerrar sesión
  }
  
}