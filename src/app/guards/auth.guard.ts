import {CanActivateFn, Router} from '@angular/router';
// import {FirebaseService} from '../services/firebase.service';
import {inject} from '@angular/core';
import {map, take} from 'rxjs';
import {environment} from '../../environments/environment';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const firebaseService = inject(FirebaseService);

  if(!environment.guards){
    return true;
  }

  return firebaseService.currentUser$.pipe(
    take(1),
    map(user => {
      const isAuthenticated = !!user;
      if (isAuthenticated) {
        return true;
      }
      // Redirigir al usuario a la página de inicio de sesión si no está autenticado
      console.log('Acceso denegado: Usuario no autenticado');
      return router.createUrlTree(['/']);
    })
  );


};
