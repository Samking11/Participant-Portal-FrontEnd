import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-alert',
  template: `
    <div class="alert" [class.alert-danger]="type() === 'error'" [class.alert-success]="type() === 'success'" role="alert">
      <span>{{ message() }}</span>
      @if (dismissible()) {
        <button type="button" class="btn-close" aria-label="Dismiss" (click)="dismiss.emit()"></button>
      }
    </div>
  `,
})
export class AlertComponent {
  readonly message = input.required<string>();
  readonly type = input<'success' | 'error'>('error');
  readonly dismissible = input(false);
  readonly dismiss = output<void>();
}
