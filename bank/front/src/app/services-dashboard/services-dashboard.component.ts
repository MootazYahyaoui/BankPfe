import { Component, signal } from '@angular/core';
import { PageNavComponent } from '../shared/page-nav.component';

type ServiceStatus = {
  name: string;
  endpoint: string;
  status: 'checking' | 'up' | 'down';
  details: string;
};

@Component({
  selector: 'app-services-dashboard',
  standalone: true,
  imports: [PageNavComponent],
  templateUrl: './services-dashboard.component.html',
  styleUrl: './services-dashboard.component.scss'
})
export class ServicesDashboardComponent {
  readonly services = signal<ServiceStatus[]>([
    {
      name: 'Customer Service',
      endpoint: '/api/bank/actuator/health',
      status: 'checking',
      details: 'Checking...'
    },
    {
      name: 'Authentication Service',
      endpoint: '/auth-api/bank/actuator/health',
      status: 'checking',
      details: 'Checking...'
    },
    {
      name: 'Account Service',
      endpoint: '/account-api/bank/actuator/health',
      status: 'checking',
      details: 'Checking...'
    },
    {
      name: 'Notification Service',
      endpoint: '/notification-api/bank/actuator/health',
      status: 'checking',
      details: 'Checking...'
    },
    {
      name: 'Gateway Service',
      endpoint: '/gateway-api/actuator/health',
      status: 'checking',
      details: 'Checking...'
    },
    {
      name: 'Discovery Service',
      endpoint: '/discovery-api/actuator/health',
      status: 'checking',
      details: 'Checking...'
    }
  ]);

  async refresh(): Promise<void> {
    const current = this.services().map((s) => ({
      ...s,
      status: 'checking' as const,
      details: 'Checking...'
    }));
    this.services.set(current);

    await Promise.all(
      current.map(async (svc, index) => {
        try {
          const res = await fetch(svc.endpoint);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = (await res.json()) as { status?: string };
          const ok = (body.status ?? '').toUpperCase() === 'UP';
          this.update(index, {
            status: ok ? 'up' : 'down',
            details: ok ? 'UP (reachable)' : `Health=${body.status ?? 'unknown'}`
          });
        } catch (e) {
          this.update(index, {
            status: 'down',
            details: e instanceof Error ? e.message : 'unreachable'
          });
        }
      })
    );
  }

  private update(index: number, patch: Pick<ServiceStatus, 'status' | 'details'>): void {
    const copy = [...this.services()];
    copy[index] = { ...copy[index], ...patch };
    this.services.set(copy);
  }

  constructor() {
    void this.refresh();
  }
}
