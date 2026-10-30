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
  logoPath?: string | null;
}

type ParticipantPayload = Omit<Participant, 'id'>;

interface ApiResponse<T> {
  institutions?: T[];
  institution?: T;
  data?: {
    institutions?: T[];
    institution?: T;
  };
  success?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:9081/api/v1/participants';

  readonly participants: Participant[] = [];

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
    return this.http
      .post<ApiResponse<Participant>>(this.apiUrl, participant)
      .pipe(
        map((response) => this.getInstitution(response)),
        map((createdParticipant) => {
          this.participants.push(createdParticipant);
          return createdParticipant;
        }),
      );
  }

  updateParticipant(id: number, participant: ParticipantPayload): Observable<Participant> {
    return this.http
      .put<ApiResponse<Participant>>(`${this.apiUrl}/${id}`, participant)
      .pipe(
        map((response) => this.getInstitution(response)),
        map((updatedParticipant) => {
          const participantIndex = this.participants.findIndex(
            ({ id: participantId }) => participantId === id,
          );
          if (participantIndex >= 0) {
            this.participants[participantIndex] = updatedParticipant;
          }
          return updatedParticipant;
        }),
      );
  }

  deleteParticipant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const participantIndex = this.participants.findIndex(
          ({ id: participantId }) => participantId === id,
        );
        if (participantIndex >= 0) {
          this.participants.splice(participantIndex, 1);
        }
      }),
    );
  }

  uploadLogo(id: number, file: File): Observable<ApiResponse<Participant>> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<ApiResponse<Participant>>(`${this.apiUrl}/${id}/logo`, formData);
  }

  getLogoUrl(logoPath: string | null | undefined): string | null {
    if (!logoPath) {
      return null;
    }
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    if (logoPath.startsWith('/')) {
      return `http://localhost:9081${logoPath}`;
    }
    return `http://localhost:9081/uploads/logos/${logoPath}`;
  }

  private getInstitution(response: ApiResponse<Participant>): Participant {
    const institution = response.institution ?? response.data?.institution;

    if (!institution) {
      throw new Error('The participant API returned no institution.');
    }

    return institution;
  }
}
