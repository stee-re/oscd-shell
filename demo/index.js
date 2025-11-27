// import '@webcomponents/scoped-custom-element-registry';
// import '../dist/oscd-shell.js';
import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import {
  OscdMenuFileClose,
  OscdMenuFileRename,
  OscdMenuNew,
} from '@omicronenergy/oscd-menu-commons';
import OscdBackgroundEditV1 from '@omicronenergy/oscd-background-editv1';

const plugins = {
  menu: [
    {
      name: 'Open...',
      translations: { de: 'Datei öffnen' },
      icon: 'folder_open',
      tagName: 'oscd-menu-open',
    },
    {
      name: 'New File...',
      translations: { de: 'Neu Datei' },
      icon: 'note_add',
      tagName: 'oscd-menu-new',
    },
    {
      name: 'Save...',
      translations: { de: 'Datei speichern' },
      icon: 'save',
      requireDoc: true,
      tagName: 'oscd-menu-save',
    },
    {
      name: 'Rename...',
      translations: { de: 'Datei umbenenen' },
      icon: 'edit',
      requireDoc: true,
      src: 'https://omicronenergyoss.github.io/oscd-menu-commons/oscd-menu-file-rename.js',
    },
    {
      name: 'Close',
      translations: { de: 'Schließen' },
      icon: 'close',
      requireDoc: true,
      src: 'https://omicronenergyoss.github.io/oscd-menu-commons/oscd-menu-file-close.js',
    },
    {
      name: 'Add plugins...',
      translations: { de: 'Erweitern...' },
      icon: 'extension',
      src: './AddPlugins.js',
    },
  ],
  editor: [
    {
      name: 'SLD Designer',
      translations: {
        de: 'SLD entwerfen',
      },
      icon: 'add_box',
      requireDoc: true,
      src: 'https://omicronenergyoss.github.io/oscd-editor-sld/oscd-editor-sld.js',
    },

    {
      name: 'Engineering Workflows',
      translations: {
        de: 'Engineering-Workflows',
      },
      icon: 'automation',
      active: true,
      requireDoc: true,
      src: 'https://ase-compas.github.io/compas-transnetbw-plugins/bearingpoint/compas/plugins/engineering-wizard/index.js',
    },
  ],
  background: [
    {
      name: 'EditV1 Events Listener',
      icon: 'none',
      requireDoc: true,
      tagName: 'oscd-background-editv1',
    },
    {
      name: 'EditV1 Events Listener',
      icon: 'none',
      requireDoc: true,
      tagName: 'oscd-background-editv1',
    },
  ],
};

const oscdShell = document.querySelector('oscd-shell');
const { registry } = oscdShell;
registry.define('oscd-menu-open', OscdMenuOpen);
registry.define('oscd-menu-save', OscdMenuSave);
registry.define('oscd-menu-new', OscdMenuNew);
registry.define('oscd-menu-file-rename', OscdMenuFileRename);
registry.define('oscd-menu-file-close', OscdMenuFileClose);
registry.define('oscd-background-editv1', OscdBackgroundEditV1);

oscdShell.plugins = plugins;

const params = new URL(document.location).searchParams;
for (const [name, value] of params) {
  oscdShell.setAttribute(name, value);
}

// const sclDocString = await fetch('sample.scd').then(r => r.text());
// const sclDocString = `<?xml version="1.0" encoding="UTF-8"?>
//   <SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
//   <Substation name="A1" desc="test substation"></Substation>
// </SCL>`;
// oscdShell.docs = {
//   ['sample.scd']: new DOMParser().parseFromString(
//     sclDocString,
//     'application/xml',
//   ),
// };
// oscdShell.docName = 'sample.scd';
