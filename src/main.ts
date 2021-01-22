import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// added 07/2/2020 to fix zone.js errors ref https://github.com/manfredsteyer/ngx-build-plus/issues/4
import 'zone.js/dist/zone';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
