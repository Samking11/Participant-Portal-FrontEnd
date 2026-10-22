import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type LoginFeedback = { type: 'success'; message: string } | { type: 'error'; message: string };

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'Admin@123';

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

  readonly loginForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
  });

  readonly feedback = signal<LoginFeedback | null>(null);

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

    if (username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
      this.feedback.set({ type: 'success', message: 'Login successful.' });
      this.router.navigate(['/participants']);
      return;
    }

    this.feedback.set({
      type: 'error',
      message: 'The username or password is incorrect.',
    });
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }
}
