import { expect, fixture, html } from '@open-wc/testing';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import type { OscdShell } from '../oscd-shell.js';

import '../oscd-shell.js';
import { createTestDocs } from '../utils/testing/test-doc-helpers.js';
import { FilesMenu } from './files-menu.js';

describe('files-menu', () => {
  let oscdShell: OscdShell;
  let filesMenu: FilesMenu;
  let docs: Record<string, XMLDocument>;

  beforeEach(async () => {
    docs = createTestDocs(3);
    oscdShell = <OscdShell>(
      await fixture(
        html`<oscd-shell
          .docs=${docs}
          docName=${Object.keys(docs)[0]}
        ></oscd-shell>`,
      )
    );
    filesMenu = oscdShell.shadowRoot!.querySelector('files-menu')!;
    await oscdShell.updateComplete;
    await filesMenu.updateComplete;
  });

  it('allows the user to switch documents', async () => {
    const fileDropdownButton =
      filesMenu.shadowRoot?.querySelector('oscd-text-button');
    expect(fileDropdownButton).to.exist;
    fileDropdownButton?.click();
    await filesMenu.updateComplete;
    (filesMenu.menu.firstElementChild as OscdMenuItem).click();
    await oscdShell.updateComplete;
    const oldDocName = oscdShell.docName;
    fileDropdownButton?.click();
    await filesMenu.updateComplete;
    (filesMenu.menu.lastElementChild as OscdMenuItem).click();
    await oscdShell.updateComplete;
    expect(oscdShell).to.not.have.property('docName', oldDocName);
  });
});
