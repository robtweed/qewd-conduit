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

  const componentName = 'conduit-home-page';

  customElements.define(componentName, class conduit_home_page extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="home-page">
  <div class="banner">
    <div class="container">
      <h1 class="logo-font">conduit</h1>
      <p>A place to share your knowledge.</p>
    </div>
  </div>
  <div class="container page">
    <div class="row">
      <div class="col-md-9">
        <div class="feed-toggle">
          <ul class="nav nav-pills outline-active">
            <li class="nav-item">
              <a class="nav-link" href="#">Your Feed</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" href="#">Global Feed</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">#Tag</a>
            </li>
          </ul>
        </div>

        <div class="articles-content">
          <div class="articles-your">
            <div class="article-preview-list"></div>
            <nav>
              <ul class="pagination"></ul>
            </nav>
          </div>
          <div class="articles-global">
            <div class="article-preview-list"></div>
            <nav>
              <ul class="pagination"></ul>
            </nav>
          </div>
          <div class="articles-byTag">
            <div class="article-preview-list"></div>
            <nav>
              <ul class="pagination"></ul>
            </nav>
          </div>
        </div>

      </div>
      <div class="col-md-3">
        <div class="sidebar">
          <p>Popular Tags</p>
          <div class="tag-list"></div>
        </div>
      </div>
    </div>
  </div>
</div>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.banner) {
        if (state.banner.logo) {
          this.bannerLogoDiv.textContent = state.banner.logo;
        }
        if (state.banner.text) {
          this.bannerTextDiv.textContent = state.banner.text;
        }
      }
      if (state.name) {
        this.name = state.name;
      }
      if (state.root) {
        this.root = state.root;
        state.root.home_page = this;
      }
    }

    sidebarOff() {
      this.sidebarTitleEl.textContent = '';
      this.tagListDiv.innerHTML = '';
    }

    async fetchArticles(offset, limit, param) {
      let results = await this.root.apis.getArticlesList(offset, limit, param);
      return this.root.normaliseArticles(results);
    }

    async fetchFeed(offset, limit) {
      let results = await this.root.apis.getArticlesFeed(offset, limit);
      return this.root.normaliseArticles(results);
    }

    async fetchGlobalArticles(offset) {
      offset = offset || 0;
      let limit = 10;
      let articlesObj = await this.fetchArticles(offset);
      this.root.addArticles(articlesObj.articlesArr, this.globalArticlesPreview);
      if (!this.globalPaginationDisplayed) {
        await this.root.addPagination.call(this, articlesObj.articlesCount, this.globalArticlesPagination, 'global', limit);
        this.globalPaginationDisplayed = true;
      }
    }

    async fetchYourArticles(offset) {
      offset = offset || 0;
      let limit = 10;
      let articlesObj = await this.fetchFeed(offset, limit);
      this.root.addArticles(articlesObj.articlesArr, this.yourArticlesPreview);
      if (!this.yourPaginationDisplayed) {
        await this.root.addPagination.call(this, articlesObj.articlesCount, this.yourArticlesPagination, 'your', limit);
        this.yourPaginationDisplayed = true;
      }
    }

    async fetchByTagArticles(tag, offset) {
      offset = offset || 0;
      let limit = 10;
      let params = {tag: tag};
      let articlesObj = await this.fetchArticles(offset, limit, params);
      this.root.addArticles(articlesObj.articlesArr, this.byTagArticlesPreview);
      if (!this.byTagPaginationDisplayed) {
        await this.root.addPagination.call(this, articlesObj.articlesCount, this.byTagArticlesPagination, 'byTag', limit);
        this.byTagPaginationDisplayed = true;
      }
    }

    getAndDisplayArticles(offset, classification) {
      // called by pagination-link
      this.setFeedLinkActive(classification);
      if (classification === 'global') {
        this.root.removeArticles(this.globalArticlesPreview);
        this.fetchGlobalArticles(offset);
      }
      if (classification === 'your') {
        this.root.removeArticles(this.yourArticlesPreview);
        this.fetchYourArticles(offset);
      }
      if (classification === 'byTag') {
        this.root.removeArticles(this.byTagArticlesPreview);
        this.fetchByTagArticles(this.feedTag, offset);
      }
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    setFeedLinkActive(classification) {
      if (classification === 'global') {
        this.globalFeedLink.classList.add('active');
        this.yourFeedLink.classList.remove('active');
        this.byTagFeedLink.classList.remove('active');
        this.activeFeed = 'global';
        return;
      }
      if (classification === 'your') {
        this.globalFeedLink.classList.remove('active');
        this.yourFeedLink.classList.add('active');
        this.byTagFeedLink.classList.remove('active');
        this.show(this.yourFeedLink);
        this.activeFeed = 'your';
        return;
      }
      if (classification === 'byTag') {
        this.globalFeedLink.classList.remove('active');
        this.yourFeedLink.classList.remove('active');
        this.byTagFeedLink.classList.add('active');
        this.show(this.byTagFeedLink);
        this.activeFeed = 'byTag';
        return;
      }
    }

    showGlobalArticles() {
      this.show(this.globalArticles);
      this.hide(this.yourArticles);
      this.hide(this.byTagArticles);
      this.setFeedLinkActive('global');
      if (!this.globalArticlesPreview.hasChildNodes()) {
        this.fetchGlobalArticles();
      }
    }

    showYourArticles() {
      this.hide(this.globalArticles);
      this.show(this.yourArticles);
      this.hide(this.byTagArticles);
      this.setFeedLinkActive('your');
      if (!this.yourArticlesPreview.hasChildNodes()) {
        this.fetchYourArticles();
      }
    }

    showByTagArticles(tag, offset, deleteFirst) {
      if (deleteFirst) {
        this.root.removeArticles(this.byTagArticlesPreview);
        this.root.removePagination(this.byTagArticlesPagination);
        this.byTagPaginationDisplayed = false;
      }
      offset = offset || 0;
      this.hide(this.globalArticles);
      this.hide(this.yourArticles);
      this.show(this.byTagArticles);
      this.byTagFeedLink.textContent = '#' + tag;
      this.feedTag = tag;
      this.setFeedLinkActive('byTag');
      if (!this.byTagArticlesPreview.hasChildNodes()) {
        this.fetchByTagArticles(tag, offset);
      }
    }

    async fetchTags() {
      let tags = await this.root.apis.getTags();
      return tags;
    }

    async getAndDisplayTags() {
      if (!this.tagsDisplayed) {
        let tagsArr = await this.fetchTags();
        this.addTags(tagsArr);
        this.tagsDisplayed = true;
      }
    }

    addTags(tagArr) {
      const noOfTags = tagArr.length;

      const addNextTag = async (no) => {
        if (no > noOfTags) return;
        let assembly = {
          componentName: 'conduit-tag',
          state: {
            text: tagArr[no - 1],
            home_page: this
          }
        };
        await this.loadAssembly(assembly, this.tagListDiv, this.context);
        addNextTag(no + 1);
      }
      addNextTag(1);
    }

    removeTags() {
      let tags = [...this.tagListDiv.getElementsByTagName('conduit-tag')];
      tags.forEach((tag_component) => {
        tag_component.remove();
      });
      this.tagsDisplayed = false;
    }

    onSelected() {
      //console.log('home page selected');

      if (!this.root.homeLink.classList.contains('active')) {
        this.root.homeLink.classList.add('active');
      }
      if (this.root.isLoggedIn()) {

        // if an article has been added or deleted...

        if (this.context.refresh_home_page) {
          this.root.removeArticles(this.globalArticlesPreview);
          this.root.removePagination(this.globalArticlesPagination);
          this.globalPaginationDisplayed = false;
          this.root.removeArticles(this.yourArticlesPreview);
          this.root.removePagination(this.yourArticlesPagination);
          this.yourPaginationDisplayed = false;
          this.root.removeArticles(this.byTagArticlesPreview);
          this.root.removePagination(this.byTagArticlesPagination);
          this.byTagPaginationDisplayed = false;
          this.removeTags();
          this.context.refresh_home_page = false;
        }

        this.show(this.yourFeedLink);
        this.root.showLoggedInOptions();
        this.hide(this.bannerDiv);
        this.showYourArticles();
      }
      else {
        this.hide(this.yourFeedLink);
        this.root.showLoggedOutOptions();
        this.show(this.bannerDiv);
        this.showGlobalArticles();
      }

      this.getAndDisplayTags();

    }

    onLoaded() {

      this.activeFeed = 'global';
      this.show(this.globalFeedLink);
      this.hide(this.byTagFeedLink);

      // Global Feed header link

      const fn = () => {
        if (this.activeFeed !== 'global') {
          this.showGlobalArticles();
        }
        else {
          //console.log('ignored!');
        }
      };
      this.addHandler(fn, this.globalFeedLink);

      // #tag header link

      const fn2 = () => {
        if (this.activeFeed !== 'byTag') {
          this.showByTagArticles(this.feedTag);
        }
        else {
          //console.log('ignored!');
        }
      };
      this.addHandler(fn2, this.byTagFeedLink);

      // Your Feed header link

      const fn3 = () => {
        if (this.activeFeed !== 'your') {
          this.showYourArticles();
        }
        else {
          //console.log('ignored!');
        }
      };
      this.addHandler(fn3, this.yourFeedLink);

    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];

      this.yourArticles = this.rootElement.querySelector('.articles-your');
      this.yourArticlesPreview = this.yourArticles.querySelector('.article-preview-list');
      this.yourArticlesPagination = this.yourArticles.querySelector('.pagination');
      this.globalArticles = this.rootElement.querySelector('.articles-global');
      this.globalArticlesPreview = this.globalArticles.querySelector('.article-preview-list');
      this.globalArticlesPagination = this.globalArticles.querySelector('.pagination');
      this.byTagArticles = this.rootElement.querySelector('.articles-byTag');
      this.byTagArticlesPreview = this.byTagArticles.querySelector('.article-preview-list');
      this.byTagArticlesPagination = this.byTagArticles.querySelector('.pagination');

      this.bannerDiv = this.rootElement.querySelector('.banner');
      this.bannerLogoDiv = this.rootElement.querySelector('.logo-font');
      this.bannerTextDiv = this.rootElement.querySelector('p');
      let sidebarDiv = this.rootElement.querySelector('.sidebar');
      this.sidebarTitleEl = sidebarDiv.querySelector('p');
      this.tagListDiv = this.rootElement.querySelector('.tag-list');
      this.paginationEl = this.rootElement.querySelector('.pagination');

      let feedToggle = this.rootElement.querySelector('.feed-toggle');
      this.yourFeedLink = feedToggle.getElementsByTagName('a')[0];
      this.globalFeedLink = feedToggle.getElementsByTagName('a')[1];
      this.byTagFeedLink = feedToggle.getElementsByTagName('a')[2];
    }

    disconnectedCallback() {
      //console.log('*** home-page component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
