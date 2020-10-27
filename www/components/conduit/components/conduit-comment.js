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

  const componentName = 'conduit-comment';

  customElements.define(componentName, class conduit_comment extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="card">
  <div class="card-block">
    <p class="card-text"></p>
  </div>
  <div class="card-footer">
    <a href="#" class="comment-author">
      <img src="" class="comment-author-img" alt=""/>
    </a>
    &nbsp;
    <a href="#" class="comment-author"></a>
    <span class="date-posted"></span>
    <span class="mod-options">
      <i class="ion-trash-a"></i>
    </span>
  </div>
</div>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      this.comment = state;
      if (state.name) {
        this.name = state.name;
      }
      if (state.root) {
        this.root = state.root;
      }
      if (state.body) {
        this.textEl.textContent = state.body;
      }
      if (state.author && state.author.username) {
        let author = state.author.username;
        this.authorImg.setAttribute('alt', author);
        this.authorLinks[1].textContent = author;

        // hander for author image and name at bottom of each comment card

        const fn = () => {
          this.context.author = author;
          this.root.switchToPage('profile');
        };
        this.addHandler(fn, this.authorLinks[0]);
        this.addHandler(fn, this.authorLinks[1]);

        // delete comment icon handler (only if logged in user was the comment author)

        if (this.root.isLoggedIn() && this.context.user.username === author) {
          this.show(this.deleteIcon);

          const fn2 = async () => {
            let results = await this.root.apis.deleteComment(state.id);
            if (!results.error) {
              this.remove();
            }
          };
          this.addHandler(fn2, this.deleteIcon);
        }
        else {
          this.hide(this.deleteIcon);
        }

      }
      if (state.author && state.author.image) {
        this.authorImg.setAttribute('src', state.author.image);
      }
      if (state.updatedAt) {
        this.dateEl.textContent = this.context.formatDate(state.updatedAt);
      }
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }  

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.textEl = this.rootElement.querySelector('.card-text');
      let footer = this.rootElement.querySelector('.card-footer');
      this.authorLinks = footer.getElementsByTagName('a');
      this.authorImg = footer.querySelector('img');
      this.dateEl = footer.querySelector('.date-posted');
      this.deleteIcon = footer.querySelector('.mod-options');
    }

    disconnectedCallback() {
      //console.log('*** comment component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
