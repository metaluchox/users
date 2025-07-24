import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxUiLoaderModule],
  template : `
      <ngx-ui-loader></ngx-ui-loader>
      <router-outlet /> 
  `,
  styles : [`
    
  `],
})
export class App {
  protected title = 'myapp';
}
