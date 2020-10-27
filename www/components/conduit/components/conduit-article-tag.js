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

  const componentName = 'conduit-article-tag';

  customElements.define(componentName, class conduit_article_tag extends HTMLElement {
    constructor() {
      super();

      const html = `
<li class="tag-default tag-pill tag-outline">
  <span></span>
</li>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.text) {
        this.spanEl.textContent = state.text;
      }
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('li')[0];
      this.spanEl = this.rootElement.querySelector('span');
    }

    disconnectedCallback() {
      //console.log('*** tag component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
