import '@webcomponents/scoped-custom-element-registry';
import '../oscd-shell.js';
import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdBackgroundEditV1 from '@omicronenergy/oscd-background-editv1';

const plugins = {
  menu: [
    {
      name: 'Open File',
      translations: { de: 'Datei öffnen' },
      icon: 'folder_open',
      tagName: 'oscd-menu-open',
    },
    {
      name: 'Save File',
      translations: { de: 'Datei speichern' },
      icon: 'save',
      requireDoc: true,
      tagName: 'oscd-menu-save',
    },
  ],
  editor: [
    {
      name: 'Design SLD',
      translations: {
        de: 'SLD entwerfen',
      },
      icon: 'add_box',
      requireDoc: true,
      src: 'https://omicronenergyoss.github.io/oscd-editor-sld/oscd-editor-sld.js',
    },

    {
      name: 'Communication',
      translations: {
        de: 'Kommunikation',
      },
      icon: 'settings_ethernet',
      active: true,
      requireDoc: true,
      src: 'https://omicronenergyoss.github.io/oscd-editor-communication/oscd-editor-communication.js',
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
