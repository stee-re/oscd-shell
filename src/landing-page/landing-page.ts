import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized } from '@lit/localize';

import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';

import { PluginEntry } from '../oscd-shell.js';
import { LocaleTag } from '../localization.js';
import { OscdElevation } from '@omicronenergy/oscd-ui/elevation/OscdElevation.js';

declare global {
  interface HTMLElementTagNameMap {
    'landing-page': LandingPage;
  }
}
@localized()
export class LandingPage extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-text-button': OscdTextButton,
    'oscd-elevation': OscdElevation,
  };

  /* Properties */

  @property({ type: String })
  heading: string = '';

  @property({ type: String })
  subHeading: string = '';
  @property({ type: Array })
  menuPlugins: PluginEntry[] = [];

  @property({ type: String, reflect: true })
  locale!: LocaleTag;

  render() {
    return html`
      <h1 class="heading">${this.heading}</h1>
      <h2 class="sub-heading">${this.subHeading}</h2>
      <div class="menu-plugins-grid">
        ${this.menuPlugins.map(
          plugin =>
            html`<oscd-text-button
              class="menu-plugin-item"
              @click=${() => {
                this.dispatchEvent(
                  new CustomEvent('menu-plugin-select', {
                    detail: { plugin },
                    bubbles: true,
                    composed: true,
                  }),
                );
              }}
            >
              <oscd-elevation></oscd-elevation>
              <div class="menu-plugin-item-content">
                <oscd-icon>${plugin.icon}</oscd-icon>
                <span>${plugin.name}</span>
                <div class="menu-plugin-item-corner-wedge"></div>
              </div>
            </oscd-text-button> `,
        )}
      </div>
    `;
  }

  static styles = css`
    .host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .heading {
      color: var(--oscd-base3);
      text-align: center;
      font-family: 'Roboto';
      font-size: 50px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      margin-block-start: 64px;
      margin-block-end: 8px;

      --md-icon-size: 50px;
    }

    .sub-heading {
      color: var(--oscd-base3);
      text-align: center;
      font-family: Roboto;
      font-size: 16.909px;
      font-style: normal;
      font-weight: 400;
      line-height: 65.194px; /* 385.56% */

      margin-block-end: 168px;
    }

    .menu-plugins-grid {
      width: 60%;
      display: flex;
      flex-wrap: wrap;
      gap: 95px;
      justify-content: center;
      margin: 0 auto;
      padding: 16px 0;
    }

    .menu-plugin-item {
      --md-text-button-container-shape: 2px;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: center;
      padding: 8px;
      color: var(--oscd-base3);
      background: var(--oscd-primary);
      transition: background-color 0.3s;
      cursor: pointer;
    }

    .menu-plugin-item:hover {
      --md-elevation-level: 2;
    }

    .menu-plugin-item-content {
      color: var(--oscd-base3);
      width: 240px;
      height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      font-family: 'Roboto';
    }

    .menu-plugin-item-content oscd-icon {
      --md-icon-size: 54px;
    }

    .menu-plugin-item-content span {
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px; /* 135% */
    }

    .menu-plugin-item-corner-wedge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 50px;
      height: 50px;
      background: linear-gradient(
        to top left,
        var(--omicron-yellow) 50%,
        transparent 50%
      );
    }
  `;
}
