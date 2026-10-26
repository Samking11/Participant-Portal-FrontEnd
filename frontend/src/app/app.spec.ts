import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from './app.routes';
import { LoginComponent } from './login/login';
import { ParticipantFormComponent } from './participants/participant-form';
import { ParticipantsComponent } from './participants/participants';
import { ParticipantService } from './participants/participant.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), { provide: Router, useValue: { navigate } }],
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

  it('registers the participant form route', () => {
    expect(typeof routes.find((route) => route.path === 'participants/new')?.loadComponent).toBe(
      'function',
    );
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

describe('ParticipantsComponent', () => {
  let fixture: ComponentFixture<ParticipantsComponent>;
  let httpTesting: HttpTestingController;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ParticipantsComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: Router, useValue: { navigate } },
    ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ParticipantsComponent);
    const participantService = TestBed.inject(ParticipantService);
    httpTesting
    .expectOne('http://localhost:9081/api/v1/participants')
    .flush({ institutions: [...participantService.participants] });
    fixture.detectChanges();
  });

  it('displays all five participant banks and their details', () => {
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');

    expect(rows).toHaveLength(5);
    expect(fixture.nativeElement.textContent).toContain('First National Bank');
    expect(fixture.nativeElement.textContent).toContain('FNBKUS33');
    expect(fixture.nativeElement.textContent).toContain('Central Cooperative Bank');
  });

  it('displays participants added to the shared service', () => {
    TestBed.inject(ParticipantService).addParticipant({
      name: 'New Bank',
      bic: 'NEWBUS88',
      shortName: 'New',
      email: 'contact@newbank.example',
      phoneNumber: '+1 202 555 0108',
      status: 'ACTIVE',
    });
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows).toHaveLength(6);
    expect(fixture.nativeElement.textContent).toContain('NEWBUS88');
  });

  it('filters participants by bank name or BIC as the user types', async () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#participant-search',
    );
    if (!input) {
      throw new Error('Expected the participant search input to exist.');
    }

    input.value = 'smtbus55';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Summit Trust Bank');
  });

  it('shows the empty state when no participants match', async () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#participant-search',
    );
    if (!input) {
      throw new Error('Expected the participant search input to exist.');
    }

    input.value = 'no matching bank';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No participant banks found');
  });

  it('uses green and grey badges for active and inactive participants', () => {
    const badges = (fixture.nativeElement as HTMLElement).querySelectorAll('.badge');

    expect(badges).toHaveLength(5);
    expect(badges[0].classList.contains('bg-success')).toBe(true);
    expect(badges[2].classList.contains('bg-secondary')).toBe(true);
  });
  it('opens the registration form from Add Participant', () => {
    const addButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Add Participant'));

    if (!addButton) {
      throw new Error('Expected the Add Participant button to exist.');
    }

    addButton.click();

    expect(navigate).toHaveBeenCalledWith(['/participants/new']);
  });
});

describe('ParticipantFormComponent', () => {
  let fixture: ComponentFixture<ParticipantFormComponent>;
  let participantService: ParticipantService;
  let httpTesting: HttpTestingController;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ParticipantFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    participantService = TestBed.inject(ParticipantService);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ParticipantFormComponent);
    fixture.detectChanges();
  });

  it('saves a participant and returns to the list', () => {
    fixture.componentInstance.participantForm.setValue({
      name: 'New Bank',
      bic: 'NEWBUS88',
      shortName: 'New',
      email: 'contact@newbank.example',
      phone: '+1 202 555 0108',
      status: 'INACTIVE',
    });
    const initialCount = participantService.participants.length;

    fixture.componentInstance.save();
    httpTesting
      .expectOne('http://localhost:9081/api/v1/participants')
      .flush({ institution: participantService.participants.at(-1) });

    expect(participantService.participants).toHaveLength(initialCount + 1);
    expect(participantService.participants.at(-1)).toEqual({
      id: 6,
      name: 'New Bank',
      bic: 'NEWBUS88',
      shortName: 'New',
      email: 'contact@newbank.example',
      phoneNumber: '+1 202 555 0108',
      status: 'INACTIVE',
    });
    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('cancels without changing participants', () => {
    fixture.componentInstance.participantForm.patchValue({
      name: 'Unsaved Bank',
      bic: 'UNSAVED1',
    });
    const initialCount = participantService.participants.length;

    fixture.componentInstance.cancel();

    expect(participantService.participants).toHaveLength(initialCount);
    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('does not save an invalid form', () => {
    fixture.componentInstance.save();

    expect(participantService.participants).toHaveLength(5);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.participantForm.controls.name.touched).toBe(true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent).toContain(
      'Fix the highlighted fields',
    );
  });

  it('disables saving until the form is valid', () => {
    const saveButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(saveButton?.disabled).toBe(true);

    fixture.componentInstance.participantForm.setValue({
      name: 'Valid Bank',
      bic: 'VALIDBIC',
      shortName: 'Valid',
      email: 'contact@valid.example',
      phone: '+1 202 555 0109',
      status: 'ACTIVE',
    });
    fixture.detectChanges();

    expect(saveButton?.disabled).toBe(false);
  });

  it('rejects BICs with invalid length or characters', () => {
    const bic = fixture.componentInstance.participantForm.controls.bic;

    bic.setValue('SHORT');
    expect(bic.hasError('minlength')).toBe(true);

    bic.setValue('TOO-LONG-BIC');
    expect(bic.hasError('maxlength')).toBe(true);

    bic.setValue('INVALID!');
    expect(bic.hasError('pattern')).toBe(true);

    bic.setValue('VALIDBIC');
    expect(bic.valid).toBe(true);
  });

  it('shows field feedback only after a control is touched', () => {
    const name = fixture.componentInstance.participantForm.controls.name;

    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('#name + .invalid-feedback')).toBeNull();

    name.markAsTouched();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('#name + .invalid-feedback')).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('#name')?.classList.contains('is-invalid')).toBe(
      true,
    );
  });
});
