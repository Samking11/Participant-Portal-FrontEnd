import { Injectable } from '@angular/core';

export type ParticipantStatus = 'ACTIVE' | 'INACTIVE';

export interface Participant {
  id: number;
  name: string;
  bic: string;
  shortName: string;
  email: string;
  phoneNumber: string;
  status: ParticipantStatus;
}

@Injectable({ providedIn: 'root' })
export class ParticipantService {
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

  addParticipant(participant: Omit<Participant, 'id'>): Participant {
    const newParticipant = {
      ...participant,
      id: Math.max(0, ...this.participants.map(({ id }) => id)) + 1,
    };
    this.participants.push(newParticipant);
    return newParticipant;
  }

  getParticipant(id: number): Participant | undefined {
    return this.participants.find((participant) => participant.id === id);
  }

  updateParticipant(id: number, participant: Omit<Participant, 'id'>): Participant | undefined {
    const existingParticipant = this.getParticipant(id);

    if (!existingParticipant) {
      return undefined;
    }

    Object.assign(existingParticipant, participant);
    return existingParticipant;
  }
}
