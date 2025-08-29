/* eslint-disable no-alert */
export class DemoPluginSrc extends HTMLElement {
  /* eslint-disable-next-line class-methods-use-this */
  run() {
    console.log(`${this.tagName}.run()`);
  }
}

export default DemoPluginSrc;
