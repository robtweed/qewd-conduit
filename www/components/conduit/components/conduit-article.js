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

  const componentName = 'conduit-article';

  customElements.define(componentName, class conduit_article extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="article-page">
  <div class="banner">
    <div class="container">
      <h1></h1>

      <div class="article-meta">
        <a class="banner-author-image" href="#"><img src="" /></a>
        <div class="info">
          <a href="#" class="author"></a>
          <span class="date"></span>
        </div>
        <button id="banner-followBtn" class="btn btn-sm btn-outline-secondary">
          <i class="ion-plus-round"></i>
          &nbsp;
          <span class="follow-toggle">Follow</span> 
          <span class="follow-author"></span>
        </button>
        &nbsp;&nbsp;
        <button id="banner-favouriteBtn" class="btn btn-sm btn-outline-primary">
          <i class="ion-heart"></i>
          &nbsp;
          <span class="favourite-toggle">Favorite Article</span>
          <span class="counter"></span>
        </button>
        <span class="article-maintain">
          <button class="btn btn-sm btn-outline-secondary">
            <i class="ion-edit"></i>
            <span> Edit Article</span>
          </button>
          <button class="btn btn-sm btn-outline-danger">
            <i class="ion-trash-a"></i>
            <span> Delete Article</span>
          </button>
        </span>
      </div>

    </div>
  </div>

  <div class="container page">

    <div class="row article-content">
      <div class="col-xs-12">
        <div class="content-body"></div>
        <ul class="tag-list"></ul>
      </div>
    </div>
    <hr />

    <div class="row">
      <div class="col-xs-12 col-md-8 offset-md-2">

        <div class="not-logged-in">
          <p>
            <a class="sign-in" href="#">Sign in</a>
            &nbsp;or&nbsp;
            <a class="sign-up" href="#">sign up</a>
            to add comments on this article          
          </p>
        </div>

        <div class="logged-in">

          <form class="card comment-form">
            <div class="card-block">
              <textarea class="form-control" placeholder="Write a comment..." rows="3"></textarea>
            </div>
            <div class="card-footer">
              <img src="" class="comment-author-img" />
              <button class="btn btn-sm btn-primary">
               Post Comment
              </button>
            </div>
          </form>

        </div>

        <div class="article-comments"></div>  
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
      if (state.root) {
        this.root = state.root;
        state.root.article_page = this;
      }

      if (state.loggedIn) {
        this.show(this.loggedInEl);
        this.hide(this.loggedOutEl);
        this.commentFormImage.setAttribute('src', this.context.user.image);
      }
      if (state.loggedIn === false) {
        this.show(this.loggedOutEl);
        this.hide(this.loggedInEl);
      }

      if (state.title) {
        this.banner.titleEl.textContent = state.title;
      }
      if (state.author) {
        this.banner.authorEl.textContent = state.author;
        this.banner.followAuthorEl.textContent = state.author;

        if (this.loggedIn && this.context.user.username === state.author) {
          // remove Follow and favourite buttons so unable to follow/favourite yourself!
          this.hide(this.banner.followBtn);
          this.hide(this.banner.favouriteBtn);
          this.show(this.banner.maintenanceEl);
        }
        else {
          this.show(this.banner.followBtn);
          this.show(this.banner.favouriteBtn);
          this.hide(this.banner.maintenanceEl);
        }

      }
      if (typeof state.image !== 'undefined') {
        let image = state.image;
        if (image === '') image = this.context.defaultImage;
        this.banner.authorImg.setAttribute('src', image);
      }
      if (state.date) {
        this.banner.dateEl.textContent = this.context.formatDate(state.date);
      }
      if (typeof state.favoritesCount !== 'undefined') {
        this.banner.favouritesCountEl.textContent = '(' + state.favoritesCount + ')';
      }
      if (state.body) {
        this.bodyEl.innerHTML = this.markdownConverter.makeHtml(state.body)
      }
      if (state.tags) {
        this.removeTags();
        this.addTags(state.tags);
      }
      if (state.following === false) {
        this.banner.followToggleEl.textContent = 'Follow';
      }
      if (state.following) {
        this.banner.followToggleEl.textContent = 'Unfollow';
      }
      if (state.favorited === false) {
        this.banner.favouriteToggleEl.textContent = 'Favorite Article';
      }
      if (state.favorited) {
        this.banner.favouriteToggleEl.textContent = 'Unfavorite Article';
      }
    }

    addTags(tags) {
      const noOfTags = tags.length;

      const addTag = async (no) => {
        if (no > (noOfTags -1)) {
          return;
        }

        let assembly = {
          componentName: 'conduit-article-tag',
          state: {
            text: tags[no]
          }
        };

        await this.loadAssembly(assembly, this.tagListEl, this.context);
        addTag(no + 1);
      }

      // kick it off
      addTag(0);
    }

    removeTags() {
      let tags = [...this.tagListEl.getElementsByTagName('conduit-article-tag')];
      tags.forEach((tag_component) => {
        tag_component.remove();
      });
    }

    async fetchArticle() {
      let article = await this.root.apis.getArticleBySlug();
      return this.normaliseArticle(article);
    }

    normaliseArticle(article) {
      article.image = article.author.image;
      article.following = article.author.following;
      article.author = article.author.username;
      article.date = article.updatedAt;
      article.tags = article.tagList;
      return article;
    }

    async getAndDisplayArticle() {
      this.setState({loggedIn: this.loggedIn});
      this.article = await this.fetchArticle();
      this.setState(this.article);
    }

    async getAndDisplayComments() {
      this.removeComments();
      // note: api picks up current slug from context object
      let comments = await this.root.apis.getComments();
      this.addComments(comments);
    }

    addComments(comments) {
      const noOfComments = comments.length;

      const addComment = async (no) => {
        if (no > (noOfComments -1)) {
          return;
        }
        let comment = comments[no];
        await this.addComment(comment);
        addComment(no + 1);
      }

      // kick it off
      addComment(0);
    }

    async addComment(comment) {
      comment.root = this.root;
      comment.slug = this.article.slug;
      if (comment.author.image === '') {
        comment.author.image = this.defaultImgSrc;
      }
      let assembly = {
        componentName: 'conduit-comment',
        state: comment
      };
      await this.loadAssembly(assembly, this.commentsEl, this.context);
      return;
    }

    removeComments() {
      let comments = [...this.commentsEl.getElementsByTagName('conduit-comment')];
      comments.forEach((comment) => {
        comment.remove();
      });
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    onSelected() {
      this.loggedIn = this.root.isLoggedIn();

      this.setState({loggedIn: this.loggedIn});
      if (this.context.return_to === 'article') {
        // returned here after login so no need to update the article content
        delete this.context.return_to;
        return;
      }

      this.getAndDisplayArticle();
      this.getAndDisplayComments();

      // change home link display status in top-right navs
      if (this.context.root.homeLink.classList.contains('active')) {
        this.context.root.homeLink.classList.remove('active');
      }
    }

    onLoaded() {
      this.defaultImgSrc = this.context.defaultImage || '';

      // Follow/Unfollow button

      const fn = async () => {
        if (!this.loggedIn) {
          this.context.return_to = 'article';
          this.root.switchToPage('login');
        }
        else {
          if (this.banner.followToggleEl.textContent === 'Follow') {
            let results = await this.root.apis.follow(this.article.author);
            if (!results.error) {
              this.setState({
                following: results.profile.following
              });
            }
          }
          else {
            let results = await this.root.apis.unfollow(this.article.author);
            if (!results.error) {
              this.setState({
                following: results.profile.following
              });
            }
          }
        }
      };
      this.addHandler(fn, this.banner.followBtn);

      // Favourite/Unfavourite button

      const fn2 = async () => {
        let slug = this.article.slug;

        if (!this.loggedIn) {
          this.context.return_to = 'article';
          this.root.switchToPage('login');
        }
        else {
          if (this.banner.favouriteToggleEl.textContent === 'Favorite Article') {
            let results = await this.root.apis.favourite(slug);
            if (!results.error) {
              this.article = this.normaliseArticle(results.article);
              this.setState(this.article);
            }
          }
          else {
            let results = await this.root.apis.unfavourite(slug);
            if (!results.error) {
              this.article = this.normaliseArticle(results.article);
              this.setState(this.article);
            }
          }
        }

      };
      this.addHandler(fn2, this.banner.favouriteBtn);

      // Author link in banner - switch to display that author

      const fn3 = () => {
        this.context.author = this.article.author;
        this.root.switchToPage('profile');
      }
      this.addHandler(fn3, this.banner.authorEl);
      this.addHandler(fn3, this.banner.authorImgLink);

      // Comment Button

      const fn4 = async (e) => {
        e.preventDefault();
        let results = await this.root.apis.addComment(this.article.slug, this.commentFormText.value);
        if (!results.error) {
          await this.addComment(results.comment);
          this.commentFormText.value = '';
        }
      };
      this.addHandler(fn4, this.commentFormBtn);

      // Signin handler

      const fn5 = () => {
        this.context.return_to = 'article';
        this.root.switchToPage('login');
      };
      this.addHandler(fn5, this.signInEl);


      // Signup handler

      const fn6 = () => {
        this.context.return_to = 'article';
        this.root.switchToPage('signup');
      };
      this.addHandler(fn6, this.signUpEl);

      // Edit article button in banner

      const fn7 = () => {
        this.context.editing_article = this.article;
        this.root.switchToPage('new_article');
      };
      this.addHandler(fn7, this.banner.editArticleBtn);

      // Delete article button in banner

      const fn8 = async () => {
        let results = await this.root.apis.deleteArticle(this.article.slug);
        if (!results.errors) {
          this.context.refresh_home_page = true;
          this.root.switchToPage('home_page');
        }
      };
      this.addHandler(fn8, this.banner.deleteArticleBtn);

    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      let banner = this.rootElement.querySelector('.banner');
      let followBtn = banner.querySelector('#banner-followBtn');
      let favouriteBtn = banner.querySelector('#banner-favouriteBtn');
      let maintainEl = banner.querySelector('.article-maintain');
      let maintainBtns = maintainEl.getElementsByTagName('button');
      this.banner = {
        titleEl: banner.querySelector('h1'),
        authorEl: banner.querySelector('.author'),
        authorImgLink: banner.querySelector('.banner-author-image'),
        authorImg: banner.querySelector('img'),
        dateEl: banner.querySelector('.date'),
        followBtn: followBtn,
        followAuthorEl: followBtn.querySelector('.follow-author'),
        followToggleEl: followBtn.querySelector('.follow-toggle'),
        favouriteBtn: favouriteBtn,
        favouritesCountEl: favouriteBtn.querySelector('.counter'),
        favouriteToggleEl: favouriteBtn.querySelector('.favourite-toggle'),
        maintenanceEl: maintainEl,
        editArticleBtn: maintainBtns[0],
        deleteArticleBtn: maintainBtns[1]
      }
      let content = this.rootElement.querySelector('.article-content');
      this.bodyEl = content.querySelector('.content-body');
      this.loggedInEl = this.rootElement.querySelector('.logged-in');
      this.loggedOutEl = this.rootElement.querySelector('.not-logged-in');
      this.signInEl = this.rootElement.querySelector('.sign-in');
      this.signUpEl = this.rootElement.querySelector('.sign-up');
      this.tagListEl = this.rootElement.querySelector('.tag-list');
      this.markdownConverter = new showdown.Converter();
      this.commentsEl = this.rootElement.querySelector('.article-comments');
      this.commentForm = this.rootElement.querySelector('.comment-form');
      this.commentFormText = this.commentForm.querySelector('textarea');
      this.commentFormImage = this.commentForm.querySelector('img');
      this.commentFormBtn = this.commentForm.querySelector('button');
      this.article = {};
    }

    disconnectedCallback() {
      //console.log('*** div component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
