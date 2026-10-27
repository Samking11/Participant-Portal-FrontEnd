import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-confirm-modal',
  template: `
    @if (open()) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="confirm-title" class="modal-title fs-5">{{ title() }}</h2>
              <button type="button" class="btn-close" aria-label="Close" (click)="cancel.emit()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">{{ message() }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="cancel.emit()">Cancel</button>
              <button type="button" class="btn btn-danger" (click)="confirm.emit()">Delete</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input.required<string>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
