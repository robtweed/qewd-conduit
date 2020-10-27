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

  const componentName = 'conduit-pagination-link';

  customElements.define(componentName, class conduit_pagination_link extends HTMLElement {
    constructor() {
      super();

      const html = `
<li class="page-item">
  <a class="page-link" href="#"></a>
</li>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.ownerPage) {
        this.ownerPage = state.ownerPage;
      }
      if (state.classification) {
        this.classification = state.classification;
      }
      if (state.limit) {
        this.limit = state.limit;
      }
      if (state.no) {
        this.link.textContent = state.no;
        if (state.no === 1) {
          this.active();
        }
        // add click handler to pagination link

        const fn = () => {
          this.active();
          let offset = ((state.no - 1) * this.limit);
          this.ownerPage.getAndDisplayArticles(offset, this.classification);
        }
        this.addHandler(fn, this.link);
      }
    }

    active() {
      if (!this.rootElement.classList.contains('active')) {
        this.rootElement.classList.add('active');
      }
      let activeLink = this.ownerPage.activeLink;
      if (activeLink) {
        activeLink.rootElement.classList.remove('active');
      }
      this.ownerPage.activeLink = this;
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('li')[0];
      this.link = this.rootElement.querySelector('a');
    }

    disconnectedCallback() {
      //console.log('*** paginator-link component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
