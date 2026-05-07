import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService, AuthUser } from '../api.service';
import { PageNavComponent } from '../shared/page-nav.component';

@Component({
  selector: 'app-auth-dashboard',
  standalone: true,
  imports: [DatePipe, PageNavComponent],
  templateUrl: './auth-dashboard.component.html',
  styleUrl: './auth-dashboard.component.scss'
})
export class AuthDashboardComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly users = signal<AuthUser[]>([]);

  readonly activeUsers = computed(() => this.users().filter((u) => u.enabled).length);
  readonly disabledUsers = computed(() => this.users().filter((u) => !u.enabled).length);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.users.set(await this.api.getAuthUsers());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(userId: string): Promise<void> {
    this.actionMessage.set(null);
    try {
      await this.api.toggleUserStatus(userId);
      this.actionMessage.set('Statut utilisateur mis a jour.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.actionMessage.set(null);
    try {
      await this.api.deleteUser(userId);
      this.actionMessage.set('Utilisateur supprime.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    }
  }

  constructor() {
    void this.load();
  }
}
