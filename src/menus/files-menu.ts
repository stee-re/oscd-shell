import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized } from '@lit/localize';

import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';

import { LocaleTag } from '../utils/localization.js';

declare global {
  interface HTMLElementTagNameMap {
    'files-menu': FilesMenu;
  }
}
@localized()
export class FilesMenu extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-text-button': OscdTextButton,
    'oscd-icon': OscdIcon,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
  };

  /* Properties */

  @property({ type: Array })
  editableDocs: string[] = [];

  @property({ type: String })
  selectedDocName: string | undefined;

  @property({ type: String, reflect: true })
  locale!: LocaleTag;

  /* Queries */

  @query('#fileMenu')
  menu!: OscdMenu;

  render() {
    return html`
      <oscd-text-button
          id="fileMenuButton"
          @click=${() => this.menu.show()}
          trailing-icon
          >
          ${this.selectedDocName}
          <oscd-icon slot="icon">code</oscd-icon></oscd-filled-icon-button
        >
      </oscd-text-button>

      <oscd-menu
        fixed
        id="fileMenu"
        anchor="fileMenuButton"
        corner="BOTTOM_END"
      >
        ${this.editableDocs.map(
          name =>
            html`<oscd-menu-item
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: { name },
                  }),
                );
              }}
              ?selected=${this.selectedDocName === name}
              >${name}</oscd-menu-item
            >`,
        )}
      </oscd-menu>
    `;
  }

  static styles = css`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    :host oscd-text-button {
      --md-text-button-label-text-line-height: normal;
      --md-text-button-label-text-family: 'Roboto';
      --md-text-button-label-text-weight: 500;
      --md-text-button-label-text-size: 18px;
      --md-text-button-label-text-style: normal;
      --md-sys-color-primary: var(--oscd-base3);
      display: inline;
    }

    :host oscd-text-button oscd-icon {
      transform: rotate(90deg);
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
