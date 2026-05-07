import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../auth-state.service';

@Component({
  selector: 'app-page-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="shell-header">
      <a class="brand" [routerLink]="auth.userKind() === 'admin' ? '/admin' : '/client'" aria-label="UIB Props Bank">
        <img src="/UIB-logo.png" alt="UIB Logo" />
        <span>
          <strong>Props Bank</strong>
          <small>Microservices Dashboard</small>
        </span>
      </a>

      <nav class="nav" aria-label="Navigation principale">
        @if (auth.userKind() === 'admin') {
          <a routerLink="/customers" routerLinkActive="active">Customers</a>
          <a routerLink="/auth" routerLinkActive="active">Authentication</a>
          <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
          <a routerLink="/notifications" routerLinkActive="active">Notifications</a>
          <a routerLink="/services" routerLinkActive="active">Services</a>
        } @else {
          <a routerLink="/client" routerLinkActive="active">My Banking</a>
        }
        <a class="role">{{ auth.userKind() === 'admin' ? 'ADMIN' : 'CLIENT' }}</a>
        <a class="logout" routerLink="/login" (click)="logout()">Logout</a>
      </nav>
    </header>
  `,
  styles: [
    `
      .shell-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 22px;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.28);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
        color: #111827;
        text-decoration: none;
      }

      img {
        width: 74px;
        height: 44px;
        object-fit: contain;
        background: #fff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 8px;
        padding: 5px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07);
      }

      strong,
      small {
        display: block;
      }

      strong {
        font-size: 15px;
        letter-spacing: 0;
      }

      small {
        color: #64748b;
        font-size: 12px;
        margin-top: 2px;
      }

      .nav {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }

      a {
        border: 1px solid rgba(203, 213, 225, 0.92);
        border-radius: 8px;
        color: #334155;
        padding: 9px 12px;
        text-decoration: none;
        font-weight: 600;
        background: #fff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }

      a.active {
        background: #b91c1c;
        border-color: #b91c1c;
        color: #fff;
      }

      a.role {
        background: #fff7ed;
        color: #9a3412;
        border-color: #fed7aa;
      }

      a.logout {
        background: #111827;
        color: #fff;
        border-color: #111827;
      }

      @media (max-width: 820px) {
        .shell-header {
          align-items: stretch;
          flex-direction: column;
        }

        .nav {
          justify-content: flex-start;
        }
      }

      @media (max-width: 520px) {
        a {
          flex: 1 1 calc(50% - 8px);
          text-align: center;
        }
      }
    `
  ]
})
export class PageNavComponent {
  readonly auth = inject(AuthStateService);

  logout(): void {
    this.auth.logout();
  }
}
