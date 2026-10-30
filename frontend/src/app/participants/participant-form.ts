import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { ParticipantService, ParticipantStatus } from './participant.service';
import { AlertComponent } from '../shared/alert.component';
import { FeedbackService } from '../shared/feedback.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, LoadingSpinnerComponent, ReactiveFormsModule],
  selector: 'app-participant-form',
  styleUrl: './participant-form.css',
  templateUrl: './participant-form.html',
})
export class ParticipantFormComponent {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly participantService = inject(ParticipantService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly feedback = inject(FeedbackService);

  readonly isEditMode = this.route?.snapshot.paramMap.has('id') ?? false;
  private readonly participantId = Number(this.route?.snapshot.paramMap.get('id'));

  readonly participantForm = this.formBuilder.group({
    name: ['', Validators.required],
    bic: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(11),
        Validators.pattern(/^[A-Za-z0-9]+$/),
      ],
    ],
    shortName: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/\S/)]],
    status: ['ACTIVE' as ParticipantStatus, Validators.required],
  });

  submitted = false;
  errorMessage = '';
  isSaving = false;
  isLoading = false;

  selectedFile: File | null = null;
  logoPreview: string | null = null;
  currentLogoPath: string | null = null;

  isInvalid(controlName: keyof typeof this.participantForm.controls): boolean {
    const control = this.participantForm.controls[controlName];
    return control.invalid && control.touched;
  }

  constructor() {
    if (!this.isEditMode) {
      return;
    }

    this.isLoading = true;
    this.participantService
      .getParticipant(this.participantId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (participant) => {
          this.participantForm.patchValue({
            name: participant.name,
            bic: participant.bic,
            shortName: participant.shortName,
            email: participant.email,
            phone: participant.phoneNumber,
            status: participant.status,
          });
          if (participant.logoPath) {
            this.currentLogoPath = participant.logoPath;
          }
        },
        error: () => {
          this.feedback.showError('Participant not found.');
          this.router.navigate(['/participants']);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = null;
      this.logoPreview = null;
      this.changeDetectorRef.markForCheck();
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|svg)$/i)) {
      this.feedback.showError('Please select a valid image file (PNG, JPG).');
      input.value = '';
      this.selectedFile = null;
      this.logoPreview = null;
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
      this.changeDetectorRef.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeSelectedLogo(fileInput?: HTMLInputElement): void {
    this.selectedFile = null;
    this.logoPreview = null;
    if (fileInput) {
      fileInput.value = '';
    }
    this.changeDetectorRef.markForCheck();
  }

  getLogoUrl(path: string | null | undefined): string | null {
    return this.participantService.getLogoUrl(path);
  }

  save(): void {
    if (this.participantForm.invalid) {
      this.submitted = true;
      this.participantForm.markAllAsTouched();
      return;
    }

    this.submitted = false;
    this.errorMessage = '';
    const { name, bic, shortName, email, phone, status } = this.participantForm.getRawValue();
    const participant = {
      name: name.trim(),
      bic: bic.trim(),
      shortName: shortName.trim(),
      email: email.trim(),
      phoneNumber: phone.trim(),
      status,
    };

    this.isSaving = true;
    const request$ = this.isEditMode
      ? this.participantService.updateParticipant(this.participantId, participant)
      : this.participantService.addParticipant(participant);

    request$
      .pipe(
        switchMap((savedParticipant) => {
          if (this.selectedFile) {
            return this.participantService
              .uploadLogo(savedParticipant.id, this.selectedFile)
              .pipe(map(() => savedParticipant));
          }
          return of(savedParticipant);
        }),
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.feedback.showSuccess(
            this.isEditMode
              ? 'Participant updated successfully.'
              : 'Participant saved successfully.',
          );
          this.router.navigate(['/participants']);
        },
        error: () => {
          this.errorMessage = 'Unable to save the participant.';
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/participants']);
  }
}
