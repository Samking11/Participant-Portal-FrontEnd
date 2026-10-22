import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-participants',
  styleUrl: './participants.css',
  templateUrl: './participants.html',
})
export class ParticipantsComponent {
  private readonly router = inject(Router);

  logout(): void {
    this.router.navigate(['/login']);
  }
}
