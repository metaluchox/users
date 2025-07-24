import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { ListComponent } from './list.component';
import { authGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent
  },
  {
    path: 'list',
    component: ListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:uid',
    component: UserComponent,
    canActivate: [authGuard]
  }
];