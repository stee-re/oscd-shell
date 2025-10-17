import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized, msg } from '@lit/localize';

import { OscdFilledIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdFilledIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';

import { LocaleTag, Translation } from '../utils/localization.js';
import { PluginEntry } from '../oscd-shell.js';

declare global {
  interface HTMLElementTagNameMap {
    'plugin-menu': PluginsMenu;
  }
}

@localized()
export class PluginsMenu extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-filled-icon-button': OscdFilledIconButton,
    'oscd-icon': OscdIcon,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
  };

  /* Properties */
  @property({ type: Array })
  editableDocs: string[] = [];

  @property({ type: Array })
  menuPlugins: PluginEntry[] = [];

  @property({ type: String })
  appIcon!: string;

  @property({ type: String })
  appTitle!: string;

  @property({ type: String, reflect: true })
  locale!: LocaleTag;

  @property({ type: String, reflect: true })
  open = () => {
    this.menu.show();
  };

  /* Queries */
  @query('oscd-menu')
  menu!: OscdMenu;

  renderMenuItem(plugin: PluginEntry, disabled: boolean) {
    return html`
      <oscd-menu-item
        .disabled=${disabled}
        @click=${() => {
          this.dispatchEvent(
            new CustomEvent('menu-plugin-select', {
              detail: { plugin },
              bubbles: true,
              composed: true,
            }),
          );
          this.menu.close();
        }}
      >
        <oscd-icon slot="start">${plugin.icon}</oscd-icon>
        <div slot="headline">
          ${plugin.translations?.[this.locale as Translation] || plugin.name}
        </div>
      </oscd-menu-item>
    `;
  }

  render() {
    return html`
      <img src=${this.appIcon} alt="logo" />
      <h1 class="app-title">${this.appTitle}</h1>
      <oscd-filled-icon-button
        id="menu-button"
        aria-label="${msg('Menu')}"
        @click=${async () => {
          if (this.menu.open) {
            this.menu.close();
          } else {
            this.menu.show();
          }
        }}
        ><oscd-icon>arrow_drop_down_circle</oscd-icon></oscd-filled-icon-button
      >
      <oscd-menu
        quick
        anchor="menu-button"
        menuCorner="START_END"
        anchorCorner="START_END"
      >
        ${this.menuPlugins.map(plugin =>
          this.renderMenuItem(
            plugin,
            !!(plugin.requireDoc && (this.editableDocs ?? []).length === 0),
          ),
        )}
      </oscd-menu>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    img {
      height: 34.4px;
      width: auto;
    }

    :host h1.app-title {
      font-family: Roboto;
      font-size: 22.114px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      display: inline;
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
