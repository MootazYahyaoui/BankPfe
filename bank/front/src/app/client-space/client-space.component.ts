import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService, AuthUser, BankAccount, BankOperation, Customer } from '../api.service';
import { PageNavComponent } from '../shared/page-nav.component';

@Component({
  selector: 'app-client-space',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, PageNavComponent],
  templateUrl: './client-space.component.html',
  styleUrl: './client-space.component.scss'
})
export class ClientSpaceComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly warning = signal<string | null>(null);
  readonly profile = signal<AuthUser | null>(null);
  readonly customer = signal<Customer | null>(null);
  readonly account = signal<BankAccount | null>(null);
  readonly operations = signal<BankOperation[]>([]);
  readonly actionMessage = signal<string | null>(null);
  readonly actionLoading = signal(false);
  readonly operationForm = signal({
    amount: 50,
    description: 'Operation client'
  });
  readonly transferForm = signal({
    beneficiaryRef: '',
    amount: 50,
    description: 'Transfert client'
  });

  readonly fullName = computed(() => {
    const p = this.profile();
    return p ? `${p.firstname} ${p.lastname}` : '';
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.warning.set(null);
    this.actionMessage.set(null);
    this.customer.set(null);
    this.account.set(null);
    this.operations.set([]);
    try {
      const profile = await this.api.getProfile();
      this.profile.set(profile);

      try {
        const customer = await this.api.getCustomerByCin(profile.cin);
        this.customer.set(customer);
      } catch {
        this.warning.set(
          "Votre profil client n'existe pas encore dans Customer Service. Demandez a l'admin de creer votre fiche client."
        );
        return;
      }

      try {
        const account = await this.api.getAccountByCustomerId(this.customer()!.id);
        this.account.set(account);
      } catch {
        this.warning.set(
          "Votre fiche client est creee, mais aucun compte bancaire n'est encore associe. Contactez l'admin pour l'ouverture de compte."
        );
        return;
      }

      this.operations.set(await this.api.getOperations(this.account()!.id));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  constructor() {
    void this.load();
  }

  async credit(): Promise<void> {
    if (!this.account()) return;
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      await this.api.creditAccount({
        accountId: this.account()!.id,
        amount: this.operationForm().amount,
        description: this.operationForm().description
      });
      this.actionMessage.set('Recharge effectuee avec succes.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  async debit(): Promise<void> {
    if (!this.account()) return;
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      await this.api.debitAccount({
        accountId: this.account()!.id,
        amount: this.operationForm().amount,
        description: this.operationForm().description
      });
      this.actionMessage.set('Retrait effectue avec succes.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  async transfer(): Promise<void> {
    if (!this.account()) return;
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      const accountIdTo = await this.resolveBeneficiaryAccount(this.transferForm().beneficiaryRef);
      await this.api.transfer({
        accountIdFrom: this.account()!.id,
        accountIdTo,
        amount: this.transferForm().amount,
        description: this.transferForm().description
      });
      this.actionMessage.set('Transfert envoye avec succes.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  updateOperationField(field: 'amount' | 'description', value: string): void {
    this.operationForm.update((v) => ({
      ...v,
      [field]: field === 'amount' ? Number(value) : value
    }));
  }

  private async resolveBeneficiaryAccount(ref: string): Promise<string> {
    const value = ref.trim();
    if (!value) {
      throw new Error('Veuillez saisir CIN, nom ou numero de compte du beneficiaire.');
    }
    if (/^ACC-/i.test(value)) {
      return value;
    }
    try {
      const customer = await this.api.getCustomerByCin(value);
      const account = await this.api.getAccountByCustomerId(customer.id);
      return account.id;
    } catch {
      const search = await this.api.searchCustomers(value, 0, 5);
      const candidate = (search.customers ?? [])[0];
      if (!candidate) {
        throw new Error('Beneficiaire introuvable.');
      }
      const account = await this.api.getAccountByCustomerId(candidate.id);
      return account.id;
    }
  }

  updateTransferField(field: 'beneficiaryRef' | 'amount' | 'description', value: string): void {
    this.transferForm.update((v) => ({
      ...v,
      [field]: field === 'amount' ? Number(value) : value
    }));
  }
}
