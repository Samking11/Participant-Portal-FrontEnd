import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  readonly participants = this.participantService.participants;

  searchTerm = '';

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
}
