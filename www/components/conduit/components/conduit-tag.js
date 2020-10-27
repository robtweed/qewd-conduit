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

  const componentName = 'conduit-tag';

  customElements.define(componentName, class conduit_tag extends HTMLElement {
    constructor() {
      super();

      const html = `
<a class="tag-pill tag-default" href="#"></a>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.home_page) {
        this.home_page = state.home_page;
      }
      if (state.text) {
        this.rootElement.textContent = state.text;
        this.tag = state.text;

        const fn = () => {
          //fetch first batch of articles for selected tag
          // clear down any articles under the preview header tag first
          this.home_page.showByTagArticles(state.text, 0, true);
        };
        this.addHandler(fn, this.rootElement);
      }
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('a')[0];
    }

    disconnectedCallback() {
      //console.log('*** tag component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
