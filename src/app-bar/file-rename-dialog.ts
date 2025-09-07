import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized, msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdFilledIconButton.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { EditV2, Transactor } from '@openscd/oscd-api';

import { PluginEntry } from '../oscd-shell.js';

declare global {
  interface HTMLElementTagNameMap {
    'file-rename-dialog': FileRenameDialog;
  }
}

@localized()
export class FileRenameDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-icon-button': OscdFilledIconButton,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-icon': OscdIcon,
    'oscd-select-option': OscdSelectOption,
    'oscd-text-button': OscdTextButton,
  };

  /* Properties */

  @property({ type: String })
  appIcon!: string;

  @property({ type: String })
  appTitle!: string;

  @property({ type: Object })
  xmlEditor!: Transactor<EditV2>;

  @property({ type: Array })
  menuPlugins: PluginEntry[] = [];

  @property({ type: Object })
  docs: Record<string, XMLDocument> = {};

  @property({ type: Array })
  editableDocs: string[] = [];

  @property({ type: String })
  docName: string | undefined;

  @property({ type: Object })
  doc: XMLDocument | undefined;

  @property({ attribute: false })
  docVersion: unknown;

  @property({ type: Array })
  editable: string[] = [];

  @property({ type: Boolean })
  canUndo = false;

  @property({ type: Boolean })
  canRedo = false;

  /* Queries */

  @query('#editFile')
  editFileUI!: OscdDialog;

  @query('#fileName')
  fileNameUI!: HTMLInputElement;

  @query('#fileExtension')
  fileExtensionUI!: HTMLInputElement;

  @query('#fileMenu')
  fileMenuUI!: OscdMenu;

  @query('#fileMenuButton')
  fileMenuButtonUI?: OscdFilledIconButton;

  render() {
    return html`
      <oscd-dialog
        id="editFile"
        @closed=${(event: CustomEvent) => {
          const dialog = event.target as OscdDialog;
          if (dialog.returnValue === 'remove') {
            this.dispatchEvent(
              new CustomEvent('close-file', {
                detail: { docName: this.docName! },
                bubbles: true,
                composed: true,
              }),
            );
          }
        }}
      >
        <div slot="headline">
          <oscd-icon>description</oscd-icon>${this.docName}
        </div>
        <form slot="content" id="edit-file-form" method="dialog">
          <oscd-filled-text-field
            id="fileName"
            label="${msg('Filename')}"
            value="${this.docName?.replace(/\.[^.]+$/, '')} ?? ''"
            @input=${(event: Event) => {
              const input = event.target as HTMLInputElement;
              const { value } = input;
              const name = `${value}.${this.fileExtensionUI.value}`;
              if (name in this.docs && name !== this.docName) {
                input.setCustomValidity('File already exists!');
              } else {
                input.setCustomValidity('');
              }
              input.reportValidity();
            }}
          ></oscd-filled-text-field>
          <oscd-filled-select
            label="${msg('Extension')}"
            fixedMenuPosition
            id="fileExtension"
            @selected=${() => this.fileNameUI.reportValidity()}
          >
            ${this.editable.map(
              ext =>
                html`<oscd-select-option
                  ?selected=${this.docName?.endsWith(`.${ext}`)}
                  value="${ext}"
                  >${ext}</oscd-select-option
                >`,
            )}
          </oscd-filled-select>
        </form>
        <div slot="actions">
          <oscd-text-button
            form="edit-file-form"
            class="edit-dialog-remove-button"
            value="remove"
          >
            <oscd-icon slot="icon">delete</oscd-icon>
            ${msg('Close file')}
          </oscd-text-button>
          <oscd-text-button form="edit-file-form" value="close">
            ${msg('Cancel')}
          </oscd-text-button>
          <oscd-text-button
            @click=${() => {
              const valid = this.fileNameUI.checkValidity();
              if (!valid) {
                this.fileNameUI.reportValidity();
                return;
              }
              const newDocName = `${this.fileNameUI.value}.${this.fileExtensionUI.value}`;
              this.dispatchEvent(
                new CustomEvent('rename-file', {
                  detail: {
                    oldName: this.docName!,
                    newName: newDocName,
                  },
                  bubbles: true,
                  composed: true,
                }),
              );
              this.editFileUI.close();
            }}
            trailing-icon
          >
            <oscd-icon slot="icon">edit</oscd-icon>
            ${msg('Rename')}
          </oscd-text-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    .fileext {
      opacity: 0.81;
    }

    .filename {
      caret-color: var(--oscd-secondary);
    }

    .filename:focus {
      outline: none;
    }

    .off-screen-plugin-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    abbr {
      text-decoration: none;
    }

    .edit-dialog-remove-button {
      --md-text-button-icon-color: var(--oscd-error);
      --md-text-button-label-text-color: var(--oscd-error);
      --md-text-button-focus-label-text-color: var(--oscd-error);
      --md-text-button-focus-icon-color: var(--oscd-error);
      --md-text-button-hover-label-text-color: var(--oscd-error);
      --md-text-button-hover-state-layer-color: var(--oscd-error);
      --md-text-button-hover-icon-color: var(--oscd-error);
      --md-text-button-pressed-label-text-color: var(--oscd-error);
      --md-text-button-pressed-state-layer-color: var(--oscd-error);
      --md-text-button-pressed-icon-color: var(--oscd-error);
    }
  `;
}
