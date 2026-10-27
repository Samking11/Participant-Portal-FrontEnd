import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-state" role="status" aria-live="polite">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>{{ message() }}</span>
    </div>
  `,
  styles: `
    .loading-state {
      align-items: center;
      display: flex;
      gap: 0.6rem;
      justify-content: center;
      padding: 1.5rem;
    }
  `,
})
export class LoadingSpinnerComponent {
  readonly message = input('Loading...');
}
