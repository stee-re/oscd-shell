import { css } from 'lit';
import { colors } from './colors.js';

export const theming = css`
  ${colors}
  * {
    --oscd-primary: var(--oscd-theme-primary, var(--french-blue-15));
    --oscd-secondary: var(--oscd-theme-secondary, var(--french-blue-55));
    --secondary: var(--oscd-secondary);
    --oscd-theme-error: var(--oscd-theme-error, #dc322f);
    --oscd-base03: var(--oscd-theme-base03, var(--slate-0));
    --oscd-base02: var(--oscd-theme-base02, var(--slate-5));
    --oscd-base01: var(--oscd-theme-base01, var(--slate-25));
    --oscd-base00: var(--oscd-theme-base00, var(--slate-30));
    --oscd-base0: var(--oscd-theme-base0, var(--slate-65));
    --oscd-base1: var(--oscd-theme-base1, var(--slate-70));
    --oscd-base2: var(--oscd-theme-base2, var(--slate-110));
    --oscd-base3: var(--oscd-theme-base3, white);
    --oscd-error: var(--oscd-theme-error, #dc322f);
    --oscd-text-font: var(--oscd-theme-text-font, 'Roboto');
    --oscd-icon-font: var(--oscd-theme-icon-font, 'Material Icons');
    --oscd-text-font-mono: var(--oscd-theme-text-font-mono, 'Roboto Mono');
    --oscd-warning: var(--oscd-theme-warning, #b58900);
    --md-sys-color-primary: var(--oscd-primary);
    --md-sys-color-on-primary: var(--oscd-base3);
    --md-sys-color-secondary: var(--oscd-secondary);
    --md-sys-color-on-secondary: var(--oscd-base3);
    --md-sys-color-secondary-container: var(--oscd-base2);
    --md-sys-color-surface: var(--oscd-base3);
    --md-sys-color-on-surface: var(--oscd-base00);
    --md-sys-color-surface-variant: var(--oscd-base3);
    --md-sys-color-on-surface-variant: var(--oscd-base00);
    --md-sys-color-surface-bright: var(--oscd-base2);
    --md-sys-color-surface-container: var(--oscd-base3);
    --md-sys-color-surface-container-high: var(--oscd-base3);
    --md-sys-color-surface-container-highest: var(--oscd-base3);
    --md-sys-color-outline-variant: var(--oscd-primary);
    --md-sys-color-scrim: #000000;
    --md-sys-color-error: var(--oscd-error);
    --md-sys-color-on-error: var(--oscd-base3);
    /* --md-menu-item-selected-label-text-color: var(--oscd-base01); */
    --md-icon-button-disabled-icon-color: var(--oscd-base3);
    /* MDC Theme Colors 
       * Needed for supporting any pluggins still using the depricated MWC Components
       */
    --mdc-theme-primary: var(--oscd-primary);
    --mdc-theme-secondary: var(--oscd-secondary);
    --mdc-theme-background: var(--oscd-base3);
    --mdc-theme-surface: var(--oscd-base3);
    --mdc-theme-on-primary: var(--oscd-base2);
    --mdc-theme-on-secondary: var(--oscd-base3);
    --mdc-theme-on-background: var(--oscd-base00);
    --mdc-theme-on-surface: var(--oscd-base00);
    --mdc-theme-text-primary-on-background: var(--oscd-base01);
    --mdc-theme-text-secondary-on-background: var(--oscd-base3);
    --mdc-theme-text-icon-on-background: var(--oscd-base3);
    --mdc-theme-error: var(--oscd-error);
    --mdc-button-disabled-ink-color: var(--oscd-base1);
    --mdc-drawer-heading-ink-color: var(--oscd-base00);
    --mdc-dialog-heading-ink-color: var(--oscd-base00);
    --mdc-text-field-fill-color: var(--oscd-base2);
    --mdc-text-field-ink-color: var(--oscd-base02);
    --mdc-text-field-label-ink-color: var(--oscd-base01);
    --mdc-text-field-idle-line-color: var(--oscd-base00);
    --mdc-text-field-hover-line-color: var(--oscd-base02);
    --mdc-select-fill-color: var(--oscd-base2);
    --mdc-select-ink-color: var(--oscd-base02);
    --mdc-select-label-ink-color: var(--oscd-base01);
    --mdc-select-idle-line-color: var(--oscd-base00);
    --mdc-select-hover-line-color: var(--oscd-base02);
    --mdc-select-dropdown-icon-color: var(--oscd-base01);
    --mdc-typography-font-family: var(--oscd-text-font);
    --mdc-icon-font: var(--oscd-icon-font);
    --mdc-theme-text-disabled-on-light: rgba(255, 255, 255, 0.38);
  }
`;
