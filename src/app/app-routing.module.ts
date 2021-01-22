import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'stats',
    loadChildren: './pages/stats/stats.module#StatsPageModule',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'map',
    loadChildren: './pages/map/map.module#MapPageModule',
    runGuardsAndResolvers: 'always',
  },
  { path: '**', redirectTo: 'stats', runGuardsAndResolvers: 'always' },
  {
    path: '',
    redirectTo: 'stats',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
