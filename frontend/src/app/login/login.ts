import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

type LoginFeedback = { type: 'success'; message: string } | { type: 'error'; message: string };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly loginForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
  });

  readonly feedback = signal<LoginFeedback | null>(null);
  isSubmitting = false;

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.feedback.set({
        type: 'error',
        message: 'Enter both your username and password.',
      });
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    this.isSubmitting = true;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.feedback.set({ type: 'success', message: 'Login successful.' });
        void this.router.navigate(['/participants']);
      },
      error: () => {
        this.isSubmitting = false;
        this.feedback.set({
          type: 'error',
          message: 'The username or password is incorrect.',
        });
      },
    });
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }
}
