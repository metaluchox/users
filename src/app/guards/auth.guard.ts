import {CanActivateFn, Router, ActivatedRouteSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {take, switchMap} from 'rxjs';
import {of} from 'rxjs';
import {environment} from '../../environments/environment';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const firebaseService = inject(FirebaseService);

  console.log('🔒 AUTH GUARD - Ruta accedida:', route.routeConfig?.path);

  if(!environment.guards){
    console.log('🔒 AUTH GUARD - Guards deshabilitados en environment');
    return true;
  }

  // Rutas que requieren rol de administrador
  const adminRequiredRoutes = ['list', 'edit'];
  const currentRoute = route.routeConfig?.path || '';
  const requiresAdmin = adminRequiredRoutes.some(adminRoute => 
    currentRoute === adminRoute || currentRoute.startsWith(adminRoute + '/')
  );

  console.log('🔒 AUTH GUARD - Ruta actual:', currentRoute);
  console.log('🔒 AUTH GUARD - Requiere admin:', requiresAdmin);

  return firebaseService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      const isAuthenticated = !!user;
      console.log('🔒 AUTH GUARD - Usuario autenticado:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('🔒 AUTH GUARD - Acceso denegado: Usuario no autenticado');
        return of(router.createUrlTree(['/']));
      }

      // Si la ruta requiere permisos de admin, verificar el rol
      if (requiresAdmin) {
        console.log('🔒 AUTH GUARD - Verificando permisos de administrador...');
        return firebaseService.getCompleteUserData().then(userData => {
          console.log('🔒 AUTH GUARD - Datos del usuario:', userData);
          console.log('🔒 AUTH GUARD - Roles del usuario:', userData?.roleIds);
          
          if (!userData || !userData.roleIds || !userData.roleIds.includes('admin_role')) {
            console.log('🔒 AUTH GUARD - Acceso denegado: Se requieren permisos de administrador');
            console.log('🔒 AUTH GUARD - Roles requeridos: admin_role');
            console.log('🔒 AUTH GUARD - Roles actuales:', userData?.roleIds || 'ninguno');
            return router.createUrlTree(['/user']);
          }
          
          console.log('🔒 AUTH GUARD - Acceso concedido: Usuario tiene permisos de administrador');
          return true;
        });
      }

      // Para rutas que no requieren admin, solo verificar autenticación
      console.log('🔒 AUTH GUARD - Acceso concedido: Ruta no requiere permisos especiales');
      return of(true);
    })
  );
};
