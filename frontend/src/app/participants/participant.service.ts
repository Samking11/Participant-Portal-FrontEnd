import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

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

type ParticipantPayload = Omit<Participant, 'id'>;

interface ApiResponse<T> {
  institutions?: T[];
  institution?: T;
  data?: {
    institutions?: T[];
    institution?: T;
  };
}

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:9081/api/v1/participants';

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

  loadParticipants(): Observable<Participant[]> {
    return this.http.get<ApiResponse<Participant>>(this.apiUrl).pipe(
      map((response) => response.institutions ?? response.data?.institutions ?? []),
      map((participants) => {
        this.participants.splice(0, this.participants.length, ...participants);
        return this.participants;
      }),
    );
  }

  getParticipant(id: number): Observable<Participant> {
    return this.http.get<Participant>(`${this.apiUrl}/${id}`);
  }

  addParticipant(participant: ParticipantPayload): Observable<Participant> {
    const newParticipant = {
      ...participant,
      id: Math.max(0, ...this.participants.map(({ id }) => id)) + 1,
    };
    this.participants.push(newParticipant);

    return this.http
      .post<ApiResponse<Participant>>(this.apiUrl, participant)
      .pipe(
        map((response) => this.getInstitution(response)),
        map((createdParticipant) => {
          Object.assign(newParticipant, createdParticipant);
          return newParticipant;
        }),
      );
  }

  updateParticipant(id: number, participant: ParticipantPayload): Observable<Participant> {
    const existingParticipant = this.participants.find(({ id: participantId }) => participantId === id);
    if (existingParticipant) {
      Object.assign(existingParticipant, participant);
    }

    return this.http
      .put<ApiResponse<Participant>>(`${this.apiUrl}/${id}`, participant)
      .pipe(
        map((response) => this.getInstitution(response)),
        map((updatedParticipant) => {
          if (existingParticipant) {
            Object.assign(existingParticipant, updatedParticipant);
            return existingParticipant;
          }
          return updatedParticipant;
        }),
      );
  }

  deleteParticipant(id: number): Observable<void> {
    const participantIndex = this.participants.findIndex(({ id: participantId }) => participantId === id);
    if (participantIndex >= 0) {
      this.participants.splice(participantIndex, 1);
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private getInstitution(response: ApiResponse<Participant>): Participant {
    const institution = response.institution ?? response.data?.institution;

    if (!institution) {
      throw new Error('The participant API returned no institution.');
    }

    return institution;
  }
}
