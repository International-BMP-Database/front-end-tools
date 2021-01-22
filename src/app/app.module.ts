import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Config } from './core/services/config';
import { Remotedata } from './core/services/remotedata';
import { Shared } from './core/services/shared';
import { IonicStorageModule } from '@ionic/storage';
import { AbstractPageComponent } from '@pages/AbstractPageComponent';


@NgModule({
  declarations: [AppComponent, AbstractPageComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    ReactiveFormsModule, HttpClientModule,

    CoreModule,
    SharedModule,

    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Config, Remotedata, Shared,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
