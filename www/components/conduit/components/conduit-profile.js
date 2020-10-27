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

  const componentName = 'conduit-profile';

  customElements.define(componentName, class conduit_profile extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="profile-page">

  <div class="user-info">
    <div class="container">
      <div class="row">

        <div class="col-xs-12 col-md-10 offset-md-1">
          <img src="" class="user-img" />
          <h4></h4>
          <p></p>
          <button class="btn btn-sm btn-outline-secondary action-btn">
            <i class="ion-plus-round"></i>
            &nbsp;
            <span class="follow-toggle">Follow</span>
            <span class="follow-user"></span> 
          </button>
        </div>

      </div>
    </div>
  </div>
  <div class="container">
    <div class="row">
      <div class="col-xs-12 col-md-10 offset-md-1">
        <div class="articles-toggle">
          <ul class="nav nav-pills outline-active">
            <li class="nav-item">
              <a class="nav-link active" href="#">My Articles</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Favorited Articles</a>
            </li>
          </ul>
        </div>

        <div class="articles-content">
          <div class="articles-my">
            <div class="article-preview-list"></div>
            <nav>
              <ul class="pagination"></ul>
            </nav>
          </div>
          <div class="articles-favourited">
            <div class="article-preview-list"></div>
            <nav>
              <ul class="pagination"></ul>
            </nav>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (typeof state.image !== 'undefined') {
        let image = state.image;
        if (state.image === '') {
          image = this.defaultImgSrc;
        }
        this.userImg.setAttribute('src', image);
      }
      if (state.username) {
        this.authorEl.textContent = state.username;
        this.followEl.textContent = state.username;

      }
      if (typeof state.bio !== 'undefined') {
        this.bioEl.textContent = state.bio;
      }
      if (state.following === false) {
        this.followToggle.textContent = 'Follow';
      }
      if (state.following) {
        this.followToggle.textContent = 'Unfollow';
      }
      if (state.root) {
        this.root = state.root;
        state.root.profile_page = this;
      }
    }

    showMyArticles() {
      this.show(this.myArticles);
      this.hide(this.favouritedArticles);
      if (!this.myArticlesLink.classList.contains('active')) {
        this.myArticlesLink.classList.add('active');
      }
      if (this.favouritedArticlesLink.classList.contains('active')) {
        this.favouritedArticlesLink.classList.remove('active');
      }
      if (!this.myArticlesPreview.hasChildNodes()) {
        this.fetchMyArticles();
      }
    }

    showFavouritedArticles() {
      this.show(this.favouritedArticles);
      this.hide(this.myArticles);
      if (!this.favouritedArticlesLink.classList.contains('active')) {
        this.favouritedArticlesLink.classList.add('active');
      }
      if (this.myArticlesLink.classList.contains('active')) {
        this.myArticlesLink.classList.remove('active');
      }
      if (!this.favouritedArticlesPreview.hasChildNodes()) {
        this.fetchFavouritedArticles();
      }
    }

    async fetchArticles(offset, limit, param) {
      let results = await this.root.apis.getArticlesList(offset, limit, param);
      return this.root.normaliseArticles(results);
    }

    async fetchMyArticles(offset) {
      offset = offset || 0;
      let limit = 5;
      let param = {
        author: this.profile.username
      };
      let articlesObj = await this.fetchArticles(offset, limit, param);
      this.root.addArticles(articlesObj.articlesArr, this.myArticlesPreview);
      if (!this.myPaginationDisplayed) {
        //console.log('*** add my pagination ***');
        await this.root.addPagination.call(this, articlesObj.articlesCount, this.myArticlesPagination, 'my-articles', limit);
        this.myPaginationDisplayed = true;
      }
    }

    async fetchFavouritedArticles(offset) {
      offset = offset || 0;
      let limit = 5;
      let param = {
        favourited: this.profile.username
      };
      let articlesObj = await this.fetchArticles(offset, limit, param);
      this.root.addArticles(articlesObj.articlesArr, this.favouritedArticlesPreview);
      if (!this.favouritedPaginationDisplayed) {
        //console.log('*** add favorited pagination ***');
        await this.root.addPagination.call(this, articlesObj.articlesCount, this.favouritedArticlesPagination, 'favourited-articles', limit);
        this.favouritedPaginationDisplayed = true;
      }
    }

    async fetchProfile() {
      let profile = await this.root.apis.getProfile();
      return profile;
    }

    async getAndDisplayProfile() {
      this.profile = await this.fetchProfile();
      this.setState(this.profile);
      this.removeMyArticles();
      this.removeFavouritedArticles();
      this.showMyArticles();

      if (this.loggedIn && this.context.user.username === this.profile.username) {
        // hide follow button - don't want to follow yourself
        this.hide(this.followBtn);
      }
      else {
        this.show(this.followBtn);
      }
    }

    getAndDisplayArticles(offset, classification) {
      // triggered by pagination link

      if (classification === 'my-articles') {
        this.root.removeArticles(this.myArticlesPreview);
        this.fetchMyArticles(offset)
      }
      else if (classification === 'favourited-articles') {
        this.root.removeArticles(this.favouritedArticlesPreview);
        this.fetchFavouritedArticles(offset)
      }
    }

    removeMyArticles() {
      this.root.removeArticles(this.myArticlesPreview);
      this.root.removePagination.call(this, this.myArticlesPagination);
      this.myPaginationDisplayed = false;
    }

    removeFavouritedArticles() {
      this.root.removeArticles(this.favouritedArticlesPreview);
      this.root.removePagination.call(this, this.favouritedArticlesPagination);
      this.favouritedPaginationDisplayed = false;
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    onSelected() {

      this.loggedIn = this.root.isLoggedIn();

      if (this.context.return_to === 'profile') {
        // returned after logging in, so don't bother updating the profile data
        delete this.context.return_to;
      }
      else {
        this.getAndDisplayProfile();
      }

    }

    onLoaded() {

      this.defaultImgSrc = this.context.defaultImage || '';

      // Follow button

      const fn = async () => {
        //console.log('request to follow ' + this.profile.username);
        if (!this.loggedIn) {
          this.context.return_to = 'profile';
          this.root.switchToPage('login');
        }
        else {
          if (this.profile.following === false) {
            let results = await this.root.apis.follow(this.profile.username);
            if (!results.error) {
              this.profile = results.profile;
              this.setState(results.profile);
            }
          }
          else {
            let results = await this.root.apis.unfollow(this.profile.username);
            if (!results.error) {
              this.profile = results.profile;
              this.setState(results.profile);
            }
          }
        }
      };
      this.addHandler(fn, this.followBtn);

      // My Articles header link

      const fn2 = () => {
        this.showMyArticles();
      };
      this.addHandler(fn2, this.myArticlesLink);

      // Favorited Articles link

      const fn3 = () => {
        this.showFavouritedArticles();
      };
      this.addHandler(fn3, this.favouritedArticlesLink);
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.childrenTarget = this.rootElement;
      let userInfo = this.rootElement.querySelector('.user-info');
      this.userImg = userInfo.querySelector('.user-img');
      this.authorEl = userInfo.querySelector('h4');
      this.bioEl = userInfo.querySelector('p');
      this.followEl = userInfo.querySelector('.follow-user');
      this.followBtn = userInfo.querySelector('button');
      this.followToggle = this.followBtn.querySelector('.follow-toggle');
      let articlesToggle = this.rootElement.querySelector('.articles-toggle');
      let aTags = articlesToggle.getElementsByTagName('a');
      this.myArticlesLink = aTags[0];
      this.favouritedArticlesLink = aTags[1];
      this.myArticles = this.rootElement.querySelector('.articles-my');
      this.myArticlesPreview = this.myArticles.querySelector('.article-preview-list');
      this.myArticlesPagination = this.myArticles.querySelector('.pagination');
      this.favouritedArticles = this.rootElement.querySelector('.articles-favourited');
      this.favouritedArticlesPreview = this.favouritedArticles.querySelector('.article-preview-list');
      this.favouritedArticlesPagination = this.favouritedArticles.querySelector('.pagination');
      this.profile = {};
    }

    disconnectedCallback() {
      //console.log('*** profile component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}

