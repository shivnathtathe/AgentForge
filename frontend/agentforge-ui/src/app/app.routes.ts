import { Routes } from '@angular/router';
import { ChatUiComponent } from './pages/chat-ui/chat-ui.component';

export const routes: Routes = [
    { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatUiComponent }      
];
