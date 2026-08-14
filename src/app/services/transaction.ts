import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  date: string;
  description: string;
  note?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface CreateTransactionPayload {
  accountId: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  date: string;
  description: string;
  categoryId?: string;
  toAccountId?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = 'https://personal-finance-api-tvve.onrender.com/transactions';

  transactions = signal<Transaction[]>([]);

  constructor(private http: HttpClient) {}

  fetchAll(filter?: { dateFrom?: string; dateTo?: string }): Observable<PaginatedTransactions> {
    let params = new HttpParams();
    if (filter?.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params = params.set('dateTo', filter.dateTo);

    return this.http.get<PaginatedTransactions>(this.baseUrl, { params }).pipe(
      tap(res => this.transactions.set(res.data))
    );
  }

  create(payload: CreateTransactionPayload): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, payload).pipe(
      tap(newTx => this.transactions.update(list => [newTx, ...list]))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.transactions.update(list => list.filter(t => t.id !== id)))
    );
  }
}