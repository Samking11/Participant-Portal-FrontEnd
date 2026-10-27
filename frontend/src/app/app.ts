import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertComponent } from './shared/alert.component';
import { FeedbackService } from './shared/feedback.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly feedback = inject(FeedbackService);
}
