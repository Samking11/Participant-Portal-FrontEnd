import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { FeedbackService } from './feedback.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const feedback = inject(FeedbackService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let friendlyMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        friendlyMessage = `Network error: ${error.error.message}`;
      } else if (error.status === 0) {
        friendlyMessage =
          'Unable to connect to the backend server. Please verify the server is running on port 9081.';
      } else if (typeof error.error === 'string' && error.error.trim()) {
        friendlyMessage = error.error;
      } else if (error.error?.message) {
        friendlyMessage = error.error.message;
      } else if (error.error?.error) {
        friendlyMessage = `${error.status}: ${error.error.error}`;
      } else if (error.status === 404) {
        friendlyMessage = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        friendlyMessage = 'A server error occurred. Please try again later.';
      }

      feedback.showError(friendlyMessage);
      return throwError(() => error);
    }),
  );
};
