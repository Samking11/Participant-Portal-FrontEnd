import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Participant, ParticipantService } from './participant.service';
import { AlertComponent } from '../shared/alert.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { FeedbackService } from '../shared/feedback.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, ConfirmModalComponent, FormsModule, LoadingSpinnerComponent],
  selector: 'app-participants',
  styleUrl: './participants.css',
  templateUrl: './participants.html',
})
export class ParticipantsComponent {
  private readonly router = inject(Router);
  private readonly participantService = inject(ParticipantService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly feedback = inject(FeedbackService);

  participants: Participant[] = this.participantService.participants;
  errorMessage = '';
  isLoading = true;

  searchTerm = '';
  pendingDelete: Participant | null = null;

  constructor() {
    this.loadParticipants();
  }

  get filteredParticipants(): Participant[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.participants;
    }

    return this.participants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(query) ||
        participant.bic.toLowerCase().includes(query),
    );
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  addParticipant(): void {
    this.router.navigate(['/participants/new']);
  }

  editParticipant(id: number): void {
    this.router.navigate(['/participants/edit', id]);
  }

  deleteParticipant(id: number): void {
    this.pendingDelete = this.participants.find((participant) => participant.id === id) ?? null;
  }

  confirmDelete(): void {
    if (!this.pendingDelete) {
      return;
    }

    const participant = this.pendingDelete;
    this.pendingDelete = null;
    this.isLoading = true;
    this.participantService.deleteParticipant(participant.id).subscribe({
      next: () => {
        this.feedback.showSuccess(`${participant.name} was deleted successfully.`);
        this.loadParticipants();
      },
      error: () => {
        this.isLoading = false;
        this.feedback.showError('Unable to delete the participant.');
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }

  private loadParticipants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.participantService.loadParticipants().subscribe({
      next: (participants) => {
        this.participants = participants;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load participants from the server.';
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }
}
