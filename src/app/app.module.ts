import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToolComponent } from './tool/tool.component';

import { LoadingModule } from 'ngx-loading';
import {HttpClientModule} from '@angular/common/http';

import { OrderModule } from 'ngx-order-pipe';
import { SignsComponent } from './signs/signs.component';

const appRoutes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'tool', component: ToolComponent },
  { path: 'signs', component: SignsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ToolComponent,
    SignsComponent
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
    }),
    OrderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
