import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantService, ParticipantStatus } from './participant.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
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

  isInvalid(controlName: keyof typeof this.participantForm.controls): boolean {
    const control = this.participantForm.controls[controlName];
    return control.invalid && control.touched;
  }

  constructor() {
    if (!this.isEditMode) {
      return;
    }

    this.participantService.getParticipant(this.participantId).subscribe({
      next: (participant) => {
        this.participantForm.patchValue({
          name: participant.name,
          bic: participant.bic,
          shortName: participant.shortName,
          email: participant.email,
          phone: participant.phoneNumber,
          status: participant.status,
        });
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        window.alert('Participant not found.');
        this.router.navigate(['/participants']);
      },
    });
  }

  save(): void {
    if (this.participantForm.invalid) {
      this.submitted = true;
      this.participantForm.markAllAsTouched();
      return;
    }

    this.submitted = false;
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
    const request = this.isEditMode
      ? this.participantService.updateParticipant(this.participantId, participant)
      : this.participantService.addParticipant(participant);

    request.subscribe({
      next: () => this.router.navigate(['/participants']),
      error: () => {
        this.errorMessage = 'Unable to save the participant.';
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/participants']);
  }
}
