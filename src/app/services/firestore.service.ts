import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, setDoc, getFirestore, updateDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { User as UserInterface } from '../components/user/user.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public app = initializeApp(environment.firebase);
  public firestore: Firestore = getFirestore(this.app);

  constructor() {}

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
        // Usuario nuevo, verificar si está permitido el registro
        const registrationAllowed = await this.isUserRegistrationAllowed();
        
        if (!registrationAllowed) {
          throw new Error('El registro de nuevos usuarios está deshabilitado. Solo usuarios registrados pueden acceder.');
        }

        // Crear nuevo usuario con estructura completa
        const newUser: UserInterface = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || '',
          phone: '',
          avatar: firebaseUser.photoURL || '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profileId: 'default_profile', // Asignar perfil por defecto
          roleIds: ['default_role'] // Asignar rol por defecto
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

  async handleUserLogin(user: User): Promise<void> {
    const userCollection = collection(this.firestore, 'user');
    const userDoc = doc(userCollection, user.uid);
    const userSnapshot = await getDoc(userDoc);
    const currentDate = new Date();

    if (userSnapshot.exists()) {
      // Usuario existente, actualizar último login
      await updateDoc(userDoc, {
        lastLogin: currentDate,
      });
    } else {
      // Usuario nuevo, verificar si está permitido el registro
      const registrationAllowed = await this.isUserRegistrationAllowed();
      
      if (!registrationAllowed) {
        throw new Error('El registro de nuevos usuarios está deshabilitado. Solo usuarios registrados pueden acceder.');
      }
      
      // Si está permitido, crear el usuario
      await setDoc(userDoc, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: currentDate,
        lastLogin: currentDate,
      });
    }
  }

  storeCompleteUserData(userInfo: UserInterface): void {
    try {
      // Almacenar información completa del usuario en localStorage
      localStorage.setItem('completeUserData', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error al almacenar datos completos del usuario:', error);
    }
  }

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

  // Métodos para manejar la configuración de registro de usuarios
  async setUserRegistrationConfig(allowRegistration: boolean, userEmail?: string): Promise<void> {
    try {
      const configDoc = doc(this.firestore, 'config', 'userRegistration');
      await setDoc(configDoc, {
        allowRegistration,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'unknown'
      });
    } catch (error) {
      console.error('Error al guardar configuración de registro:', error);
      throw error;
    }
  }

  async getUserRegistrationConfig(): Promise<boolean> {
    try {
      const configDoc = doc(this.firestore, 'config', 'userRegistration');
      const configSnapshot = await getDoc(configDoc);
      
      if (configSnapshot.exists()) {
        const data = configSnapshot.data();
        return data['allowRegistration'] ?? true; // Por defecto permitir registro
      } else {
        // Si no existe el documento, crear uno por defecto
        await this.setUserRegistrationConfig(true);
        return true;
      }
    } catch (error) {
      console.error('Error al obtener configuración de registro:', error);
      return true; // En caso de error, permitir registro por defecto
    }
  }

  async isUserRegistrationAllowed(): Promise<boolean> {
    return await this.getUserRegistrationConfig();
  }

  async getSpecialEmails(): Promise<string[]> {
    try {
      const configDoc = doc(this.firestore, 'config', 'specialEmails');
      const configSnapshot = await getDoc(configDoc);
      
      if (configSnapshot.exists()) {
        const data = configSnapshot.data();
        return data['emails'] || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error al obtener emails especiales:', error);
      return [];
    }
  }

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