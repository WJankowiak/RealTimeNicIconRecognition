import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToolComponent } from './tool/tool.component';

import { LoadingModule } from 'ngx-loading';
import {HttpClientModule} from '@angular/common/http';

const appRoutes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'tool', component: ToolComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ToolComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes
    ),
    LoadingModule.forRoot({
      primaryColour: '#b32216',
      secondaryColour: '#a11f14',
      tertiaryColour: '#a11f20',
      backdropBorderRadius: '8px'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
