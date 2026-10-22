import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from './app.routes';
import { LoginComponent } from './login/login';
import { ParticipantsComponent } from './participants/participants';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: Router, useValue: { navigate } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('shows an error when the fields are empty', async () => {
    await submitLogin('', '');

    expect(alertMessage()).toContain('Enter both your username and password.');
    expect(feedbackAlert().classList.contains('alert-danger')).toBe(true);
  });

  it('rejects a username containing only whitespace', async () => {
    await submitLogin('   ', 'Admin@123');

    expect(alertMessage()).toContain('Enter both your username and password.');
  });

  it('shows an error for incorrect credentials', async () => {
    await submitLogin('admin', 'incorrect');

    expect(alertMessage()).toContain('The username or password is incorrect.');
  });

  it('navigates to participants for the demo credentials', async () => {
    await submitLogin('admin', 'Admin@123');

    expect(alertMessage()).toContain('Login successful.');
    expect(feedbackAlert().classList.contains('alert-success')).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('masks the password input', () => {
    expect(getInput('password').type).toBe('password');
  });

  it('redirects the default route to login', async () => {
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute?.pathMatch).toBe('full');
    expect(defaultRoute?.redirectTo).toBe('login');
  });

  it('navigates to login when logging out', () => {
    const participants = TestBed.createComponent(ParticipantsComponent);
    participants.componentInstance.logout();

    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  async function submitLogin(username: string, password: string): Promise<void> {
    setInputValue('username', username);
    setInputValue('password', password);
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    if (!form) {
      throw new Error('Expected the login form to exist.');
    }

    form.requestSubmit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function setInputValue(id: string, value: string): void {
    const input = getInput(id);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function getInput(id: string): HTMLInputElement {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(`#${id}`);

    if (!input) {
      throw new Error(`Expected input #${id} to exist.`);
    }

    return input;
  }

  function alertMessage(): string {
    return feedbackAlert().textContent ?? '';
  }

  function feedbackAlert(): HTMLElement {
    const alert = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="alert"]',
    );

    if (!alert) {
      throw new Error('Expected a login feedback alert.');
    }

    return alert;
  }
});
