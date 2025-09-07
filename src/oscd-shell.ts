import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { localized } from '@lit/localize';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

import { OscdFilledIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdFilledIconButton.js';
import { OscdList } from '@omicronenergy/oscd-ui/list/OscdList.js';
import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import { XMLEditor } from '@omicronenergy/oscd-editor';
import { EditEventV2, OpenEvent } from '@openscd/oscd-api';

import { loadSourcedPlugins } from './utils/plugin-utils.js';
import {
  getLocale,
  LocaleTag,
  setLocale,
  Translations,
} from './utils/localization.js';
import { AppBar } from './app-bar/app-bar.js';
import { theming } from './theming.js';
import { EditorPluginsSidePanel } from './side-panel/editor-plugins-side-panel.js';
import { MenuPluginsDrowDownMenu } from './app-bar/menu-plugins-dropdown-menu.js';
import { LandingPage } from './landing-page/landing-page.js';

export type PluginEntry = {
  name: string;
  translations?: Translations;
  tagName: string;
  icon: string;
  requireDoc?: boolean;
};

export type SourcedPluginEntry = {
  name: string;
  translations?: Translations;
  src: string;
  icon: string;
  requireDoc?: boolean;
};
export type PluginSet<P = PluginEntry> = {
  menu: P[];
  editor: P[];
  background: P[];
};

@localized()
@customElement('oscd-shell')
export class OscdShell extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'app-bar': AppBar,
    'menu-plugins-dropdown-menu': MenuPluginsDrowDownMenu,
    'editor-plugins-side-panel': EditorPluginsSidePanel,
    'oscd-list': OscdList,
    'oscd-list-item': OscdListItem,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
    'landing-page': LandingPage,
  };

  /*
   * Properties
   */

  @property({ type: String })
  appIcon: string = 'home_app_logo';

  @property({ type: String })
  appTitle: string = 'OpenSCD';

  @property({ type: String })
  landingPageHeading?: string = 'Welcome to OpenSCD';

  @property({ type: Object })
  landingPageHeadingIcon?: Element;

  @property({ type: String })
  landingPageSubHeading?: string = 'Open Source Project Editing Platform';

  @property({ type: Object })
  landingPageContent?: Element;

  /** The file endings of editable files */
  @property({ type: Array, reflect: true }) editable = [
    'cid',
    'icd',
    'iid',
    'scd',
    'sed',
    'ssd',
  ];

  @property({ type: String, reflect: true })
  get locale() {
    return getLocale() as LocaleTag;
  }

  set locale(tag: LocaleTag) {
    try {
      if (tag) {
        setLocale(tag);
      }
    } catch {
      // don't change locale if tag is invalid
    }
  }

  _plugins: PluginSet = { menu: [], editor: [], background: [] };

  @property({ type: Object })
  get plugins(): PluginSet {
    return this._plugins;
  }

  set plugins(
    plugins: Partial<PluginSet<Partial<PluginEntry | SourcedPluginEntry>>>,
  ) {
    this._plugins = Object.entries(plugins).reduce(
      (acc, [pluginType, kind]) => {
        const convertedPlugins = loadSourcedPlugins(kind, this.registry!);
        acc[pluginType as keyof PluginSet] = convertedPlugins;
        return acc;
      },
      { menu: [], editor: [], background: [] } as PluginSet,
    );
  }

  /*
   * States
   */
  @state()
  get canRedo(): boolean {
    return this.xmlEditor.future.length >= 1;
  }

  @state()
  get canUndo(): boolean {
    return this.xmlEditor.past.length >= 1;
  }

  @state()
  get editor() {
    return this.plugins.editor[this.editorIndex]?.tagName ?? '';
  }

  @state()
  private editorIndex = 0;

  @state()
  /** The `XMLDocument` currently being edited */
  get doc(): XMLDocument {
    return this.docs[this.docName];
  }

  /** The name of the [[`doc`]] currently being edited */
  @property({ type: String, reflect: true })
  docName = '';

  /** The set of `XMLDocument`s currently loaded */
  private _docs: Record<string, XMLDocument> = {};

  @state()
  get docs(): Record<string, XMLDocument> {
    return this._docs;
  }

  set docs(newDocs: Record<string, XMLDocument>) {
    this._docs = newDocs;
    this.onDocsChanged();
  }

  @state()
  docVersion: number = -1;

  @state()
  get editableDocs(): string[] {
    return Object.keys(this.docs).filter(name => this.isEditable(name));
  }

  @state()
  get last(): number {
    return this.xmlEditor.past.length - 1;
  }

  @state()
  xmlEditor: XMLEditor = new XMLEditor();

  /*
   * All Queries
   */
  @query('#fileMenu')
  fileMenuUI!: OscdMenu;

  @query('#fileMenuButton')
  fileMenuButtonUI?: OscdFilledIconButton;

  @query('#fileName')
  fileNameUI!: HTMLInputElement;

  @query('menu-plugins-dropdown-menu')
  menuUI!: MenuPluginsDrowDownMenu;

  @query('editor-plugins-side-panel')
  pluginsSidePanelUI!: EditorPluginsSidePanel;

  /*
   * Constructor & functions
   */
  constructor() {
    super();

    document.addEventListener('keydown', event => this.handleKeyPress(event));

    this.addEventListener('oscd-open', event => this.handleOpenDoc(event));
    this.addEventListener('oscd-edit-v2', (event: EditEventV2) => {
      const { edit, title, squash } = event.detail;
      this.xmlEditor.commit(edit, { title, squash });
    });

    // Catch all edits (from commits AND events) and trigger an update
    this.xmlEditor.subscribe(() => {
      this.docVersion += 1;
    });
  }

  handleOpenDoc({ detail: { docName, doc } }: OpenEvent) {
    this.docs = {
      ...this.docs,
      [docName]: doc,
    };
    if (this.isEditable(docName)) {
      this.docName = docName;
    }
    this.requestUpdate();
  }

  private handleKeyPress(e: KeyboardEvent): void {
    if (!e.ctrlKey) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(this.hotkeys, e.key)) {
      return;
    }
    this.hotkeys[e.key]!();
    e.preventDefault();
  }

  private hotkeys: Partial<Record<string, () => void>> = {
    m: this.openMenu,
    z: this.undo,
    y: this.redo,
    Z: this.redo,
  };

  isEditable(docName: string): boolean {
    return !!this.editable.find(ext =>
      docName.toLowerCase().endsWith(`.${ext}`),
    );
  }

  /** Undo the last `n` [[Edit]]s committed */
  undo(n = 1) {
    if (!this.canUndo || n < 1) {
      return;
    }
    this.xmlEditor.undo();
    if (n > 1) {
      this.undo(n - 1);
    }
    this.requestUpdate();
  }

  /** Redo the last `n` [[Edit]]s that have been undone */
  redo(n = 1) {
    if (!this.canRedo || n < 1) {
      return;
    }
    this.xmlEditor.redo();
    if (n > 1) {
      this.redo(n - 1);
    }
    this.requestUpdate();
  }

  onDocsChanged() {
    this.docVersion += 1;
  }

  async openMenu() {
    this.menuUI.open();
  }

  renderPlugin(tagName: string) {
    const tag = unsafeStatic(tagName);
    return staticHtml`<${tag} 
              .locale="${this.locale}"
              .docName="${this.docName}"
              .doc=${this.doc}
              .docs=${this.docs} 
              .editCount=${this.docVersion}
              .docVersion=${this.docVersion}
              .editor=${this.xmlEditor}>
            </${tag}>`;
  }

  onMenuPluginSelect(customEvent: CustomEvent) {
    const plugin = customEvent.detail.plugin as PluginEntry;
    if (plugin.tagName) {
      this.shadowRoot!.querySelector<
        HTMLElement & { run: () => Promise<void> }
      >(plugin.tagName)!.run?.();
    }
  }

  renderOffScreenPluginContainer() {
    return html`
      <section class="off-screen-plugin-container" aria-hidden="true">
        <div class="menu-plugins">
          ${this.plugins.menu
            .filter(plugin => !plugin.requireDoc || !!this.docName)
            .map(plugin => this.renderPlugin(plugin.tagName))}
        </div>
        <div class="background-plugins">
          ${this.plugins.background
            .filter(plugin => !plugin.requireDoc || !!this.docName)
            .map(plugin => this.renderPlugin(plugin.tagName))}
        </div>
      </section>
    `;
  }

  render() {
    const offScreenPlugins = html`
      <section class="off-screen-plugin-container" aria-hidden="true">
        <div class="menu-plugins">
          ${this.plugins.menu
            .filter(plugin => !plugin.requireDoc || !!this.docName)
            .map(plugin => this.renderPlugin(plugin.tagName))}
        </div>
        <div class="background-plugins">
          ${this.plugins.background
            .filter(plugin => !plugin.requireDoc || !!this.docName)
            .map(plugin => this.renderPlugin(plugin.tagName))}
        </div>
      </section>
    `;

    if (this.editableDocs.length === 0) {
      return html` <landing-page
          .headingIcon=${this.landingPageHeadingIcon}
          .heading=${this.landingPageHeading}
          .subHeading=${this.landingPageSubHeading}
          .menuPlugins=${this.plugins.menu.filter(
            plugin => !plugin.requireDoc || !!this.docName,
          )}
          .locale=${this.locale}
          @menu-plugin-select=${(event: CustomEvent) =>
            this.onMenuPluginSelect(event)}
        ></landing-page>
        ${offScreenPlugins}`;
    }

    return html` <app-bar
        .docName=${this.docName}
        .doc=${this.doc}
        .docs=${this.docs}
        .appIcon=${this.appIcon}
        .appTitle=${this.appTitle}
        .xmlEditor=${this.xmlEditor}
        .locale=${this.locale}
        .menuPlugins=${this.plugins.menu}
        .editableDocs=${this.editableDocs}
        @undo=${() => {
          this.undo();
        }}
        @redo=${() => {
          this.redo();
        }}
        @closeFile=${(customEvent: CustomEvent) => {
          const docName = customEvent.detail.docName as string;
          delete this.docs[docName];
          if (this.docName === docName) {
            this.docName = this.editableDocs[0] || '';
          }
        }}
        @renameFile=${(customEvent: CustomEvent) => {
          const { oldName, newName } = customEvent.detail;
          const doc = this.docs[oldName];
          delete this.docs[oldName];
          this.docs = {
            ...this.docs,
            [newName]: doc,
          };
          this.docName = newName;
        }}
      >
        <menu-plugins-dropdown-menu
          slot="alignStart"
          appTitle=${this.appTitle}
          appIcon=${this.appIcon}
          .editableDocs=${this.editableDocs}
          .menuPlugins=${this.plugins.menu}
          .locale=${this.locale}
          @menu-plugin-select=${(event: CustomEvent) =>
            this.onMenuPluginSelect(event)}
        ></menu-plugins-dropdown-menu>
      </app-bar>

      <main>
        <section class="editors-side-panel-section">
          <editor-plugins-side-panel
            .editors=${this.plugins.editor}
            .editorIndex=${this.editorIndex}
            .locale=${this.locale}
            @editor-select=${(e: CustomEvent) => {
              this.editorIndex = e.detail.index;
            }}
          ></editor-plugins-side-panel>
        </section>

        <section class="editor-container">
          ${this.editor ? this.renderPlugin(this.editor) : nothing}
        </section>

        ${offScreenPlugins}
      </main>`;
  }

  static styles = css`
    ${theming}

    * {
      --app-bar-height: 54px;
    }

    main {
      height: calc(100% - var(--app-bar-height));
      display: flex;
    }

    section.editor-container {
      flex-grow: 1;
      position: relative;
      background-color: var(--slate-100);
      padding: 8px;
      overflow: auto;
    }

    .off-screen-plugin-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    oscd-navigation-drawer-header {
      --md-list-item-supporting-text-color: var(--md-sys-color-on-surface);
    }

    oscd-app-bar * {
      --md-filled-icon-button-disabled-container-opacity: 0;
      --md-filled-icon-button-disabled-icon-color: var(
        --md-sys-color-on-primary
      );
    }

    .edit-dialog-remove-button {
      --md-text-button-icon-color: var(--oscd-error);
      --md-text-button-label-text-color: var(--oscd-error);
      --md-text-button-focus-label-text-color: var(--oscd-error);
      --md-text-button-focus-icon-color: var(--oscd-error);
      --md-text-button-hover-label-text-color: var(--oscd-error);
      --md-text-button-hover-state-layer-color: var(--oscd-error);
      --md-text-button-hover-icon-color: var(--oscd-error);
      --md-text-button-pressed-label-text-color: var(--oscd-error);
      --md-text-button-pressed-state-layer-color: var(--oscd-error);
      --md-text-button-pressed-icon-color: var(--oscd-error);
    }
    #title {
      position: relative;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'oscd-shell': OscdShell;
  }
}
