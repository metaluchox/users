import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Signal para el tema actual
  public currentTheme = signal<Theme>(this.getInitialTheme());
  
  constructor() {
    // Effect que se ejecuta cuando cambia el tema
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });
    
    // Escuchar cambios en el sistema
    this.listenToSystemTheme();
  }

  /**
   * Obtiene el tema inicial desde localStorage o sistema
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    
    return 'system';
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // Usar preferencia del sistema
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      // Usar tema específico
      root.classList.add(theme);
    }
    
    // También agregar la clase dark a la raíz para Tailwind CSS
    if (this.isDarkMode()) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Guarda el tema en localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Escucha cambios en la preferencia del sistema
   */
  private listenToSystemTheme(): void {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  /**
   * Cambia el tema
   */
  public setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Alterna entre light y dark (no incluye system)
   */
  public toggleTheme(): void {
    const current = this.currentTheme();
    if (current === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Verifica si el modo actual es oscuro
   */
  public isDarkMode(): boolean {
    const theme = this.currentTheme();
    
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // Si es 'system', verificar preferencia del sistema
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Obtiene el tema actual como string
   */
  public getCurrentTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Obtiene el tema efectivo (resuelve 'system' al tema real)
   */
  public getEffectiveTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}