import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, NotificationRequest } from '../api.service';
import { PageNavComponent } from '../shared/page-nav.component';

type NotificationTemplate = {
  label: string;
  subject: string;
  body: string;
};

@Component({
  selector: 'app-notifications-dashboard',
  standalone: true,
  imports: [FormsModule, PageNavComponent],
  templateUrl: './notifications-dashboard.component.html',
  styleUrl: './notifications-dashboard.component.scss'
})
export class NotificationsDashboardComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly sentCount = signal(0);

  readonly model: NotificationRequest = {
    to: 'client@propsbank.local',
    subject: 'Notification Props Bank',
    body: 'Bonjour, votre operation bancaire a ete traitee avec succes.'
  };

  readonly templates: NotificationTemplate[] = [
    {
      label: 'Operation validee',
      subject: 'Votre operation bancaire est validee',
      body: 'Bonjour, nous vous confirmons que votre operation bancaire a ete traitee avec succes.'
    },
    {
      label: 'Compte active',
      subject: 'Activation de votre compte Props Bank',
      body: 'Bonjour, votre compte bancaire est maintenant active. Vous pouvez utiliser les services Props Bank.'
    },
    {
      label: 'Alerte securite',
      subject: 'Alerte de securite Props Bank',
      body: 'Bonjour, une activite importante a ete detectee sur votre compte. Merci de verifier vos informations.'
    }
  ];

  canSend(): boolean {
    return (
      this.model.to.trim().length > 0 &&
      this.model.subject.trim().length > 0 &&
      this.model.body.trim().length > 0 &&
      !this.loading()
    );
  }

  applyTemplate(template: NotificationTemplate): void {
    this.model.subject = template.subject;
    this.model.body = template.body;
    this.success.set(null);
    this.error.set(null);
  }

  async send(): Promise<void> {
    if (!this.canSend()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      await this.api.sendNotification({
        to: this.model.to.trim(),
        subject: this.model.subject.trim(),
        body: this.model.body.trim()
      });
      this.sentCount.update((value) => value + 1);
      this.success.set('Notification acceptee par le microservice.');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }
}
