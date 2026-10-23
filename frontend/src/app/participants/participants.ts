import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Participant {
  id: number;
  name: string;
  bic: string;
  shortName: string;
  email: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  selector: 'app-participants',
  styleUrl: './participants.css',
  templateUrl: './participants.html',
})
export class ParticipantsComponent {
  private readonly router = inject(Router);

  readonly participants: Participant[] = [
    {
      id: 1,
      name: 'First National Bank',
      bic: 'FNBKUS33',
      shortName: 'FNB',
      email: 'contact@fnb.example',
      phoneNumber: '+1 212 555 0101',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Atlantic Commercial Bank',
      bic: 'ATCBUS44',
      shortName: 'Atlantic Bank',
      email: 'info@atlanticbank.example',
      phoneNumber: '+1 305 555 0102',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Summit Trust Bank',
      bic: 'SMTBUS55',
      shortName: 'Summit Trust',
      email: 'support@summittrust.example',
      phoneNumber: '+1 312 555 0103',
      status: 'INACTIVE',
    },
    {
      id: 4,
      name: 'Pacific Union Bank',
      bic: 'PAUNUS66',
      shortName: 'Pacific Union',
      email: 'hello@pacificunion.example',
      phoneNumber: '+1 415 555 0104',
      status: 'ACTIVE',
    },
    {
      id: 5,
      name: 'Central Cooperative Bank',
      bic: 'CCBKUS77',
      shortName: 'Central Co-op',
      email: 'service@centralcoop.example',
      phoneNumber: '+1 617 555 0105',
      status: 'INACTIVE',
    },
  ];

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
}
