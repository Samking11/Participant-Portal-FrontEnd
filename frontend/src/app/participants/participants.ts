import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Participant, ParticipantService } from './participant.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  selector: 'app-participants',
  styleUrl: './participants.css',
  templateUrl: './participants.html',
})
export class ParticipantsComponent {
  private readonly router = inject(Router);
  private readonly participantService = inject(ParticipantService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  participants: Participant[] = this.participantService.participants;
  errorMessage = '';
  isLoading = true;

  searchTerm = '';

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
    if (!window.confirm('Delete this participant?')) {
      return;
    }

    this.participantService.deleteParticipant(id).subscribe({
      next: () => this.loadParticipants(),
      error: () => {
        this.errorMessage = 'Unable to delete the participant.';
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private loadParticipants(): void {
    this.isLoading = this.participants.length === 0;
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
