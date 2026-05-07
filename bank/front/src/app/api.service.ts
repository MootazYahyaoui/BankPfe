import { Injectable } from '@angular/core';

export type Customer = {
  id: string;
  firstname: string;
  lastname: string;
  placeOfBirth: string;
  dateOfBirth: string;
  nationality: string;
  gender: 'F' | 'M';
  cin: string;
  email: string;
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
};

export type CustomerPageResponseDTO = {
  customers?: Customer[];
  totalPages: number;
  size: number;
  totalElements: number;
  numberOfElements: number;
  number: number;
  hasContent: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
};

export type AuthUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  dateOfBirth: string;
  lastLogin: string | null;
  cin: string;
};

export type BankAccount = {
  id: string;
  customerId: string;
  currency: string;
  status: 'CREATED' | 'ACTIVATED' | 'SUSPENDED' | 'DELETED';
  balance: number;
  createdDate: string;
};

export type BankOperation = {
  id: string;
  accountId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  dateTime: string;
};

export type NotificationRequest = {
  to: string;
  subject: string;
  body: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  jwt: string;
  passwordNeedToBeUpdate: boolean;
};

export type RegistrationRequest = {
  firstname: string;
  lastname: string;
  placeOfBirth: string;
  dateOfBirth: string;
  nationality: string;
  gender: 'F' | 'M';
  cin: string;
  email: string;
  username: string;
  password: string;
};

export type UserPageResponse = {
  totalPages: number;
  size: number;
  totalElements: number;
  numberOfElements: number;
  number: number;
  hasContent: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
  content: AuthUser[];
};

export type AccountOperationPayload = {
  accountId: string;
  amount: number;
  description: string;
};

export type TransferPayload = {
  accountIdFrom: string;
  accountIdTo: string;
  amount: number;
  description: string;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly requestTimeoutMs = 10000;
  private readonly tokenKey = 'propsbank.jwt';

  private authHeaders(headers?: HeadersInit, includeAuth = true): Headers {
    const built = new Headers(headers);
    const token = localStorage.getItem(this.tokenKey);
    if (includeAuth && token) {
      built.set('Authorization', `Bearer ${token}`);
    }
    return built;
  }

  private async request<T>(input: string, init?: RequestInit, includeAuth = true): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try {
      const res = await fetch(input, {
        ...init,
        headers: this.authHeaders(init?.headers, includeAuth),
        signal: controller.signal
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(`HTTP ${res.status}${details ? ` - ${details}` : ''}`);
      }
      return (await res.json()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.requestTimeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async requestVoid(input: string, init?: RequestInit, includeAuth = true): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try {
      const res = await fetch(input, {
        ...init,
        headers: this.authHeaders(init?.headers, includeAuth),
        signal: controller.signal
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(`HTTP ${res.status}${details ? ` - ${details}` : ''}`);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.requestTimeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getCustomers(page = 0, size = 9): Promise<CustomerPageResponseDTO> {
    const url = `/api/bank/customers/list?page=${page}&size=${size}`;
    return this.request<CustomerPageResponseDTO>(url);
  }

  async getAuthUsers(): Promise<AuthUser[]> {
    const page = await this.request<UserPageResponse>('/auth-api/bank/users/all?page=0&size=50');
    return page.content ?? [];
  }

  async getProfile(): Promise<AuthUser> {
    return this.request<AuthUser>('/auth-api/bank/users/profile');
  }

  async getAccountByCustomerId(customerId: string): Promise<BankAccount> {
    return this.request<BankAccount>(`/account-api/bank/accounts/queries/find-account/${customerId}`);
  }

  async getOperations(accountId: string): Promise<BankOperation[]> {
    return this.request<BankOperation[]>(
      `/account-api/bank/accounts/queries/all-operations?accountId=${accountId}&page=0&size=20`
    );
  }

  async sendNotification(payload: NotificationRequest): Promise<void> {
    await this.requestVoid('/notification-api/bank/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth-api/bank/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }, false);
  }

  async registerUser(payload: RegistrationRequest): Promise<void> {
    await this.request<void>('/auth-api/bank/authentication/signup/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }, false);
  }

  async getCustomerByCin(cin: string): Promise<Customer> {
    return this.request<Customer>(`/api/bank/customers/find/${cin}`);
  }

  async searchCustomers(keyword: string, page = 0, size = 20): Promise<CustomerPageResponseDTO> {
    const k = encodeURIComponent(keyword);
    return this.request<CustomerPageResponseDTO>(
      `/api/bank/customers/search?keyword=${k}&page=${page}&size=${size}`
    );
  }

  async createAccount(customerId: string, currency = 'TND'): Promise<void> {
    await this.requestVoid('/account-api/bank/accounts/commands/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customerId, currency })
    });
  }

  async activateAccount(accountId: string): Promise<void> {
    await this.requestVoid('/account-api/bank/accounts/commands/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId,
        status: 'ACTIVATED'
      })
    });
  }

  async creditAccount(payload: AccountOperationPayload): Promise<void> {
    await this.requestVoid('/account-api/bank/accounts/commands/credit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async debitAccount(payload: AccountOperationPayload): Promise<void> {
    await this.requestVoid('/account-api/bank/accounts/commands/debit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async transfer(payload: TransferPayload): Promise<void> {
    await this.requestVoid('/account-api/bank/accounts/commands/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.requestVoid(`/account-api/bank/accounts/commands/delete/${accountId}`, {
      method: 'DELETE'
    });
  }

  async toggleUserStatus(userId: string): Promise<void> {
    await this.requestVoid(`/auth-api/bank/users/status/${userId}`);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.requestVoid(`/auth-api/bank/users/delete/${userId}`, {
      method: 'DELETE'
    });
  }

}

