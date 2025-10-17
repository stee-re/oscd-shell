import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { OscdShell } from '../../oscd-shell.js';

export class TestMenuPlugin1 extends LitElement {
  @property({})
  docVersion = 0;

  async run() {
    const editor = (this.getRootNode() as ShadowRoot).host as OscdShell;
    editor.undo();
    return true;
  }
}

export class TestBackgroundPlugin extends HTMLElement {
  constructor() {
    super();
    document.addEventListener('test-tx', event => {
      document.dispatchEvent(
        new CustomEvent('test-rx', {
          detail: (event as CustomEvent).detail,
        }),
      );
    });
  }
}

export const testMenuPlugin1 = {
  name: 'Test Undo Menu Plugin 1',
  translations: { de: 'Test Rückgängig-Menü-Plugin' },
  tagName: 'test-menu-plugin1',
  icon: 'undo',
  requireDoc: false,
};

export const testMenuPlugin2 = {
  name: 'Test Undo Menu Plugin 2',
  translations: { de: 'Test Rückgängig-Menü-Plugin 2' },
  src: 'data:text/javascript;charset=utf-8,export%20default%20class%20TestPlugin%20extends%20HTMLElement%20%7B%0D%0A%20%20async%20run()%20%7B%0D%0A%20%20const%20editor2%20=%20(this.getRootNode()).host;%20%0D%0A%20editor2.undo();%0D%0A%20return%20true;%0D%0A%20%20%7D%0D%0A%7D',
  icon: 'undo',
  requireDoc: true,
};

export const testEditorPlugin = {
  name: 'Test Editor Plugin',
  translations: { de: 'Test Editor Erweiterung' },
  src: 'data:text/javascript;charset=utf-8,export%20default%20class%20TestEditorPlugin%20extends%20HTMLElement%20%7B%0D%0A%20%20constructor%20%28%29%20%7B%20super%28%29%3B%20this.innerHTML%20%3D%20%60%3Cp%3ETest%20Editor%20Plugin%3C%2Fp%3E%60%3B%20%7D%0D%0A%7D',
  icon: 'edit',
  requireDoc: false,
};
export const testEditorPlugin2 = {
  name: 'Test Editor Plugin 2',
  translations: { de: 'Test Editor Erweiterung 2' },
  src: 'data:text/javascript;charset=utf-8,export%20default%20class%20TestEditorPlugin2%20extends%20HTMLElement%20%7B%0D%0A%20%20constructor%20%28%29%20%7B%20super%28%29%3B%20this.innerHTML%20%3D%20%60%3Cp%3ETest%20Editor%20Plugin2%3C%2Fp%3E%60%3B%20%7D%0D%0A%7D',
  icon: 'edit',
  requireDoc: true,
};
