import { OscdShell } from '../../oscd-shell.js';

export const nonSclDocString = `<testdoc></testdoc>`;

export const sclDocString = `<?xml version="1.0" encoding="UTF-8"?>
  <SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL" xmlns:ens1="http://example.org/somePreexistingExtensionNamespace">
  <Substation ens1:foo="a" name="A1" desc="test substation"></Substation>
</SCL>`;

export const createNonSclDocument = () => {
  const parser = new DOMParser();
  return parser.parseFromString(nonSclDocString, 'application/xml');
};

export const createSclDocument = () => {
  const parser = new DOMParser();
  return parser.parseFromString(sclDocString, 'application/xml');
};

export const openDocOnShell = async (
  shell: OscdShell,
  docName: string,
  doc: XMLDocument,
): Promise<void> => {
  shell.docs = { ...shell.docs, [docName]: doc };
  shell.docName = docName;
  await shell.updateComplete;
};

export function createTestDocs(amount: number) {
  return Array(amount)
    .fill(0)
    .reduce(
      (acc, _, index) => {
        const docName = `test${index}.cid`;
        acc[docName] = createSclDocument();
        return acc;
      },
      {} as Record<string, XMLDocument>,
    );
}
