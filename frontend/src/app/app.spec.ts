import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('shows an error when the fields are empty', () => {
    submitLogin('', '');

    expect(alertMessage()).toContain('Enter both your username and password.');
    expect(feedbackAlert().classList.contains('alert-danger')).toBe(true);
  });

  it('rejects a username containing only whitespace', () => {
    submitLogin('   ', 'Admin@123');

    expect(alertMessage()).toContain('Enter both your username and password.');
  });

  it('shows an error for incorrect credentials', () => {
    submitLogin('admin', 'incorrect');

    expect(alertMessage()).toContain('The username or password is incorrect.');
  });

  it('shows success for the demo credentials', () => {
    submitLogin('admin', 'Admin@123');

    expect(alertMessage()).toContain('Login successful.');
    expect(feedbackAlert().classList.contains('alert-success')).toBe(true);
  });

  it('masks the password input', () => {
    expect(getInput('password').type).toBe('password');
  });

  function submitLogin(username: string, password: string): void {
    setInputValue('username', username);
    setInputValue('password', password);
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    if (!form) {
      throw new Error('Expected the login form to exist.');
    }

    form.requestSubmit();
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
