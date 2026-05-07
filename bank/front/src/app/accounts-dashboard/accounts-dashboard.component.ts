import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService, BankAccount, BankOperation, Customer } from '../api.service';
import { PageNavComponent } from '../shared/page-nav.component';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, PageNavComponent],
  templateUrl: './accounts-dashboard.component.html',
  styleUrl: './accounts-dashboard.component.scss'
})
export class AccountsDashboardComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly accountsByCustomerId = signal<Record<string, BankAccount | undefined>>({});
  readonly operations = signal<BankOperation[]>([]);
  readonly actionMessage = signal<string | null>(null);
  readonly actionLoading = signal(false);

  readonly operationForm = signal({
    customerRef: '',
    amount: 100,
    description: 'Operation admin'
  });
  readonly transferForm = signal({
    fromRef: '',
    toRef: '',
    amount: 100,
    description: 'Transfert admin'
  });

  readonly activatedAccounts = computed(
    () =>
      Object.values(this.accountsByCustomerId())
        .filter((a): a is BankAccount => Boolean(a))
        .filter((a) => a.status === 'ACTIVATED').length
  );
  readonly accountsCount = computed(
    () => Object.values(this.accountsByCustomerId()).filter((a): a is BankAccount => Boolean(a)).length
  );
  readonly totalBalance = computed(() =>
    Object.values(this.accountsByCustomerId())
      .filter((a): a is BankAccount => Boolean(a))
      .reduce((sum, account) => sum + Number(account.balance), 0)
  );
  readonly rows = computed(() =>
    this.customers().map((customer) => ({
      customer,
      account: this.accountsByCustomerId()[customer.id] ?? null
    }))
  );

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const customerPage = await this.api.getCustomers(0, 40);
      const customers = customerPage.customers ?? [];
      this.customers.set(customers);

      const accountResults = await Promise.allSettled(
        customers.map((customer) => this.api.getAccountByCustomerId(customer.id))
      );
      const accounts = accountResults
        .filter((r): r is PromiseFulfilledResult<BankAccount> => r.status === 'fulfilled')
        .map((r) => r.value);
      const accountsMap = Object.fromEntries(accounts.map((a) => [a.customerId, a])) as Record<
        string,
        BankAccount | undefined
      >;
      this.accountsByCustomerId.set(accountsMap);

      const operationResults = await Promise.allSettled(
        accounts.map((account) => this.api.getOperations(account.id))
      );
      const operations = operationResults
        .filter((r): r is PromiseFulfilledResult<BankOperation[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value);

      this.operations.set(operations);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async credit(): Promise<void> {
    await this.runOperation('credit');
  }

  async debit(): Promise<void> {
    await this.runOperation('debit');
  }

  async deleteAccount(): Promise<void> {
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      const account = await this.resolveExistingAccountByReference(this.operationForm().customerRef);
      await this.api.deleteAccount(account.id);
      this.actionMessage.set('Compte supprime avec succes.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  async transfer(): Promise<void> {
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      const from = await this.ensureActiveAccountByReference(this.transferForm().fromRef);
      const to = await this.ensureActiveAccountByReference(this.transferForm().toRef);
      await this.api.transfer({
        accountIdFrom: from.id,
        accountIdTo: to.id,
        amount: this.transferForm().amount,
        description: this.transferForm().description
      });
      this.actionMessage.set('Transfert execute avec succes.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  private async runOperation(type: 'credit' | 'debit'): Promise<void> {
    this.actionLoading.set(true);
    this.actionMessage.set(null);
    try {
      const account = await this.ensureActiveAccountByReference(this.operationForm().customerRef);
      if (type === 'credit') {
        await this.api.creditAccount({
          accountId: account.id,
          amount: this.operationForm().amount,
          description: this.operationForm().description
        });
      } else {
        await this.api.debitAccount({
          accountId: account.id,
          amount: this.operationForm().amount,
          description: this.operationForm().description
        });
      }
      this.actionMessage.set(type === 'credit' ? 'Recharge effectuee.' : 'Retrait effectue.');
      await this.load();
    } catch (e) {
      this.actionMessage.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.actionLoading.set(false);
    }
  }

  constructor() {
    void this.load();
  }

  updateOperationField(field: 'customerRef' | 'amount' | 'description', value: string): void {
    this.operationForm.update((v) => ({
      ...v,
      [field]: field === 'amount' ? Number(value) : value
    }));
  }

  updateTransferField(
    field: 'fromRef' | 'toRef' | 'amount' | 'description',
    value: string
  ): void {
    this.transferForm.update((v) => ({
      ...v,
      [field]: field === 'amount' ? Number(value) : value
    }));
  }

  private async resolveAccountByReference(ref: string): Promise<BankAccount> {
    const customer = await this.resolveCustomerByReference(ref);
    return this.api.getAccountByCustomerId(customer.id);
  }

  private async resolveExistingAccountByReference(ref: string): Promise<BankAccount> {
    const trimmed = ref.trim();
    if (!trimmed) throw new Error('Reference client obligatoire (CIN, nom ou numero compte).');

    if (/^ACC-/i.test(trimmed)) {
      const account = Object.values(this.accountsByCustomerId())
        .filter((a): a is BankAccount => Boolean(a))
        .find((a) => a.id === trimmed);
      if (account) return account;
    }

    return this.resolveAccountByReference(trimmed);
  }

  private async ensureActiveAccountByReference(ref: string): Promise<BankAccount> {
    const customer = await this.resolveCustomerByReference(ref);
    let account: BankAccount;
    try {
      account = await this.api.getAccountByCustomerId(customer.id);
    } catch {
      await this.api.createAccount(customer.id, 'TND');
      account = await this.api.getAccountByCustomerId(customer.id);
    }
    if (account.status !== 'ACTIVATED') {
      await this.api.activateAccount(account.id);
      account = await this.api.getAccountByCustomerId(customer.id);
    }
    return account;
  }

  private async resolveCustomerByReference(ref: string): Promise<Customer> {
    const trimmed = ref.trim();
    if (!trimmed) {
      throw new Error('Reference client obligatoire (CIN, nom ou numero compte).');
    }
    if (/^ACC-/i.test(trimmed)) {
      const account = Object.values(this.accountsByCustomerId())
        .filter((a): a is BankAccount => Boolean(a))
        .find((a) => a.id === trimmed);
      if (account) {
        const customer = this.customers().find((c) => c.id === account.customerId);
        if (customer) return customer;
      }
    }
    const byCin = this.customers().find((c) => c.cin.toLowerCase() === trimmed.toLowerCase());
    if (byCin) return byCin;
    const search = await this.api.searchCustomers(trimmed, 0, 5);
    const candidate = (search.customers ?? [])[0];
    if (!candidate) throw new Error('Aucun client trouve avec cette reference.');
    return candidate;
  }
}
