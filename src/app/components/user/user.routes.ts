import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { ListComponent } from './list.component';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent
  },
  {
    path: 'list',
    component: ListComponent
  },
  {
    path: 'edit/:uid',
    component: UserComponent
  }
];