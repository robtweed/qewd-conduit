/*

 ----------------------------------------------------------------------------
 | conduit-ui: RealWorld Conduit UI WebComponents Library                    |
 |                                                                           |
 | Copyright (c) 2020 M/Gateway Developments Ltd,                            |
 | Redhill, Surrey UK.                                                       |
 | All rights reserved.                                                      |
 |                                                                           |
 | http://www.mgateway.com                                                   |
 | Email: rtweed@mgateway.com                                                |
 |                                                                           |
 |                                                                           |
 | Licensed under the Apache License, Version 2.0 (the "License");           |
 | you may not use this file except in compliance with the License.          |
 | You may obtain a copy of the License at                                   |
 |                                                                           |
 |     http://www.apache.org/licenses/LICENSE-2.0                            |
 |                                                                           |
 | Unless required by applicable law or agreed to in writing, software       |
 | distributed under the License is distributed on an "AS IS" BASIS,         |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  |
 | See the License for the specific language governing permissions and       |
 |  limitations under the License.                                           |
 ----------------------------------------------------------------------------

 23 October 2020

*/

export function load() {

  let counter = -1;
  const componentName = 'conduit-content-page';
  let id_prefix = componentName + '-';

  customElements.define(componentName, class content_page extends HTMLElement {
    constructor() {
      super();

      counter++;
      let id = id_prefix + counter;

      const html = `
<div class="collapse" id="${id}"></div>
      `;
      this.html = `${html}`;
    }

    onLoaded() {
      //console.log(this.name + ' page loaded!');
      const root = document.getElementsByTagName('conduit-root')[0];
      root.setPageActive(this.name);
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.show && !this.rootElement.classList.contains('show')) {
        let children = [...this.parentNode.childNodes];
        children.forEach((child) => {
          if (child.tagName === 'CONDUIT-CONTENT-PAGE') {
            child.rootElement.classList.remove('show');
          }
        });
        this.rootElement.classList.add('show');
      }
    }

    onSelected() {
      if (this.childComponent && this.childComponent.onSelected) {
        this.childComponent.onSelected();
      }
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.childrenTarget = this.rootElement;
      this.name = id_prefix + counter;
    }

    disconnectedCallback() {
      //console.log('*** page component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });

}
