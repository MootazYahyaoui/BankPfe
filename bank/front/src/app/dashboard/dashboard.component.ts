import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ApiService, Customer, CustomerPageResponseDTO } from '../api.service';
import { PageNavComponent } from '../shared/page-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, NgClass, PageNavComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly pageSize = 9;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<CustomerPageResponseDTO | null>(null);
  readonly keyword = signal('');
  readonly currentPage = signal(0);

  readonly customers = computed<Customer[]>(() => {
    const d = this.data();
    const source = d?.customers ?? [];
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return source;
    return source.filter((c) =>
      `${c.firstname} ${c.lastname} ${c.cin} ${c.email}`.toLowerCase().includes(kw)
    );
  });

  readonly totalCustomers = computed(() => this.data()?.totalElements ?? this.customers().length);
  readonly maleCount = computed(
    () => this.customers().filter((c) => c.gender === 'M').length
  );
  readonly femaleCount = computed(
    () => this.customers().filter((c) => c.gender === 'F').length
  );
  readonly totalPages = computed(() => Math.max(1, this.data()?.totalPages ?? 1));
  readonly canGoPrevious = computed(() => this.currentPage() > 0 && !this.loading());
  readonly canGoNext = computed(
    () => this.currentPage() < this.totalPages() - 1 && !this.loading()
  );

  async load(page = this.currentPage()): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.currentPage.set(page);
      this.data.set(await this.api.getCustomers(page, this.pageSize));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  updateKeyword(value: string): void {
    this.keyword.set(value);
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    void this.load(this.currentPage() + 1);
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    void this.load(this.currentPage() - 1);
  }

  constructor() {
    void this.load();
  }
}

