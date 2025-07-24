import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export interface CloudinaryDeleteResponse {
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private config: CloudinaryConfig;
  private baseUrl: string;
  private http = inject(HttpClient);

  constructor() {
    // Configuración desde environment.ts
    this.config = {
      cloudName: environment.cloudinary.cloudName,
      apiKey: environment.cloudinary.apiKey,
      apiSecret: environment.cloudinary.apiSecret,
      uploadPreset: environment.cloudinary.uploadPreset
    };
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}`;
  }

  /**
   * Configura las credenciales de Cloudinary
   */
  setConfig(config: CloudinaryConfig): void {
    this.config = config;
    this.baseUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}`;
  }

  /**
   * Sube una imagen a Cloudinary usando upload preset (unsigned)
   */
  uploadImage(file: File, options?: {
    folder?: string;
    public_id?: string;
    tags?: string[];
    transformation?: string;
  }): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Usar upload preset desde environment
    if (this.config.uploadPreset) {
      formData.append('upload_preset', this.config.uploadPreset);
    }
    
    // Carpeta por defecto "users" si no se especifica otra
    const targetFolder = options?.folder || 'users';
    formData.append('folder', targetFolder);
    
    // Otras opciones
    if (options?.public_id) {
      formData.append('public_id', options.public_id);
    }
    if (options?.tags) {
      formData.append('tags', options.tags.join(','));
    }

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/image/upload`,
      formData
    );
  }

  /**
   * Método simple: sube imagen y devuelve solo la URL pública
   */
  uploadImageAndGetUrl(file: File, options?: {
    folder?: string;
    userId?: string;
  }): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Usar upload preset desde environment
    if (this.config.uploadPreset) {
      formData.append('upload_preset', this.config.uploadPreset);
    }
    
    // Carpeta por defecto "users" si no se especifica otra
    const targetFolder = options?.folder || 'users';
    formData.append('folder', targetFolder);
    
    // Si se proporciona userId, usar el UID como public_id (se agregará automáticamente la extensión)
    if (options?.userId) {
      formData.append('public_id', options.userId);
    }

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/image/upload`,
      formData
    ).pipe(
      map(response => response.secure_url) // Solo devolver la URL segura
    );
  }

  /**
   * Sube una imagen con firma (signed upload) - más seguro
   */
  uploadImageSigned(file: File, options?: {
    folder?: string;
    public_id?: string;
    tags?: string[];
  }): Observable<CloudinaryUploadResponse> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', this.config.apiKey);
    
    // Opciones adicionales
    const params: any = { timestamp };
    if (options?.folder) {
      formData.append('folder', options.folder);
      params.folder = options.folder;
    }
    if (options?.public_id) {
      formData.append('public_id', options.public_id);
      params.public_id = options.public_id;
    }
    if (options?.tags) {
      formData.append('tags', options.tags.join(','));
      params.tags = options.tags.join(',');
    }

    // Generar firma (esto debería hacerse en el backend por seguridad)
    const signature = this.generateSignature(params);
    formData.append('signature', signature);

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/image/upload`,
      formData
    );
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  deleteImage(publicId: string): Observable<CloudinaryDeleteResponse> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const formData = new FormData();
    
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', this.config.apiKey);
    
    const signature = this.generateSignature({
      public_id: publicId,
      timestamp
    });
    formData.append('signature', signature);

    return this.http.post<CloudinaryDeleteResponse>(
      `${this.baseUrl}/image/destroy`,
      formData
    );
  }

  /**
   * Obtiene información de una imagen
   */
  getImageInfo(publicId: string): Observable<any> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = this.generateSignature({
      public_id: publicId,
      timestamp
    });

    const params = {
      public_id: publicId,
      timestamp: timestamp.toString(),
      api_key: this.config.apiKey,
      signature
    };

    return this.http.get(`${this.baseUrl}/image/upload`, { params });
  }

  /**
   * Genera URL de imagen con transformaciones
   */
  generateImageUrl(publicId: string, transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    effect?: string;
  }): string {
    let url = `https://res.cloudinary.com/${this.config.cloudName}/image/upload/`;
    
    if (transformations) {
      const transforms: string[] = [];
      
      if (transformations.width) transforms.push(`w_${transformations.width}`);
      if (transformations.height) transforms.push(`h_${transformations.height}`);
      if (transformations.crop) transforms.push(`c_${transformations.crop}`);
      if (transformations.quality) transforms.push(`q_${transformations.quality}`);
      if (transformations.format) transforms.push(`f_${transformations.format}`);
      if (transformations.effect) transforms.push(`e_${transformations.effect}`);
      
      if (transforms.length > 0) {
        url += transforms.join(',') + '/';
      }
    }
    
    return url + publicId;
  }

  /**
   * Getter para acceder al cloud name desde componentes
   */
  get cloudName(): string {
    return this.config.cloudName;
  }

  /**
   * Lista imágenes en una carpeta
   */
  listImages(folder?: string, maxResults: number = 10): Observable<any> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: any = {
      timestamp: timestamp.toString(),
      api_key: this.config.apiKey,
      max_results: maxResults.toString()
    };

    if (folder) {
      params.prefix = folder;
    }

    const signature = this.generateSignature(params);
    params.signature = signature;

    return this.http.get(`${this.baseUrl}/resources/image`, { params });
  }

  /**
   * Genera firma para requests autenticados
   * NOTA: En producción, esto debería hacerse en el backend por seguridad
   */
  private generateSignature(params: any): string {
    // Ordenar parámetros alfabéticamente
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // En una implementación real, usarías crypto para generar el SHA-1
    // Por ahora retornamos un placeholder
    // return crypto.createHash('sha1').update(sortedParams + this.config.apiSecret).digest('hex');
    
    console.warn('Signature generation should be implemented in backend for security');
    return 'placeholder_signature';
  }
}