import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./my-pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./my-pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'modal-info',
    loadChildren: () => import('./my-pages/modal-info/modal-info.module').then( m => m.ModalInfoPageModule)
  },
  {
    path: 'modal-consent',
    loadChildren: () => import('./my-pages/modal-consent/modal-consent.module').then( m => m.ModalConsentPageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./my-pages/feedback/feedback.module').then( m => m.FeedbackPageModule)
  },
  {
    path: 'clockinui',
    loadChildren: () => import('./my-pages/clockinui/clockinui.module').then( m => m.ClockinuiPageModule)
  },
  {
    path: 'imprint',
    loadChildren: () => import('./my-pages/imprint/imprint.module').then( m => m.ImprintPageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./my-pages/info/info.module').then( m => m.InfoPageModule)
  },
  {
    path: 'scanner',
    loadChildren: () => import('./my-pages/scanner/scanner.module').then( m => m.ScannerPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
