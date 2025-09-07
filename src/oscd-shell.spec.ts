import { expect, fixtureCleanup, waitUntil } from '@open-wc/testing';
import {
  getFirstTextNodeContent,
  querySelectorContainingText,
} from '@omicronenergy/oscd-test-utils';

import '../oscd-shell.js';

import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';
import Sinon from 'sinon';

import { newEditEventV2, newOpenEvent } from '@openscd/oscd-api/utils.js';
import type { OscdShell } from './oscd-shell.js';

import { cyrb64 } from './foundation.js';
import { Plugin } from '@openscd/oscd-api';
import { EditorPluginsSidePanel } from './side-panel/editor-plugins-side-panel.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import {
  isPluginInstanciated,
  waitForAllPluginsToInstantiate,
} from './utils/testing/plugin-test-utils.js';
import {
  testMenuPlugin,
  testMenuPlugin2,
  testEditorPlugin,
  testEditorPlugin2,
  TestBackgroundPlugin,
} from './utils/testing/test-plugins.js';
import { createSclDocument } from './utils/testing/test-documents.js';

const getIndexOfSelectedEditor = (editorItems: OscdListItem[]) => {
  return editorItems.findIndex(item => item.classList.contains('active'));
};

describe('OscdShell', () => {
  let oscdShell: OscdShell;
  beforeEach(() => {
    oscdShell = document.createElement('oscd-shell');
    document.body.prepend(oscdShell);
  });

  afterEach(() => {
    oscdShell.remove();
    fixtureCleanup();
  });

  describe('with no documents loaded', async () => {
    beforeEach(async () => {
      if (!oscdShell.registry?.get('test-background-plugin')) {
        oscdShell.registry?.define(
          'test-background-plugin',
          TestBackgroundPlugin,
        );
      }
      oscdShell.plugins = {
        menu: [testMenuPlugin, testMenuPlugin2],
        editor: [testEditorPlugin, testEditorPlugin2],
        background: [
          {
            name: 'Test Background Plugin',
            tagName: 'test-background-plugin',
            icon: 'none',
          },
        ],
      };
      await oscdShell.updateComplete;

      await waitForAllPluginsToInstantiate(oscdShell);
    });

    it('loads menu plugins', () => {
      expect(oscdShell)
        .property('plugins')
        .property('menu')
        .to.have.lengthOf(2); //ok, they're set on the oscdShell. But that should be it.

      //NOTE: This test relies on the fact that the landing page contains the plugins, so they're searched for in a different way.
      expect(
        oscdShell.shadowRoot?.querySelectorAll('.menu-plugins > *'),
      ).to.have.lengthOf(1); //no document loaded, so no menu items should be shown.
    });

    it('loads menu background plugins', () => {
      expect(oscdShell)
        .property('plugins')
        .property('background')
        .to.have.lengthOf(1);
    });

    it('does not load editor plugins', () => {
      expect(oscdShell)
        .property('plugins')
        .property('editor')
        .to.have.lengthOf(2);

      expect(oscdShell.shadowRoot?.querySelector(oscdShell.editor)).to.not
        .exist;
    });
  });

  describe('with editor plugins loaded', () => {
    let editorPlugin: HTMLElement & Plugin & { editCount: number };
    const sclDoc = createSclDocument();

    beforeEach(async () => {
      oscdShell.dispatchEvent(newOpenEvent(sclDoc, 'test.scd'));

      oscdShell.plugins = {
        menu: [],
        editor: [testEditorPlugin, testEditorPlugin2],
      };
      await oscdShell.updateComplete;

      await waitForAllPluginsToInstantiate(oscdShell);

      editorPlugin = oscdShell.shadowRoot?.querySelector(
        oscdShell!.editor,
      ) as HTMLElement & Plugin & { editCount: number };
    });

    it('changes editor plugin when clicking on the editor item', async () => {
      const editorPluginsSidePanel = oscdShell.shadowRoot?.querySelector(
        'editor-plugins-side-panel',
      ) as EditorPluginsSidePanel;

      const editorItems = Array.from(
        editorPluginsSidePanel.shadowRoot?.querySelectorAll('oscd-list-item') ??
          [],
      ) as OscdListItem[];

      //Pre-checks...
      expect(editorPluginsSidePanel).to.exist;

      //expect there to be two editor entries
      expect(editorItems.length).to.equal(2);

      //expect first item to be active
      expect(getIndexOfSelectedEditor(editorItems)).to.equal(0);

      expect(
        getFirstTextNodeContent(editorItems[0].querySelector('span')),
      ).to.equal(testEditorPlugin.name);
      expect(
        getFirstTextNodeContent(editorItems[1].querySelector('span')),
      ).to.equal(testEditorPlugin2.name);

      const lastEditorItem = editorItems[editorItems.length - 1];
      expect(lastEditorItem).to.exist;
      lastEditorItem!.click();

      await oscdShell.updateComplete;

      await waitUntil(
        () => isPluginInstanciated(oscdShell.editor, oscdShell),
        'second editor plugin did not load',
      );

      const secondEditorPluginContent = oscdShell.shadowRoot!.querySelector(
        oscdShell!.editor,
      );
      expect(
        secondEditorPluginContent?.querySelector('p')?.textContent?.trim(),
      ).to.equal('Test Editor Plugin2');
      expect(getIndexOfSelectedEditor(editorItems)).to.equal(1);
    });

    it('passes attribute locale', () => {
      expect(editorPlugin.locale).to.equal('en');
    });

    it('has its docName property set', () => {
      expect(editorPlugin.docName).to.equal('test.scd');
    });

    it('has its doc property set', () => {
      expect(editorPlugin.doc).to.equal(sclDoc);
    });

    it('has its docs property set', () => {
      expect(editorPlugin.docs).to.be.an('object');
      expect(editorPlugin.docs['test.scd']).to.equal(sclDoc);
    });

    it('passes property docVersion', async () => {
      expect(editorPlugin.docVersion).to.equal(0);
      expect(editorPlugin.editCount).to.equal(0);
    });

    it('updated passed docVersion property on edit events', async () => {
      oscdShell.dispatchEvent(
        newEditEventV2({
          element: sclDoc.querySelector('Substation')!,
          attributes: { name: 'someName' },
          attributesNS: {},
        }),
      );
      await oscdShell.updateComplete;

      expect(editorPlugin.docVersion).to.equal(1);
      expect(editorPlugin.editCount).to.equal(1);
    });
  });

  describe('with menu plugins loaded', () => {
    let menuPlugin: HTMLElement & Plugin;
    beforeEach(async () => {
      oscdShell.plugins = {
        menu: [testMenuPlugin],
      };
      await oscdShell.updateComplete;
      await waitForAllPluginsToInstantiate(oscdShell);

      menuPlugin = oscdShell.shadowRoot?.querySelector(
        '.off-screen-plugin-container .menu-plugins > *:first-child',
      ) as HTMLElement & Plugin;
    });

    it('passes attribute locale', () => {
      expect(menuPlugin.locale).to.equal('en');
    });

    describe('with no document loaded', () => {
      it('has no docName property set', () => {
        expect(menuPlugin.docName).to.equal('');
      });

      it('has no doc property set', () => {
        expect(menuPlugin.doc).to.equal(undefined);
      });

      it('has no docs property set', () => {
        expect(menuPlugin.docs).to.be.an('object');
        expect(menuPlugin.docs).to.be.empty;
      });
    });

    describe('with a document loaded', async () => {
      let doc: XMLDocument;
      beforeEach(async () => {
        doc = createSclDocument();
        oscdShell.dispatchEvent(newOpenEvent(doc, 'test.scd'));
        await oscdShell.updateComplete;
        menuPlugin = oscdShell.shadowRoot?.querySelector(
          '.off-screen-plugin-container .menu-plugins > *:first-child',
        ) as HTMLElement & Plugin;
        console.log('beforeEach done');
      });

      it('has its docName property set', () => {
        expect(menuPlugin.docName).to.equal('test.scd');
        console.log('has its docName property set');
      });

      it('has its doc property set', () => {
        expect(menuPlugin.doc).to.equal(doc);
        console.log('has its doc property set');
      });

      it('has its docs property set', () => {
        expect(menuPlugin.docs).to.be.an('object');
        expect(menuPlugin.docs['test.scd']).to.equal(doc);
        console.log('has its docs property set');
      });

      it('passes property docVersion', () => {
        expect(menuPlugin).to.have.property('docVersion', 0);
        expect(menuPlugin).to.have.property('editCount', 0);
        console.log('passes property docVersion');
      });
    });

    it('updated passed docVersion property on edit events', async () => {
      const doc = createSclDocument();
      oscdShell.dispatchEvent(newOpenEvent(doc, 'test.scd'));
      await oscdShell.updateComplete;

      oscdShell.dispatchEvent(
        newEditEventV2({
          element: doc.querySelector('testdoc')!,
          attributes: { name: 'someName' },
          attributesNS: {},
        }),
      );
      await oscdShell.updateComplete;

      expect(menuPlugin).to.have.property('docVersion', 1);
      expect(menuPlugin).to.have.property('editCount', 1);
    });
  });

  describe('Custom plugins', () => {
    beforeEach(async () => {
      oscdShell.plugins = {
        menu: [testMenuPlugin],
        editor: [testEditorPlugin],
      };
      await oscdShell.updateComplete;

      await waitUntil(
        () =>
          oscdShell.menuUI.shadowRoot?.querySelectorAll('oscd-menu-item')
            .length === 1,
        `Custom Menu Plugin "${testMenuPlugin.name}" did not load`,
      );
    });

    it('executes the plugin upon menu item click', async () => {
      const sclDoc = createSclDocument();
      oscdShell.dispatchEvent(newOpenEvent(sclDoc, 'test.scd'));
      await oscdShell.updateComplete;
      const node = oscdShell.doc.querySelector('Substation')!;
      oscdShell.dispatchEvent(newEditEventV2({ node }));
      await oscdShell.updateComplete;
      expect(sclDoc.querySelector('Substation')).to.not.exist;

      oscdShell.menuUI.open();
      await oscdShell.menuUI.updateComplete;

      const pluginMenuItem = oscdShell.menuUI.shadowRoot?.querySelectorAll(
        'oscd-menu-item',
      )[0] as OscdMenuItem;
      expect(pluginMenuItem).to.exist;
      expect(pluginMenuItem).to.have.property('disabled', false);
      pluginMenuItem?.click();
      await oscdShell.updateComplete;
      expect(sclDoc.querySelector('Substation')).to.exist;
    });

    it('does not attempt to call customElements.define if the plugin has already been defined', async () => {
      const customEditorPlugin = {
        name: 'Test 123 Editor Plugin',
        src: 'data:text/javascript;charset=utf-8,export%20default%20class%20TestEditorPlugin%20extends%20HTMLElement%20%7B%0D%0A%20%20constructor%20%28%29%20%7B%20super%28%29%3B%20this.innerHTML%20%3D%20%60%3Cp%3ETest123%20Editor%20Plugin%3C%2Fp%3E%60%3B%20%7D%0D%0A%7D',
        icon: 'edit',
        requireDoc: false,
      };

      const customEditorPluginTagName = `oscd-p${cyrb64(customEditorPlugin.src)}`;

      if (!oscdShell.registry?.get(customEditorPluginTagName)) {
        oscdShell.registry?.define(
          customEditorPluginTagName,
          class extends HTMLElement {},
        );
      }

      expect(oscdShell.registry).not.to.be.undefined;
      const customElementDefineSpy =
        oscdShell.registry?.define && Sinon.spy(oscdShell.registry, 'define');

      oscdShell.plugins = { menu: [], editor: [customEditorPlugin] };
      await oscdShell.updateComplete;

      expect(customElementDefineSpy!.called).to.be.false;
    });
  });

  describe('localization', () => {
    let menuItemStrings: string[] = [];
    let editorTabStrings: string[] = [];

    beforeEach(async () => {
      oscdShell.plugins = {
        menu: [testMenuPlugin],
        editor: [testEditorPlugin],
      };
      await oscdShell.updateComplete;
      await waitUntil(
        () =>
          querySelectorContainingText(
            oscdShell.menuUI,
            'oscd-menu-item > div',
            testMenuPlugin.name,
          ),
        `Custom menu plugin (${testMenuPlugin.name}) did not load`,
      );
      await waitUntil(
        () =>
          querySelectorContainingText(
            oscdShell.shadowRoot!.querySelector('oscd-tabs')!,
            'oscd-secondary-tab',
            testEditorPlugin.name,
          ),
        `Custom editor plugin (${testEditorPlugin.name}) did not load`,
      );

      menuItemStrings = Array.from(
        oscdShell.menuUI.querySelectorAll('oscd-list-item > span'),
      ).map(span => (span as Element).textContent?.trim() || '');

      editorTabStrings = Array.from(
        oscdShell?.shadowRoot?.querySelectorAll('oscd-secondary-tab') || [],
      ).map(
        tab =>
          Array.from((tab as Element).childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent?.trim() ?? '')[0] || '',
      );

      // we only change the locale after waiting for the plugins to load and getting their default strings
      oscdShell.locale = 'de';
      await waitUntil(
        () => oscdShell.locale === 'de',
        'Locale failed to change',
      );
    });

    afterEach(async () => {
      // reset to en so we can find the loaded plugins by their name
      oscdShell.locale = 'en';
      await oscdShell.updateComplete;
    });

    it('the menu items appear in german', () => {
      const untranslatedStrings = Array.from(
        oscdShell.menuUI.querySelectorAll('oscd-menu-item > div'),
      )
        .map(span => (span as Element).textContent?.trim() || '')
        .filter((text: string) => menuItemStrings.includes(text));

      expect(untranslatedStrings).to.be.empty;
    });

    it('the editor plugin appears in german', () => {
      const untranslatedStrings = Array.from(
        oscdShell.pluginsSidePanelUI.shadowRoot?.querySelectorAll(
          'oscd-list-item > span',
        ) || [],
      )
        .map(span => (span as Element).textContent?.trim() || '')
        .filter((text: string) => editorTabStrings.includes(text));

      expect(untranslatedStrings).to.be.empty;
    });

    it('it remains in english after attempting to load a non-existing locale', async () => {
      oscdShell.locale = 'en';
      // @ts-expect-error we want to test a non-existing locale
      oscdShell.locale = 'xx';
      await waitUntil(
        () => oscdShell.locale === 'en',
        'Locale failed to change',
      );
      expect(oscdShell.locale).to.equal('en');
    });
  });
});
