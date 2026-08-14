import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { ExpenseChart } from '../../components/expense-chart/expense-chart';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, FormsModule, ExpenseChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);

  transactions = this.transactionService.transactions;
  newDescription = '';
  newAmount = 0;
  loading = signal(false);
  error = signal('');

  total = computed(() =>
    this.transactions().reduce((sum, t) => {
      return t.type === 'EXPENSE' ? sum - t.amount : sum + t.amount;
    }, 0)
  );

  ngOnInit() {
    this.loading.set(true);
    this.transactionService.fetchAll().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set(`Status: ${err.status} | Message: ${err.message}`);
      }
    });
  }

  onSubmit() {
    if (!this.newDescription.trim() || !this.newAmount) return;

    this.transactionService.create({
      accountId: 'chuongth1401@gmail.com',
      type: this.newAmount < 0 ? 'EXPENSE' : 'INCOME',
      amount: Math.abs(this.newAmount),
      date: new Date().toISOString(),
      description: this.newDescription
    }).subscribe({
      next: () => {
        this.newDescription = '';
        this.newAmount = 0;
      },
      error: (err) => this.error.set('Không thêm được: ' + err.message)
    });
  }

  removeTransaction(id: string) {
    this.transactionService.remove(id).subscribe({
      error: (err) => this.error.set('Không xóa được: ' + err.message)
    });
  }
}