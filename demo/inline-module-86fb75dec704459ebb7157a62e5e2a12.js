import '../../../../../../dist/oscd-shell.js';

function isRemove(edit) {
    return (edit.parent === undefined &&
        edit.node instanceof Node);
}
function isInsert(edit) {
    return ((edit.parent instanceof Element ||
        edit.parent instanceof Document ||
        edit.parent instanceof DocumentFragment) &&
        edit.node instanceof Node &&
        (edit.reference instanceof Node ||
            edit.reference === null));
}

function isNamespaced(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'namespaceURI' in value &&
        typeof value.namespaceURI === 'string' &&
        'value' in value &&
        typeof value.value === 'string');
}
function isAttributes(attributes) {
    if (attributes === null || typeof attributes !== 'object') {
        return false;
    }
    return Object.entries(attributes).every(([key, value]) => typeof key === 'string' &&
        (value === null || typeof value === 'string' || isNamespaced(value)));
}
function isComplexEdit(edit) {
    return edit instanceof Array && edit.every(isEdit);
}
function isUpdate(edit) {
    return (edit.element instanceof Element &&
        isAttributes(edit.attributes));
}
function isEdit(edit) {
    if (isComplexEdit(edit)) {
        return true;
    }
    return isUpdate(edit) || isInsert(edit) || isRemove(edit);
}

function convertUpdate(edit) {
    let attributes = {};
    const attributesNS = {};
    Object.entries(edit.attributes).forEach(([key, value]) => {
        if (isNamespaced(value)) {
            const ns = value.namespaceURI;
            if (!ns) {
                return;
            }
            if (!attributesNS[ns]) {
                attributesNS[ns] = {};
            }
            attributesNS[ns] = { ...attributesNS[ns], [key]: value.value };
        }
        else {
            attributes = { ...attributes, [key]: value };
        }
    });
    return { element: edit.element, attributes, attributesNS };
}
function convertEdit(edit) {
    if (isRemove(edit)) {
        return edit;
    }
    if (isInsert(edit)) {
        return edit;
    }
    if (isUpdate(edit)) {
        return convertUpdate(edit);
    }
    if (isComplexEdit(edit)) {
        return edit.map(convertEdit);
    }
    return [];
}

function newOpenEvent(doc, docName) {
    return new CustomEvent('oscd-open', {
        bubbles: true,
        composed: true,
        detail: { doc, docName },
    });
}

class OscdMenuOpen extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.addEventListener('click', (event) => {
            event.target.value = '';
        });
        this.input.addEventListener('change', this.openDoc.bind(this));
        shadow.appendChild(this.input);
    }
    run() {
        this.input.click();
    }
    async openDoc(event) {
        const file = event.target?.files?.item(0);
        if (!file) {
            return;
        }
        const text = await file.text();
        const docName = file.name;
        const doc = new DOMParser().parseFromString(text, 'application/xml');
        this.dispatchEvent(newOpenEvent(doc, docName));
        this.input.onchange = null;
    }
}

class SaveProjectPlugin extends HTMLElement {
    async run() {
        if (this.doc) {
            let documentAsString = new XMLSerializer().serializeToString(this.doc);
            // Add XML declaration/prolog if it's been stripped
            // TODO: This can be removed once the improved OpenSCD core edit API is present
            documentAsString = documentAsString.startsWith('<?xml')
                ? documentAsString
                : '<?xml version="1.0" encoding="UTF-8"?>' + '\n' + documentAsString;
            const blob = new Blob([documentAsString], {
                type: 'application/xml',
            });
            const a = document.createElement('a');
            a.download = this.docName;
            a.href = URL.createObjectURL(blob);
            a.dataset.downloadurl = ['application/xml', a.download, a.href].join(':');
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () {
                URL.revokeObjectURL(a.href);
            }, 5000);
        }
    }
}

class OscdBackgroundEditV1 extends HTMLElement {
    constructor() {
        super();
        document.addEventListener('oscd-edit', (event) => {
            const editV2 = convertEdit(event.detail);
            this.editor.commit(editV2);
        });
    }
}

customElements.define('oscd-menu-open', OscdMenuOpen);
      customElements.define('oscd-menu-save', SaveProjectPlugin);
      customElements.define('oscd-background-editv1', OscdBackgroundEditV1);

      const plugins = {
        menu: [
          {
            name: 'Add plugins...',
            translations: { de: 'Erweitern...' },
            icon: 'extension',
            src: '/demo/AddPlugins.js',
          },
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
            name: 'Start',
            translations: {
              de: 'Start',
            },
            icon: 'start',
            src: 'https://openenergytools.github.io/scl-editor-landing/scl-editor-landing.js',
          },

          {
            name: 'Substation',
            icon: 'margin',
            requireDoc: true,
            src: 'https://openenergytools.github.io/scl-substation-editor/scl-substation-editor.js',
          },
          {
            name: 'Design SLD',
            translations: {
              de: 'Designer',
            },
            icon: 'add_box',
            requireDoc: true,
            src: 'https://openenergytools.github.io/oscd-designer/oscd-designer.js',
          },
        ],
        background: [
          {
            name: 'EditV1 Events Listener',
            icon: 'none',
            requireDoc: true,
            tagName: 'oscd-background-editv1',
          },
        ],
      };

      const editor = document.querySelector('oscd-shell');
      const params = new URL(document.location).searchParams;
      for (const [name, value] of params) {
        editor.setAttribute(name, value);
      }
      editor.plugins = plugins;
//# sourceMappingURL=inline-module-86fb75dec704459ebb7157a62e5e2a12.js.map
