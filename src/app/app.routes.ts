import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadChildren: () => import('./components/login/login.routes').then(m => m.routes)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/login/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'recovery-pass',
        loadComponent: () => import('./components/login/recovery-pass.component').then(m => m.RecoveryPassComponent)
    },
    {
        path: 'index',
        loadChildren: () => import('./components/index/index.routes').then(m => m.routes),
        canActivate: [authGuard]
    },
    {
        path: 'user',
        loadChildren: () => import('./components/user/user.routes').then(m => m.routes),
        canActivate: [authGuard]
    }
];
