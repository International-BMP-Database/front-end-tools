import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class Config {
  public static APPINFO = {
    isDebug: false, // IMPORTANT!! change to false for production
    id: 'dot_000',
    shdSkipPhotoBackups: false,
    apiEndpoint_dev: 'http://dot-portal-dev.azurewebsites.net/api/',
    apiEndpoint_prod: 'https://dot-portal-app.azurewebsites.net/api/',
  };
  public loginMode = 'simple'; // or 'local' or 'remote'
  public appID = 'aj_001';
  public appStrings: any = {
    appName: 'NCHRP_DOT',
    appVersion: '1.1.1',
    appCreator: 'Geosyntec Consultants Inc.',
    logosrc: 'assets/imgs/logo.png',
    appTitle: 'BMPDB DOT Portal',
    appTitleShort: 'Privileged and Confidential',
    loginBtn: 'Sign In',
    loginBtnForgot: 'Forgot',
    loginfrmEmailLbl: 'Username',
    loginfrmEmailErr: 'Please enter a valid email.',
    loginfrmPwdLbl: 'Password',
    loginfrmPwdErr: 'Your password needs more than 6 characters.',
  };
  public settings: any = {}; // populated by settings service
  public Users = [];

  constructor() {
    console.log('Hello Config Provider');
  }
}
