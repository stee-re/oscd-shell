/* eslint-disable import-x/no-extraneous-dependencies */
import { waitUntil } from '@open-wc/testing';
import { OscdShell, PluginEntry } from '../../oscd-shell.js';

export const isPluginInstanciated = (
  pluginTagName: string,
  shell: OscdShell,
): boolean =>
  !!shell.registry?.get(pluginTagName) &&
  !!shell.shadowRoot?.querySelector(pluginTagName);

export const waitForPluginInstanciation = async (
  plugin: PluginEntry,
  shell: OscdShell,
): Promise<void> =>
  waitUntil(
    () => isPluginInstanciated(plugin.tagName, shell),
    `Plugin: "${plugin.name}" <${plugin.tagName}> failed to load. 
      CustomElements Registered: ${shell.registry?.get(plugin.tagName) ? 'Yes' : 'No (at least not in the OscdShell registry)'}, 
      Found in DOM: ${shell.shadowRoot?.querySelector(plugin.tagName) ? 'Yes' : 'No'}, 
      requiresDoc?: ${plugin.requireDoc}
      loadedDocName?: ${shell.docName}`,
  );

export const waitForPluginsToInstantiate = async (
  plugins: PluginEntry[],
  shell: OscdShell,
) =>
  await Promise.all(
    plugins.map(plugin => waitForPluginInstanciation(plugin, shell)),
  );

/**
 * Convienience function to wait for all applicable plugins to instantiate.
 * If a document is loaded, all plugins are waited for. If no document is loaded,
 * only plugins that do not require a document are waited for.
 * If no document is loaded, only menu and background plugins are considered, as
 * the landing page does not have an editor.
 *
 * @param shell - The instance of the OscdShell to check for plugin instantiation.
 * @returns Empty Promise that resolves when all applicable plugins have been instantiated.
 */
export const waitForAllPluginsToInstantiate = async (shell: OscdShell) => {
  const docLoaded = !!shell.docName;

  const editorPlugin = shell.plugins.editor.find(
    editor => editor.tagName === shell.editor,
  );

  const menuPlugins = (shell.plugins.menu ?? []).filter(
    plugin => !plugin.requireDoc || docLoaded,
  );
  const backgroundPlugins = (shell.plugins.background ?? []).filter(
    plugin => !plugin.requireDoc || docLoaded,
  );

  const allPlugins: PluginEntry[] = [
    ...menuPlugins,
    ...backgroundPlugins,
    ...(docLoaded && editorPlugin ? [editorPlugin] : []),
  ];

  return allPlugins.length > 0
    ? waitForPluginsToInstantiate(allPlugins, shell)
    : Promise.resolve();
};
