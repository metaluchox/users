import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <style>
      @keyframes icon-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(180deg); }
      }
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes bounce-in {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      .icon-transition {
        transition: all 0.3s ease-in-out;
      }
      .icon-rotate {
        animation: icon-rotate 0.5s ease-in-out;
      }
      .dropdown-enter {
        animation: slide-up 0.2s ease-out;
      }
      .check-bounce {
        animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    </style>
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
        [attr.aria-label]="'Cambiar tema actual: ' + getCurrentThemeLabel()"
      >
        <!-- Sol (Light) -->
        <svg 
          *ngIf="themeService.getEffectiveTheme() === 'light'" 
          class="w-5 h-5 text-gray-700 dark:text-gray-300 icon-transition hover:text-yellow-500 dark:hover:text-yellow-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
        
        <!-- Luna (Dark) -->
        <svg 
          *ngIf="themeService.getEffectiveTheme() === 'dark'" 
          class="w-5 h-5 text-gray-700 dark:text-gray-300 icon-transition hover:text-purple-500 dark:hover:text-purple-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div 
        *ngIf="showDropdown" 
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 dropdown-enter"
      >
        <div class="py-1">
          <button
            *ngFor="let option of themeOptions"
            (click)="selectTheme(option.value)"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-all duration-150 hover:scale-[1.02] hover:pl-5"
            [class.bg-gray-100]="themeService.getCurrentTheme() === option.value && themeService.getEffectiveTheme() === 'light'"
            [class.dark:bg-gray-700]="themeService.getCurrentTheme() === option.value && themeService.getEffectiveTheme() === 'dark'"
          >
            <div class="flex items-center">
              <!-- Light theme icon -->
              <svg *ngIf="option.value === 'light'" class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
              <!-- Dark theme icon -->
              <svg *ngIf="option.value === 'dark'" class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <!-- System theme icon -->
              <svg *ngIf="option.value === 'system'" class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
              </svg>
              {{ option.label }}
            </div>
            <svg 
              *ngIf="themeService.getCurrentTheme() === option.value" 
              class="w-4 h-4 text-indigo-600 dark:text-indigo-400 check-bounce" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar dropdown -->
    <div 
      *ngIf="showDropdown" 
      class="fixed inset-0 z-40" 
      (click)="closeDropdown()"
    ></div>
  `
})
export class ThemeToggleComponent {
  public themeService = inject(ThemeService);
  public showDropdown = false;

  public themeOptions = [
    {
      value: 'light' as Theme,
      label: 'Claro'
    },
    {
      value: 'dark' as Theme,
      label: 'Oscuro'
    },
    {
      value: 'system' as Theme,
      label: 'Sistema'
    }
  ];

  public toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    // Trigger icon rotation animation
    if (this.showDropdown) {
      const icons = document.querySelectorAll('.icon-transition');
      icons.forEach(icon => {
        icon.classList.add('icon-rotate');
        setTimeout(() => icon.classList.remove('icon-rotate'), 500);
      });
    }
  }

  public closeDropdown(): void {
    this.showDropdown = false;
  }

  public selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.closeDropdown();
  }

  public getCurrentThemeLabel(): string {
    const currentTheme = this.themeService.getCurrentTheme();
    const option = this.themeOptions.find(opt => opt.value === currentTheme);
    return option ? option.label : 'Desconocido';
  }
}