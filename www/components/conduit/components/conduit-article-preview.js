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

  const componentName = 'conduit-article-preview';
  let counter = -1;
  let id_prefix = componentName + '-';

  customElements.define(componentName, class conduit_div extends HTMLElement {
    constructor() {
      super();

      counter++;
      let id = id_prefix + counter;

      const html = `
<div id="${id}" class="article-preview">
  <div class="article-meta">
    <a href="#">
      <img src="" />
    </a>
    <div class="info">
      <a href="#" class="author"></a>
      <span class="date"></span>
    </div>
    <button class="btn btn-outline-primary btn-sm pull-xs-right">
      <i class="ion-heart"></i>
      <span></span>
    </button>
  </div>
  <a href="#" class="preview-link">
    <h1></h1>
    <p></p>
    <span>Read more...</span>
    <ul class="tag-list"></ul>
  </a>
</div>
      `;

      this.html = `${html}`;
    }

    setState(state) {

      if (state.name) {
        this.name = state.name;
      }
      if (state.root) {
        this.root = state.root;
      }
      if (state.home_page) {
        this.home_page = state.home_page;
      }
      if (typeof state.favorited !== 'undefined') {
        this.favorited = state.favorited;
      }
      if (state.slug) {
        let slug = state.slug;
        this.name = slug;
        this.slug = slug;

        // Click on the article content - switch to the article detail page

        const fn1 = () => {
          this.context.slug = slug;
          this.root.switchToPage('article');
        };
        this.addHandler(fn1, this.articleLink);


        // Click on the favourite icon - only active if logged in

        const fn2 = async () => {
          if (!this.root.isLoggedIn()) {
            //console.log('not logged in');
            return;
          }

          if (!this.favorited) {
            let results = await this.root.apis.favourite(slug);
            if (!results.error) {
              this.setState({
                favorited: results.article.favorited,
                favoritesCount: results.article.favoritesCount
              });
            }
          }
          else {
            let results = await this.root.apis.unfavourite(slug);
            if (!results.error) {
              this.setState({
                favorited: results.article.favorited,
                favoritesCount: results.article.favoritesCount
              });
            }
          }
        };
        this.addHandler(fn2, this.favouritedBtn);
      }

      if (typeof state.image !== 'undefined') {
        let image = state.image;
        if (image === '') image = this.context.defaultImage;
        this.imageEl.setAttribute('src', image);
      }
      if (state.author) {
        this.authorEl.textContent = state.author;

        // author link handler

        const fn = () => {
          this.context.author = state.author;
          this.context.root.switchToPage('profile');
        };
        this.addHandler(fn, this.authorImgLink);
        this.addHandler(fn, this.authorEl);
      }
      if (state.date) {
        this.dateEl.textContent = this.context.formatDate(state.date);
      }
      if (typeof state.favoritesCount !== 'undefined') {
        this.favouritesEl.textContent = state.favoritesCount;
      }
      if (state.title) {
        this.titleEl.textContent = state.title;
      }
      if (state.text) {
        this.textEl.textContent = state.text;
      }
      if (state.tags) {
        this.addTags(state.tags);
      }
    }

    addTags(tagArr) {
      const noOfTags = tagArr.length;
      let parentTag = this.tagListEl;
      let context = this.context;
      let loadAssembly = this.loadAssembly;

      const addTag = async (no) => {
        if (no > (noOfTags -1)) {
          return;
        }
        let tagValue = tagArr[no];

        const assembly = {
          componentName: 'conduit-article-tag',
          state: {
            text: tagValue
          }
        }

        await loadAssembly(assembly, parentTag, context);
        addTag(no + 1);
      }

      // kick it off
      addTag(0);
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      let meta = this.rootElement.querySelector('.article-meta');
      this.authorImgLink = meta.getElementsByTagName('a')[0];
      this.imageEl = meta.querySelector('img');
      this.authorEl = meta.querySelector('.author');
      this.dateEl = meta.querySelector('.date');
      this.favouritedBtn = meta.querySelector('button');
      this.favouritesEl = this.favouritedBtn.querySelector('span');
      this.articleLink = this.rootElement.querySelector('.preview-link');
      this.titleEl = this.articleLink.querySelector('h1');
      this.textEl = this.articleLink.querySelector('p');
      this.id = this.rootElement.id;
      this.tagListEl = this.rootElement.querySelector('.tag-list');
    }

    disconnectedCallback() {
      //console.log('*** article-preview component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
