import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly keyName = environment.encryptationDataKey;

  constructor() {}

  /**
   * Genera o recupera la clave de encriptación
   */
  private async getOrCreateKey(): Promise<CryptoKey> {
    // Intentar recuperar clave existente desde sessionStorage
    const existingKey = sessionStorage.getItem(this.keyName);
    
    if (existingKey) {
      try {
        const keyData = JSON.parse(existingKey);
        return await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        console.warn('Error al importar clave existente, generando nueva:', error);
      }
    }

    // Generar nueva clave si no existe o falló la importación
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Exportar y guardar la clave en sessionStorage
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    sessionStorage.setItem(this.keyName, JSON.stringify(Array.from(new Uint8Array(exportedKey))));

    return key;
  }

  /**
   * Encripta datos usando AES-256-GCM
   * @param data - Datos a encriptar (será convertido a JSON)
   * @returns Promise<string> - Datos encriptados en base64
   */
  async encrypt(data: any): Promise<string> {
    try {
      const key = await this.getOrCreateKey();
      const jsonData = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataToEncrypt = encoder.encode(jsonData);

      // Generar IV aleatorio de 12 bytes para AES-GCM
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encriptar los datos
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataToEncrypt
      );

      // Combinar IV + datos encriptados
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Convertir a base64 para almacenamiento
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Error al encriptar datos:', error);
      throw new Error('Fallo en la encriptación de datos');
    }
  }

  /**
   * Desencripta datos usando AES-256-GCM
   * @param encryptedData - Datos encriptados en base64
   * @returns Promise<any> - Datos originales parseados desde JSON
   */
  async decrypt(encryptedData: string): Promise<any> {
    try {
      const key = await this.getOrCreateKey();
      
      // Decodificar desde base64
      const combined = new Uint8Array(
        Array.from(atob(encryptedData), c => c.charCodeAt(0))
      );

      // Extraer IV (primeros 12 bytes) y datos encriptados
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Desencriptar
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );

      // Convertir bytes a string y parsear JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error al desencriptar datos:', error);
      throw new Error('Fallo en la desencriptación de datos');
    }
  }

  /**
   * Almacena datos encriptados en localStorage
   * @param key - Clave para localStorage
   * @param data - Datos a encriptar y almacenar
   */
  async setEncryptedItem(key: string, data: any): Promise<void> {
    try {
      const encryptedData = await this.encrypt(data);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('Error al almacenar datos encriptados:', error);
      throw error;
    }
  }

  /**
   * Recupera y desencripta datos desde localStorage
   * @param key - Clave de localStorage
   * @returns Promise<any | null> - Datos desencriptados o null si no existen
   */
  async getEncryptedItem(key: string): Promise<any | null> {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) {
        return null;
      }
      
      return await this.decrypt(encryptedData);
    } catch (error) {
      console.error('Error al recuperar datos encriptados:', error);
      // En caso de error, limpiar datos corruptos
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Elimina datos encriptados de localStorage
   * @param key - Clave de localStorage
   */
  removeEncryptedItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpia la clave de encriptación (forzar regeneración en próximo uso)
   */
  clearEncryptionKey(): void {
    sessionStorage.removeItem(this.keyName);
  }
}