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
  {
    path: 'home-scanner',
    loadChildren: () => import('./my-pages/home-scanner/home-scanner.module').then( m => m.HomeScannerPageModule)
  },
  {
    path: 'home-supervisor',
    loadChildren: () => import('./my-pages/home-supervisor/home-supervisor.module').then( m => m.HomeSupervisorPageModule)
  },
  {
    path: 'modal-registration',
    loadChildren: () => import('./my-pages/modal-registration/modal-registration.module').then( m => m.ModalRegistrationPageModule)
  },
  {
    path: 'adminui',
    loadChildren: () => import('./my-pages/adminui/adminui.module').then( m => m.AdminuiPageModule)
  },
  {
    path: 'modal-status-history',
    loadChildren: () => import('./my-pages/modal-status-history/modal-status-history.module').then( m => m.ModalStatusHistoryPageModule)
  },
  {
    path: 'qrgenerator',
    loadChildren: () => import('./my-pages/qrgenerator/qrgenerator.module').then( m => m.QrgeneratorPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
