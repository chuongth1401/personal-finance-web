import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services/transaction';

@Component({
  selector: 'app-transactions',
  imports: [DecimalPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class Transactions {
  private transactionService = inject(TransactionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  transactions = this.transactionService.transactions;
  loading = signal(false);
  selectedMonth = signal(this.currentMonthDefault());

  constructor() {
    // Đọc query param 'month' ngay khi component khởi tạo
    this.route.queryParams.subscribe(params => {
      const month = params['month'] ?? this.currentMonthDefault();
      this.selectedMonth.set(month);
      this.loadTransactions(month);
    });
  }

  private currentMonthDefault(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private loadTransactions(month: string) {
    const [year, m] = month.split('-').map(Number);
    const dateFrom = new Date(year, m - 1, 1).toISOString();
    const dateTo = new Date(year, m, 0, 23, 59, 59).toISOString();

    this.loading.set(true);
    this.transactionService.fetchAll({ dateFrom, dateTo }).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  onMonthChange(newMonth: string) {
    // Cập nhật URL -> tự trigger lại subscribe ở trên vì queryParams đổi
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: newMonth }
    });
  }
}