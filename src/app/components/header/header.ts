import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UiState } from '../../services/ui-state';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  ui = inject(UiState);
  private auth = inject(Auth);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}