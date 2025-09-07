import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized, msg } from '@lit/localize';

import { OscdAppBar } from '@omicronenergy/oscd-ui/app-bar/OscdAppBar.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdFilledIconButton.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { EditV2, Transactor } from '@openscd/oscd-api';

import { PluginEntry } from '../oscd-shell.js';
import { MenuPluginsDrowDownMenu } from './menu-plugins-dropdown-menu.js';
import { LocaleTag } from '../utils/localization.js';

declare global {
  interface HTMLElementTagNameMap {
    'app-bar': AppBar;
  }
}
@localized()
export class AppBar extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-app-bar': OscdAppBar,
    'oscd-dialog': OscdDialog,
    'oscd-filled-icon-button': OscdFilledIconButton,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-icon': OscdIcon,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
    'oscd-select-option': OscdSelectOption,
    'oscd-text-button': OscdTextButton,
    'plugins-menu': MenuPluginsDrowDownMenu,
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

  @property({ type: String, reflect: true })
  locale!: LocaleTag;

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
    return html`<oscd-app-bar>
      <slot name="alignStart" slot="alignStart"></slot>

      <div slot="alignMiddle" id="title">
        <h2>${this.docName}</h2>
        <oscd-filled-icon-button
          id="fileMenuButton"
          @click=${() => this.fileMenuUI.show()}
          ><oscd-icon>code</oscd-icon></oscd-filled-icon-button
        >

        <oscd-menu
          fixed
          id="fileMenu"
          anchor="fileMenuButton"
          corner="BOTTOM_END"
        >
          ${Object.keys(this.docs).map(
            (name, index) =>
              html`<oscd-menu-item
                @click=${() => {
                  this.docName = name;
                }}
                ?disabled=${!this.editableDocs.includes(name)}
                ?selected=${this.docName === name}
                id=${index}
                >${name}</oscd-menu-item
              >`,
          )}
        </oscd-menu>
      </div>

      <div slot="alignEnd">
        <oscd-filled-icon-button
          aria-label="${msg('Undo')}"
          ?disabled=${!this.canUndo}
          @click=${async () => {
            this.dispatchEvent(
              new CustomEvent('undo', { bubbles: true, composed: true }),
            );
          }}
          ><oscd-icon>undo</oscd-icon></oscd-filled-icon-button
        >
        <oscd-filled-icon-button
          aria-label="${msg('Redo')}"
          ?disabled=${!this.canRedo}
          @click=${async () => {
            this.dispatchEvent(
              new CustomEvent('redo', { bubbles: true, composed: true }),
            );
          }}
          ><oscd-icon>redo</oscd-icon></oscd-filled-icon-button
        >
      </div>
    </oscd-app-bar> `;
  }

  static styles = css`
    #title {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #title h2 {
      font-family: Roboto;
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      display: inline;
    }

    #title oscd-filled-icon-button {
      transform: rotate(90deg);
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

    oscd-app-bar * {
      --md-filled-icon-button-disabled-container-opacity: 0;
      --md-filled-icon-button-disabled-icon-color: var(
        --md-sys-color-on-primary
      );
    }

    * {
      --md-menu-item-selected-container-color: white;
    }

    #title {
      position: relative;
    }

    oscd-menu {
      min-width: 350px;
      padding: 12px;
    }

    oscd-menu-item {
      width: 100%;
    }
  `;
}
