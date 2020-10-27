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

  const componentName = 'conduit-new-article-tag';

  customElements.define(componentName, class conduit_new_article_tag extends HTMLElement {
    constructor() {
      super();

      const html = `
<span class="tag-default tag-pill">
  <i class="ion-close-round"></i>
  <span></span>
</span>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.new_article) {
        this.new_article = state.new_article;
      }
      if (state.text) {
        this.textEl.textContent = state.text;
        this.text = state.text;
        
      }
    }

    onLoaded() {

      // add delete tag handler to x within tag

      const fn = () => {
        // remove tag from parent's array of tags

        let index = this.new_article.tagList.indexOf(this.text);
        if (index > -1) {
          this.new_article.tagList.splice(index, 1);
        }

        // remove this tag component from the display

        this.remove();
      };
      this.addHandler(fn, this.x);

    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('span')[0];
      this.textEl = this.rootElement.querySelector('span');
      this.x = this.rootElement.querySelector('i');
    }

    disconnectedCallback() {
      //console.log('*** new article tag component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
