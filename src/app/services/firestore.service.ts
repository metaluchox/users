import { Injectable, inject } from '@angular/core';
import { doc, getDoc, setDoc, getFirestore, updateDoc, Firestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { User as UserInterface } from '../components/user/user.interface';
import { FirebaseAuthService } from './firebase-auth.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private authService = inject(FirebaseAuthService);
  private loading = inject(LoadingService);
  public firestore: Firestore = getFirestore(this.authService.app);

  constructor() {}

  // Obtiene o crea la información del usuario en Firestore
  async getOrCreateUserInfo(firebaseUser: User): Promise<UserInterface> {
    try {
      this.loading.start();
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
        this.loading.stop();
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
        this.loading.stop();
        return newUser;
      }
    } catch (error) {
      this.loading.stop();
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
      this.loading.start();
      const userDoc = doc(this.firestore, 'users', uid);
      await updateDoc(userDoc, {
        ...userData,
        updatedAt: new Date()
      });
      this.loading.stop();
    } catch (error) {
      this.loading.stop();
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Obtiene usuario por ID desde Firestore
  async getUserById(uid: string): Promise<UserInterface | null> {
    try {
      this.loading.start();
      const userDoc = doc(this.firestore, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as UserInterface;
        // Convertir fechas de Timestamp a Date si es necesario
        userData.createdAt = new Date(userData.createdAt);
        userData.updatedAt = new Date(userData.updatedAt);
        this.loading.stop();
        return userData;
      }
      this.loading.stop();
      return null;
    } catch (error) {
      this.loading.stop();
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }

  // Obtiene todos los usuarios desde Firestore (requiere permisos de admin)
  async getAllUsers(): Promise<UserInterface[]> {
    try {
      this.loading.start();
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const users: UserInterface[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as UserInterface;
        // Convertir fechas de Timestamp a Date si es necesario
        userData.createdAt = new Date(userData.createdAt);
        userData.updatedAt = new Date(userData.updatedAt);
        users.push(userData);
      });
      
      this.loading.stop();
      return users;
    } catch (error) {
      this.loading.stop();
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  // Crear nuevo usuario en Firestore
  async createUser(userData: Omit<UserInterface, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserInterface> {
    try {
      this.loading.start();
      const newUser: Omit<UserInterface, 'uid'> = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.firestore, 'users'), newUser);
      
      const createdUser: UserInterface = {
        ...newUser,
        uid: docRef.id
      };

      // Actualizar el documento con el uid generado
      await updateDoc(docRef, { uid: docRef.id });

      this.loading.stop();
      return createdUser;
    } catch (error) {
      this.loading.stop();
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Busca usuarios por email, nombre o teléfono
  async searchUsers(searchTerm: string): Promise<UserInterface[]> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }

      this.loading.start();
      const usersCollection = collection(this.firestore, 'users');
      const users: UserInterface[] = [];
      
      // Como Firestore no soporta búsqueda por texto completo, obtenemos todos los usuarios y filtramos
      const usersSnapshot = await getDocs(usersCollection);
      
      const searchLower = searchTerm.toLowerCase().trim();
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as UserInterface;
        userData.createdAt = new Date(userData.createdAt);
        userData.updatedAt = new Date(userData.updatedAt);
        
        // Buscar en email, displayName y phone
        const email = (userData.email || '').toLowerCase();
        const displayName = (userData.displayName || '').toLowerCase();
        const phone = (userData.phone || '').toLowerCase();
        
        if (email.includes(searchLower) || 
            displayName.includes(searchLower) || 
            phone.includes(searchLower)) {
          users.push(userData);
        }
      });
      
      this.loading.stop();
      return users;
    } catch (error) {
      this.loading.stop();
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  // Método helper para hacer un usuario administrador (solo para development/setup)
  async makeUserAdmin(uid: string): Promise<void> {
    try {
      this.loading.start();
      const userDoc = doc(this.firestore, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (!userSnapshot.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = userSnapshot.data() as UserInterface;
      const currentRoles = userData.roleIds || [];
      
      if (!currentRoles.includes('admin_role')) {
        const updatedRoles = [...currentRoles, 'admin_role'];
        await updateDoc(userDoc, {
          roleIds: updatedRoles,
          updatedAt: new Date()
        });
        console.log(`Usuario ${uid} ahora tiene permisos de administrador`);
      }
      this.loading.stop();
    } catch (error) {
      this.loading.stop();
      console.error('Error al hacer usuario administrador:', error);
      throw error;
    }
  }
}