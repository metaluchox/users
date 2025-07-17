import { Injectable, inject } from '@angular/core';
import { doc, getDoc, setDoc, getFirestore, updateDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { User as UserInterface } from '../components/user/user.interface';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private authService = inject(FirebaseAuthService);
  public firestore: Firestore = getFirestore(this.authService.app);

  constructor() {}

  // Obtiene o crea la información del usuario en Firestore
  async getOrCreateUserInfo(firebaseUser: User): Promise<UserInterface> {
    try {
      // Verificar si el usuario ya existe en la base de datos
      const userDoc = doc(this.firestore, 'users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        // Usuario existente, obtener información completa
        const existingUser = userSnapshot.data() as UserInterface;
        
        // Actualizar último login
        const updatedUser = {
          ...existingUser,
          updatedAt: new Date()
        };
        
        await updateDoc(userDoc, {
          updatedAt: updatedUser.updatedAt
        });

        console.log('Usuario existente encontrado:', existingUser.email);
        return updatedUser;
      } else {
        // Usuario nuevo, crear y guardar en Firestore
        const newUser: UserInterface = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          roleIds: ['default_role']
        };

        // Guardar en Firestore
        await setDoc(userDoc, newUser);
        
        console.log('Nuevo usuario creado:', newUser.email);
        return newUser;
      }
    } catch (error) {
      console.error('Error al obtener o crear información del usuario:', error);
      throw error;
    }
  }


  // Almacena datos completos del usuario en localStorage
  storeCompleteUserData(userInfo: UserInterface): void {
    try {
      // Almacenar información completa del usuario en localStorage
      localStorage.setItem('completeUserData', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error al almacenar datos completos del usuario:', error);
    }
  }

  // Recupera datos completos del usuario desde localStorage
  getCompleteUserData(): UserInterface | null {
    try {
      const userDataString = localStorage.getItem('completeUserData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Convertir fechas de string a Date
        userData.createdAt = new Date(userData.createdAt);
        userData.updatedAt = new Date(userData.updatedAt);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos completos del usuario:', error);
      return null;
    }
  }


  // Actualiza datos del usuario en Firestore
  async updateUser(uid: string, userData: Partial<UserInterface>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      await updateDoc(userDoc, {
        ...userData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Obtiene usuario por ID desde Firestore
  async getUserById(uid: string): Promise<UserInterface | null> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as UserInterface;
        // Convertir fechas de Timestamp a Date si es necesario
        userData.createdAt = new Date(userData.createdAt);
        userData.updatedAt = new Date(userData.updatedAt);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }
}