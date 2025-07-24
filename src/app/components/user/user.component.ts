import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { User as UserInterface } from './user.interface';
import { MainNavComponent } from '../shared/main-nav.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainNavComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <app-main-nav
        [title]="isEditingOtherUser ? 'Editar Usuario' : 'Usuario'"
        [userData]="userData"
        [isLoading]="isLoading"
        (goToProfile)="goToIndex()"
        (goToList)="goToList()"
        (logout)="logout()"
      ></app-main-nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Formulario de Actualización de Perfil -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ isEditingOtherUser ? 'Editar Usuario' : 'Actualizar Perfil' }}
                </h3>
                <!-- Vista previa de la imagen -->
                <div *ngIf="profileForm.get('photoURL')?.value && profileForm.get('photoURL')?.valid">
                  <img 
                    [src]="profileForm.get('photoURL')?.value" 
                    alt="Vista previa"
                    class="h-12 w-12 rounded-full object-cover"
                    (error)="onImageError($event)"
                  />
                </div>
              </div>              
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
(input)="formatPhoneInput($event)"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+56 9 1234 5678"
                  />
                  <div *ngIf="profileForm.get('phone')?.touched && profileForm.get('phone')?.errors?.['invalidChilePhone']" 
                       class="text-red-600 text-sm mt-1">
                    Ingrese un número de teléfono chileno válido: +56 9 seguido de 8 dígitos
                  </div>
                </div>

                <!-- URL de Foto -->
                <div>
                  <label for="photoURL" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de la foto de perfil
                  </label>
                  <div class="flex space-x-2">
                    <input
                      type="url"
                      id="photoURL"
                      formControlName="photoURL"
                      class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://ejemplo.com/tu-foto.jpg"
                    />
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      class="hidden"
                      (change)="onImageUpload($event)"
                    />
                    <button
                      type="button"
                      (click)="triggerImageUpload()"
                      class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                      title="Subir imagen"
                    >
                      📷 Subir
                    </button>
                  </div>
                  <div *ngIf="profileForm.get('photoURL')?.touched && profileForm.get('photoURL')?.errors?.['pattern']" 
                       class="text-red-600 text-sm mt-1">
                    URL inválida
                  </div>
                  <div *ngIf="uploadMessage" class="mt-2 p-2 rounded-md text-sm" 
                       [class.bg-green-100]="uploadMessage.type === 'success'"
                       [class.text-green-800]="uploadMessage.type === 'success'"
                       [class.bg-red-100]="uploadMessage.type === 'error'"
                       [class.text-red-800]="uploadMessage.type === 'error'"
                       [class.bg-blue-100]="uploadMessage.type === 'info'"
                       [class.text-blue-800]="uploadMessage.type === 'info'">
                    {{ uploadMessage.text }}
                  </div>
                </div>

                <!-- Botones -->
                <div class="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || isUpdating"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <span *ngIf="!isUpdating">{{ isEditingOtherUser ? 'Guardar Cambios' : 'Actualizar Perfil' }}</span>
                    <span *ngIf="isUpdating">{{ isEditingOtherUser ? 'Guardando...' : 'Actualizando...' }}</span>
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
  private cloudinaryService = inject(CloudinaryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  userData: UserInterface | null = null;
  editingUser: UserInterface | null = null;
  isEditingOtherUser: boolean = false;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  updateMessage: { type: 'success' | 'error', text: string } | null = null;
  uploadMessage: { type: 'success' | 'error' | 'info', text: string } | null = null;

  profileForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [this.chilePhoneValidator]],
    photoURL: ['', [Validators.pattern(/^https?:\/\/.+/i)]]
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['uid']) {
        this.loadUserForEdit(params['uid']);
      } else {
        this.loadUserData();
      }
    });
  }

  // Carga datos del usuario desde localStorage o Firestore
  loadUserData() {
    // Get complete user data from localStorage (usuario en sesión)
    this.userData = this.firebaseService.getCompleteUserData();
    this.isEditingOtherUser = false;
    this.editingUser = null;
    
    if (this.userData) {
      this.initializeForm();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Carga datos del usuario específico para editar
  async loadUserForEdit(uid: string) {
    try {
      this.isLoading = true;
      
      // Cargar usuario en sesión para validaciones
      this.userData = this.firebaseService.getCompleteUserData();
      if (!this.userData) {
        this.router.navigate(['/login']);
        return;
      }

      // Cargar usuario a editar
      this.editingUser = await this.firebaseService.getUserById(uid);
      
      if (this.editingUser) {
        this.isEditingOtherUser = true;
        this.initializeForm();
      } else {
        this.updateMessage = {
          type: 'error',
          text: 'Usuario no encontrado'
        };
        setTimeout(() => {
          this.router.navigate(['/user/list']);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading user for edit:', error);
      this.updateMessage = {
        type: 'error',
        text: 'Error al cargar el usuario'
      };
    } finally {
      this.isLoading = false;
    }
  }

  // Inicializa el formulario con los datos actuales del usuario
  initializeForm() {
    const userToEdit = this.isEditingOtherUser ? this.editingUser : this.userData;
    if (userToEdit) {
      this.profileForm.patchValue({
        displayName: userToEdit.displayName || '',
        phone: userToEdit.phone || '',
        photoURL: userToEdit.photoURL || ''
      });
    }
  }


  // Actualiza el perfil del usuario
  async updateProfile() {
    const userToUpdate = this.isEditingOtherUser ? this.editingUser : this.userData;
    if (this.profileForm.valid && userToUpdate) {
      try {
        this.isUpdating = true;
        this.updateMessage = null;

        const formData = this.profileForm.value;
        
        // Crear objeto con solo los campos que se van a actualizar
        const updateData: Partial<UserInterface> = {
          updatedAt: new Date()
        };

        // Solo incluir campos que tienen valor, o eliminar si están vacíos
        if (formData.displayName !== undefined) {
          updateData.displayName = formData.displayName.trim() || '';
        }
        if (formData.phone !== undefined) {
          updateData.phone = formData.phone.trim() || '';
        }
        if (formData.photoURL !== undefined) {
          updateData.photoURL = formData.photoURL.trim() || '';
        }

        // Actualizar en Firestore
        await this.firebaseService.updateUser(userToUpdate.uid, updateData);

        // Crear objeto completo para actualizar referencias locales
        const updatedUserData = {
          ...userToUpdate,
          ...updateData
        };
        
        // Si estamos editando nuestro propio perfil, actualizar localStorage
        if (!this.isEditingOtherUser) {
          localStorage.setItem('completeUserData', JSON.stringify(updatedUserData));
          this.userData = updatedUserData;
        } else {
          // Si estamos editando otro usuario, actualizar la referencia local
          this.editingUser = updatedUserData;
        }

        this.updateMessage = {
          type: 'success',
          text: this.isEditingOtherUser ? 'Usuario actualizado exitosamente en Firestore' : 'Perfil actualizado exitosamente en Firestore'
        };

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          this.updateMessage = null;
        }, 3000);

      } catch (error) {
        console.error('Error updating user in Firestore:', error);
        this.updateMessage = {
          type: 'error',
          text: 'Error al actualizar en Firestore. Verifica tu conexión e inténtalo de nuevo.'
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

  // Activa el input de archivo
  triggerImageUpload() {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput?.click();
  }

  // Maneja la subida de imagen
  onImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.uploadMessage = {
        type: 'error',
        text: 'Por favor selecciona un archivo de imagen válido'
      };
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.uploadMessage = {
        type: 'error',
        text: 'La imagen debe ser menor a 5MB'
      };
      return;
    }

    this.uploadMessage = {
      type: 'info',
      text: 'Subiendo imagen a Cloudinary...'
    };

    // Obtener userId para crear un identificador único
    const currentUser = this.isEditingOtherUser ? this.editingUser : this.userData;
    const userId = currentUser?.uid || 'user';

    // Subir imagen a Cloudinary
    this.cloudinaryService.uploadImageAndGetUrl(file, {
      folder: 'users',
      userId: userId
    }).subscribe({
      next: (imageUrl: string) => {
        // Actualizar el formulario con la URL de Cloudinary
        this.profileForm.patchValue({
          photoURL: imageUrl
        });
        
        this.uploadMessage = {
          type: 'success',
          text: 'Imagen subida a Cloudinary exitosamente'
        };

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          this.uploadMessage = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error uploading to Cloudinary:', error);
        let errorMessage = 'Error al subir imagen a Cloudinary.';
        
        if (error.error && error.error.error && error.error.error.message) {
          errorMessage = `Error: ${error.error.error.message}`;
        } else if (error.status === 400) {
          errorMessage = 'Error 400: Verifica el upload preset en Cloudinary.';
        }
        
        this.uploadMessage = {
          type: 'error',
          text: errorMessage
        };
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.uploadMessage = null;
        }, 5000);
      }
    });
  }

  // Redirige al perfil del usuario en sesión
  goToIndex() {
    this.router.navigate(['/user']);
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

  // Validador personalizado para números de teléfono chilenos
  chilePhoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null; // Campo opcional
    }
    
    const phoneNumber = control.value.replace(/\s/g, ''); // Remover espacios
    const chilePhonePattern = /^\+569\d{8}$/; // +569 seguido de exactamente 8 dígitos
    
    // Verificar que tenga exactamente el formato correcto
    // +569XXXXXXXX debe tener exactamente 13 caracteres (sin espacios)
    if (!chilePhonePattern.test(phoneNumber)) {
      return { invalidChilePhone: true };
    }
    
    return null;
  }

  // Formatea el input de teléfono automáticamente mientras se escribe
  formatPhoneInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Solo números
    
    // Limitar a máximo 11 dígitos (569 + 8 dígitos del número)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    let formattedValue = '';
    
    if (value.length === 0) {
      formattedValue = '';
    } else {
      // Siempre empezar con +56 9
      if (value.startsWith('569')) {
        // Si el usuario escribió 569..., tomar solo los 8 dígitos siguientes
        const phoneDigits = value.substring(3).substring(0, 8);
        formattedValue = '+56 9 ' + this.formatNumberGroup(phoneDigits);
      } else if (value.startsWith('56')) {
        const remaining = value.substring(2);
        if (remaining.startsWith('9')) {
          // Si escribió 569..., tomar los siguientes 8 dígitos
          const phoneDigits = remaining.substring(1).substring(0, 8);
          formattedValue = '+56 9 ' + this.formatNumberGroup(phoneDigits);
        } else {
          // Si escribió 56 pero no sigue con 9, agregar el 9 y usar los dígitos
          const phoneDigits = remaining.substring(0, 8);
          formattedValue = '+56 9 ' + this.formatNumberGroup(phoneDigits);
        }
      } else if (value.startsWith('9')) {
        // Si empezó con 9, tomar los siguientes 8 dígitos
        const phoneDigits = value.substring(1).substring(0, 8);
        formattedValue = '+56 9 ' + this.formatNumberGroup(phoneDigits);
      } else {
        // Para cualquier otro caso, agregar el prefijo y limitar a 8 dígitos
        const phoneDigits = value.substring(0, 8);
        formattedValue = '+56 9 ' + this.formatNumberGroup(phoneDigits);
      }
    }
    
    // Actualizar el valor del input y del form control
    input.value = formattedValue;
    this.profileForm.get('phone')?.setValue(formattedValue, { emitEvent: false });
  }

  // Ayuda a formatear grupos de números (ej: 1234 5678)
  private formatNumberGroup(numbers: string): string {
    if (numbers.length === 0) {
      return '';
    }
    if (numbers.length <= 4) {
      return numbers;
    } else {
      return numbers.substring(0, 4) + ' ' + numbers.substring(4, 8);
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