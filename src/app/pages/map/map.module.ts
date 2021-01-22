import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MapPage } from './map.page';
import { MapComponent } from './map/map.component';
import { MapStyleService } from './styles.service';
import { MapService } from './map.service';
import { SharedModule } from '@shared/shared.module';
import { LayerstoglComponent } from './layerstogl/layerstogl.component';
import { MaplegendComponent } from './maplegend/maplegend.component';
import { MapformComponent } from './mapform/mapform.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';

const routes: Routes = [
  {
    path: 'utillocate',
    component: MapPage,
    data: {
      pageTitle: 'Utility Locate',
      taskbarOpts: {
        // mapMode: 'utilLocate',
        utilLocateMode: true,
        followMode: false,
        showTrackingButtons: true,
        transectInProgress: false,
      },
    },
  },
  {
    path: '',
    component: MapPage,
    data: {
      pageTitle: 'Map',
      taskbarOpts: {
        utilLocateMode: false,
        followMode: false,
        showTrackingButtons: false,
        transectInProgress: false,
      },
    },
  },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forRoot(),
    FormlyIonicModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  entryComponents: [LayerstoglComponent, MaplegendComponent],
  declarations: [MapPage, MapComponent, LayerstoglComponent, MaplegendComponent, MapformComponent],
  providers: [MapStyleService, MapService],
  exports: [],
})
export class MapPageModule {}
