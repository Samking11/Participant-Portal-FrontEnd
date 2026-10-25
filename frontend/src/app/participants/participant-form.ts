import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  readonly participantForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    bic: ['', [Validators.required, Validators.pattern(/\S/)]],
    shortName: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/\S/)]],
    status: ['ACTIVE' as ParticipantStatus, Validators.required],
  });

  submitted = false;

  save(): void {
    if (this.participantForm.invalid) {
      this.submitted = true;
      this.participantForm.markAllAsTouched();
      return;
    }

    this.submitted = false;
    const { name, bic, shortName, email, phone, status } = this.participantForm.getRawValue();
    this.participantService.addParticipant({
      name: name.trim(),
      bic: bic.trim(),
      shortName: shortName.trim(),
      email: email.trim(),
      phoneNumber: phone.trim(),
      status,
    });
    this.router.navigate(['/participants']);
  }

  cancel(): void {
    this.router.navigate(['/participants']);
  }
}
