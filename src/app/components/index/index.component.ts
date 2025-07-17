import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-index',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-blue-800 mb-4">Hola mundo</h1>
          <p class="text-red-600">Bienvenido a la aplicacion</p>
        </div>
      </div>
    </div>
  `
})
export class IndexComponent implements OnInit{


  ngOnInit(): void {
  }
  
}