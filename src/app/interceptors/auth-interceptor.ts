import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { Toast } from '../services/toast';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.token();
  const toast = inject(Toast);

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401) {
        toast.show('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        auth.logout();
        router.navigate(['/login']);
      } else if (err.status === 0) {
        toast.show('Không kết nối được máy chủ, vui lòng thử lại');
      }
      return throwError(() => err);
    })
  );
};