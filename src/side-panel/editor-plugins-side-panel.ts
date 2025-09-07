import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized } from '@lit/localize';

import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdList } from '@omicronenergy/oscd-ui/list/OscdList.js';
import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';

import { LocaleTag, Translation } from '../utils/localization.js';
import { classMap } from 'lit/directives/class-map.js';
import { PluginEntry } from '../oscd-shell.js';

declare global {
  interface HTMLElementTagNameMap {
    'plugins-side-panel': EditorPluginsSidePanel;
  }
}

@localized()
export class EditorPluginsSidePanel extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-icon-button': OscdIconButton,
    'oscd-icon': OscdIcon,
    'oscd-list': OscdList,
    'oscd-list-item': OscdListItem,
  };

  @property({ type: Array })
  editors: PluginEntry[] = [];

  @property({ type: Number })
  editorIndex = 0;

  @property({ type: String })
  locale!: LocaleTag;

  @state()
  _expanded = true;

  @property({ type: Boolean, reflect: true })
  get expanded() {
    const e = localStorage.getItem('editorsPanel.expanded');
    if (typeof e !== 'undefined' && e !== null) {
      this._expanded = e === 'true';
    }
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    localStorage.setItem('editorsPanel.expanded', String(expanded));
    this._expanded = expanded;
  }

  render() {
    return html`
      <oscd-list class="editors-list" role="tablist">
        ${this.editors.map(
          (editor, index) =>
            html`<oscd-list-item
              class=${classMap({ active: this.editorIndex === index })}
              type="button"
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent('editor-select', {
                    detail: { editor, index },
                    bubbles: true,
                    composed: true,
                  }),
                );
              }}
            >
              <oscd-icon slot="start">${editor.icon}</oscd-icon>
              ${this.expanded
                ? html`<span
                    >${editor.translations?.[this.locale as Translation] ||
                    editor.name}</span
                  >`
                : nothing}
            </oscd-list-item>`,
        )}
      </oscd-list>
      <div class="footer">
        <oscd-icon-button
          class="toggle-button"
          @click=${() => {
            this.expanded = !this.expanded;
          }}
        >
          <oscd-icon
            >${this.expanded
              ? 'left_panel_close'
              : 'left_panel_open'}</oscd-icon
          ></oscd-icon-button
        >
      </div>
    `;
  }

  static styles = css`
    :host {
      width: 76px;
      height: calc(100% - 24px);
      display: grid;
      grid-template-rows: 1fr auto;
      min-height: 0;
      padding-top: 20px;
      transition: width 0.1s ease-in-out;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .editors-list {
      min-height: 0;
      --md-list-item-leading-space: 22px;
      --md-list-item-trailing-space: 10px;
      --md-icon-size: 28px;
      --md-list-container-color: rgba(0, 0, 0, 0);
      --md-list-item-label-text-color: var(--oscd-base3);
      --md-list-item-leading-icon-color: var(--oscd-base3);
    }

    .editors-list .active {
      background-color: var(--oscd-primary);
    }

    .editors-list oscd-list-item span {
      /* prevents jitter when collapsing */
      white-space: nowrap;
    }

    .footer {
      display: flex;
      justify-self: center;
      justify-content: center;
      padding-block: 22px;
    }

    .toggle-button {
      --md-icon-color: var(--oscd-base3);
      --md-icon-button-icon-size: 32px;
      --md-icon-button-hover-state-layer-color: var(--oscd-base3);
      --md-icon-button-hover-state-layer-opacity: 0.08;
      --md-icon-button-icon-color: var(--oscd-base3);
      --md-icon-button-hover-icon-color: var(--oscd-base3);
      --md-icon-button-focus-icon-color: var(--oscd-base3);
      --md-icon-button-pressed-icon-color: var(--oscd-base3);
      --md-icon-button-state-layer-height: 48px;
      --md-icon-button-state-layer-width: 48px;
    }

    :host([expanded]) {
      width: 295px;
    }

    :host([expanded]) .footer {
      justify-self: flex-end;
      justify-content: flex-end;
      padding-inline: 22px;
    }
  `;
}
