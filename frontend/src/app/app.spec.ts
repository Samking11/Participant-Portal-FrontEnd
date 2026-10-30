import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from './app.routes';
import { LoginComponent } from './login/login';
import { ParticipantFormComponent } from './participants/participant-form';
import { ParticipantsComponent } from './participants/participants';
import { ParticipantService } from './participants/participant.service';
import { FeedbackService } from './shared/feedback.service';
import { httpErrorInterceptor } from './shared/http-error.interceptor';

const API_PARTICIPANTS = [
  {
    id: 1,
    name: 'First National Bank',
    bic: 'FNBKUS33',
    shortName: 'FNB',
    email: 'contact@fnb.example',
    phoneNumber: '+1 212 555 0101',
    status: 'ACTIVE' as const,
    logoPath: '/uploads/logos/FNBKUS33_logo.png',
  },
  {
    id: 2,
    name: 'Atlantic Commercial Bank',
    bic: 'ATCBUS44',
    shortName: 'Atlantic Bank',
    email: 'info@atlanticbank.example',
    phoneNumber: '+1 305 555 0102',
    status: 'ACTIVE' as const,
  },
  {
    id: 3,
    name: 'Summit Trust Bank',
    bic: 'SMTBUS55',
    shortName: 'Summit Trust',
    email: 'support@summittrust.example',
    phoneNumber: '+1 312 555 0103',
    status: 'INACTIVE' as const,
  },
  {
    id: 4,
    name: 'Pacific Union Bank',
    bic: 'PAUNUS66',
    shortName: 'Pacific Union',
    email: 'hello@pacificunion.example',
    phoneNumber: '+1 415 555 0104',
    status: 'ACTIVE' as const,
  },
  {
    id: 5,
    name: 'Central Cooperative Bank',
    bic: 'CCBKUS77',
    shortName: 'Central Co-op',
    email: 'service@centralcoop.example',
    phoneNumber: '+1 617 555 0105',
    status: 'INACTIVE' as const,
  },
];

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

  it('has a masked password field', () => {
    const passwordInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#password',
    );

    expect(passwordInput?.type).toBe('password');
  });

  async function submitLogin(username: string, password: string): Promise<void> {
    const usernameInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#username',
    );
    const passwordInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#password',
    );
    const form = (fixture.nativeElement as HTMLElement).querySelector<HTMLFormElement>('form');

    if (!usernameInput || !passwordInput || !form) {
      throw new Error('Expected login form inputs to exist.');
    }

    usernameInput.value = username;
    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function alertMessage(): string {
    return feedbackAlert().textContent?.trim() ?? '';
  }

  function feedbackAlert(): HTMLElement {
    const alert = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="alert"]');
    if (!alert) {
      throw new Error('Expected an alert banner to be present.');
    }
    return alert;
  }
});

describe('App routing', () => {
  it('redirects the default path to login', () => {
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute).toBeDefined();
    expect(defaultRoute?.redirectTo).toBe('login');
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('declares the participants route', () => {
    const participantsRoute = routes.find((route) => route.path === 'participants');

    expect(participantsRoute).toBeDefined();
    expect(participantsRoute?.component).toBe(ParticipantsComponent);
  });

  it('declares the add participant route', () => {
    const addRoute = routes.find((route) => route.path === 'participants/new');

    expect(addRoute).toBeDefined();
    expect(addRoute?.loadComponent).toBeDefined();
  });

  it('declares the edit participant route', () => {
    const editRoute = routes.find((route) => route.path === 'participants/edit/:id');

    expect(editRoute).toBeDefined();
    expect(editRoute?.loadComponent).toBeDefined();
  });
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
    httpTesting
      .expectOne('http://localhost:9081/api/v1/participants')
      .flush({ institutions: API_PARTICIPANTS });
    fixture.detectChanges();
  });

  it('displays all five participant banks and their details', () => {
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');

    expect(rows).toHaveLength(5);
    expect(fixture.nativeElement.textContent).toContain('First National Bank');
    expect(fixture.nativeElement.textContent).toContain('FNBKUS33');
    expect(fixture.nativeElement.textContent).toContain('Central Cooperative Bank');
  });

  it('displays the bank logo in the table when available', () => {
    const images = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr img');
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0].getAttribute('src')).toBe('http://localhost:9081/uploads/logos/FNBKUS33_logo.png');
  });

  it('displays participants added to the shared service', () => {
    TestBed.inject(ParticipantService).participants.push({
      id: 6,
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
      .flush({
        institution: {
          id: 6,
          name: 'New Bank',
          bic: 'NEWBUS88',
          shortName: 'New',
          email: 'contact@newbank.example',
          phoneNumber: '+1 202 555 0108',
          status: 'INACTIVE',
        },
      });

    expect(participantService.participants).toHaveLength(initialCount + 1);
    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('updates logo preview when an image file is chosen', async () => {
    const file = new File(['dummy content'], 'logo.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    fixture.componentInstance.onFileSelected(event);
    expect(fixture.componentInstance.selectedFile).toBe(file);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fixture.componentInstance.logoPreview).toBeTruthy();
  });

  it('uploads logo via multipart form data after saving participant', () => {
    fixture.componentInstance.participantForm.setValue({
      name: 'New Bank',
      bic: 'NEWBUS88',
      shortName: 'New',
      email: 'contact@newbank.example',
      phone: '+1 202 555 0108',
      status: 'INACTIVE',
    });
    const file = new File(['image-bytes'], 'logo.png', { type: 'image/png' });
    fixture.componentInstance.selectedFile = file;

    fixture.componentInstance.save();

    const createReq = httpTesting.expectOne('http://localhost:9081/api/v1/participants');
    expect(createReq.request.method).toBe('POST');
    createReq.flush({
      institution: {
        id: 7,
        name: 'New Bank',
        bic: 'NEWBUS88',
        shortName: 'New',
        email: 'contact@newbank.example',
        phoneNumber: '+1 202 555 0108',
        status: 'INACTIVE',
      },
    });

    const logoReq = httpTesting.expectOne('http://localhost:9081/api/v1/participants/7/logo');
    expect(logoReq.request.method).toBe('POST');
    expect(logoReq.request.body instanceof FormData).toBe(true);
    expect((logoReq.request.body as FormData).get('logo')).toBe(file);
    logoReq.flush({ success: 'Logo uploaded successfully' });

    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('cancels creation without adding a participant', () => {
    const initialCount = participantService.participants.length;

    fixture.componentInstance.cancel();

    expect(participantService.participants).toHaveLength(initialCount);
    expect(navigate).toHaveBeenCalledWith(['/participants']);
  });

  it('does not save an invalid form', () => {
    fixture.componentInstance.save();

    expect(participantService.participants).toHaveLength(0);
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

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let feedbackService: FeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    feedbackService = TestBed.inject(FeedbackService);
  });

  it('catches HTTP 500 server errors and displays friendly alert', () => {
    http.get('/api/test').subscribe({
      next: () => expect.unreachable('Should have failed'),
      error: () => {},
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    expect(feedbackService.toast()?.type).toBe('error');
    expect(feedbackService.toast()?.message).toBe('Internal Server Error');
  });

  it('catches status 0 connection errors and displays backend connection alert', () => {
    http.get('/api/test').subscribe({
      next: () => expect.unreachable('Should have failed'),
      error: () => {},
    });

    const req = httpTesting.expectOne('/api/test');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(feedbackService.toast()?.type).toBe('error');
    expect(feedbackService.toast()?.message).toContain('Unable to connect to the backend server');
  });
});

describe('ParticipantService', () => {
  let service: ParticipantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ParticipantService);
  });

  it('formats logo URLs correctly', () => {
    expect(service.getLogoUrl(null)).toBeNull();
    expect(service.getLogoUrl('http://example.com/logo.png')).toBe('http://example.com/logo.png');
    expect(service.getLogoUrl('/uploads/logos/bank.png')).toBe('http://localhost:9081/uploads/logos/bank.png');
    expect(service.getLogoUrl('bank.png')).toBe('http://localhost:9081/uploads/logos/bank.png');
  });
});
