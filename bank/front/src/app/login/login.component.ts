import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, RegistrationRequest } from '../api.service';
import { AuthStateService } from '../auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'signup'>('login');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly credentials = {
    username: '',
    password: ''
  };

  readonly registration: RegistrationRequest = {
    firstname: '',
    lastname: '',
    placeOfBirth: '',
    dateOfBirth: '',
    nationality: 'Tunisian',
    gender: 'M',
    cin: '',
    email: '',
    username: '',
    password: ''
  };

  switchMode(mode: 'login' | 'signup'): void {
    this.mode.set(mode);
    this.error.set(null);
    this.success.set(null);
  }

  private resolveUserKindFromJwt(jwt: string): 'admin' | 'client' {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1])) as { roles?: string[] };
      return payload.roles?.includes('ADMIN') ? 'admin' : 'client';
    } catch {
      return this.credentials.username.trim().toLowerCase() === 'admin' ? 'admin' : 'client';
    }
  }

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      if (this.mode() === 'login') {
        const response = await this.api.login({
          username: this.credentials.username.trim(),
          password: this.credentials.password
        });
        const kind = this.resolveUserKindFromJwt(response.jwt);
        this.authState.setSession(response.jwt, kind);
        await this.router.navigateByUrl(kind === 'admin' ? '/admin' : '/client');
      } else {
        await this.api.registerUser(this.registration);
        this.success.set('Compte cree avec succes. Vous pouvez vous connecter.');
        this.mode.set('login');
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }
}
