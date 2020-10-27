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

 27 October 2020

*/

export function load() {

  const componentName = 'conduit-root';

  customElements.define(componentName, class conduit_root extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="d-flex flex-column">
  <nav class="navbar navbar-light">
    <div class="container">
      <a class="navbar-brand" href="#">conduit</a>
      <ul id="header" class="nav navbar-nav pull-xs-right">
        <li class="nav-item">
          <!-- Add "active" class when you're on that page" -->
          <a id="home-link" class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a id="sign-in-link" class="nav-link" href="#">Sign in</a>
        </li>
        <li class="nav-item">
          <a id="sign-up-link" class="nav-link" href="#">Sign up</a>
        </li>
        <li class="nav-item">
          <a id="new-post-link" class="nav-link" href="#">
            <i class="ion-compose"></i>
            New Post
          </a>
        </li>
        <li class="nav-item">
          <a id="settings-link" class="nav-link" href="#">
            <i class="ion-gear-a"></i>
            Settings
          </a>
        </li>
        <li class="nav-item">
          <a id="user-link" class="nav-link" href="#">
            <img class="user-pic" src="">
            <span></span>
          </a>
        </li>
      </ul>
    </div>
  </nav>

  <div id="pageContent" class="container-fluid"></div>

  <footer>
    <div class="container">
      <a href="/" class="logo-font">conduit</a>
      <span class="attribution">
        An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.
      </span>
    </div>
  </footer>

</div>
      `;

       this.html = `${html}`;
    }

    // generic methods that will be used by other components

    addArticles(articlesArr, parentDiv) {
      let noOfArticles = articlesArr.length;

      if (noOfArticles === 0) {
        const el = document.createElement('div');
        el.textContent = 'No articles are here... yet.';
        el.className = 'article-preview';
        parentDiv.appendChild(el);
        return;
      }

      const addNextArticle = async (no) => {
        if (no > noOfArticles) return;

        let articleObj = articlesArr[no - 1];
        let assembly = {
          componentName: 'conduit-article-preview',
          state: {
            slug: articleObj.slug,
            author: articleObj.author,
            date: articleObj.date,
            title: articleObj.title,
            text: articleObj.text,
            favoritesCount: articleObj.favoritesCount,
            favorited: articleObj.favorited,
            image: articleObj.image,
            tags: articleObj.tags,
            home_page: this.home_page,
            root: this
          }
        };

        await this.loadAssembly(assembly, parentDiv, this.context);
        addNextArticle(no + 1);
      }
      addNextArticle(1);
    }

    normaliseArticles(results) {
      let articlesArr = [];
      results.articles.forEach((article) => {
        articlesArr.push({
          slug: article.slug,
          author: article.author.username,
          date: article.createdAt,
          title: article.title,
          text: article.body,
          favoritesCount: article.favoritesCount,
          image: article.author.image,
          tags: article.tagList,
          following: article.author.following,
          favorited: article.favorited
        });
      });
      return {
        articlesArr: articlesArr,
        articlesCount: results.articlesCount
      };
    }

    removeArticles(parentDiv) {
      let articles = [...parentDiv.getElementsByTagName('conduit-article-preview')];
      articles.forEach((article_component) => {
        article_component.remove();
      });
      // if there were no articles, remove the "no articles here" div
      parentDiv.textContent = '';
    }

    addPagination(articlesCount, parentDiv, classification, limit) {
      limit = limit || 10;
      if (articlesCount > limit) {
        let noOfLinks = Math.floor(articlesCount / limit);
        if ((articlesCount % limit) > 0) noOfLinks++;

        const addNextLink = async (no) => {
          if (no > noOfLinks) return;

          let assembly = {
            componentName: 'conduit-pagination-link',
            state: {
              no: no,
              ownerPage: this,
              limit: limit,
              classification: classification
            }
          };
          await this.loadAssembly(assembly, parentDiv, this.context);
          addNextLink(no + 1);
        }
        addNextLink(1);
      }
    }

    removePagination(parentDiv) {
      let links = [...parentDiv.getElementsByTagName('conduit-pagination-link')];
      links.forEach((link_component) => {
        link_component.remove();
      });
    }

    getContentPage(pageName) {
      let children = [...this.contentTarget.childNodes];
      let child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tagName === 'CONDUIT-CONTENT-PAGE' && child.name === pageName) {
          return child;
        }
      }
    }

    setPageActive(pageName) {
      //console.log('setPageActive triggered for ' + pageName);
      // set selected page to active
      let page = this.getContentPage(pageName);
      page.setState({show: true});
      if (page.onSelected) page.onSelected();
      this.activePage = pageName;
    }

    switchToPage(pageName) {
      //console.log('switch to page: ' + pageName);
      //console.log('this.activePage = ' + this.activePage);
      //console.log(this.contentPages);
      if (pageName === 'home_page' && this.activePage === pageName) {
        //console.log('ignored - ' + pageName + ' is already the currently active page');
        return; // already the active page
      }

      if (!this.contentPages[pageName]) {
        let config = this.getInstanceFromRegistry(pageName);
        if (config) {
          this.loadGroup(config, this.contentTarget, this.context);
          this.contentPages[pageName] = true;
          // setPageActive will get triggered when page config is loaded
        }
      }
      else {
        // already attached
        this.setPageActive(pageName);
      }
    }

    isReady() {
      if (this.context.readyEvent) {
        document.dispatchEvent(this.context.readyEvent);
      }
    }

    setState(state) {
      if (state.title) {
        this.headerTitle.textContent = state.title;
      }
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    showLoggedOutOptions() {
      this.show(this.signInLink);
      this.show(this.signUpLink);
      this.hide(this.newPostLink);
      this.hide(this.settingsLink);
      this.hide(this.userLink);      
    }

    showLoggedInOptions() {
      this.hide(this.signInLink);
      this.hide(this.signUpLink);
      this.show(this.newPostLink);
      this.show(this.settingsLink);
      this.userImg.setAttribute('src', this.context.user.image || this.context.defaultImage || '');
      this.userName.textContent = this.context.user.username;
      this.show(this.userLink);
    }

    isLoggedIn() {
      if (this.context.jwt) {
        return true;
      }
      return false;
    }

    onLoaded() {

      this.addMetaTag({
        charset: 'utf-8'
      });

      let prefix = '';
      if (this.context.resourcePath) prefix = this.context.resourcePath;
      if (this.context.paths && this.context.paths.conduit) {
        prefix = this.context.paths.conduit;
        if (prefix[0] === '.') prefix = prefix.slice(1);
      }
      if (prefix !== '' && prefix.slice(-1) !== '/') prefix = prefix + '/';

      this.loadCSSFile('//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css');
      this.loadCSSFile('//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic');
      this.loadCSSFile('//demo.productionready.io/main.css');

      this.loadJSFile(prefix + 'js/auth0/jwt-decode.min.js', () => {
        // trigger ready event - home page can now safely render
        this.isReady();
      });
      this.loadJSFile(prefix + 'js/showdown/showdown.min.js');

      // add home link handler

      const fn = () => {
        this.switchToPage('home_page');
      };
      this.addHandler(fn, this.homeLink);
      this.addHandler(fn, this.headerTitle);

      // Sign In link in top right

      const fn2 = () => {
        this.switchToPage('login');
      };
      this.addHandler(fn2, this.signInLink);

      // Sign Up link in top right

      const fn3 = () => {
        this.switchToPage('signup');
      };
      this.addHandler(fn3, this.signUpLink);

      // New Post link in top-right

      const fn4 = () => {
        this.switchToPage('new_article');
      };
      this.addHandler(fn4, this.newPostLink);

      // Settings link in top-right

      const fn5 = () => {
        this.switchToPage('settings');
      };
      this.addHandler(fn5, this.settingsLink);

      const fn6 = () => {
        this.context.author = this.context.user.username;
        this.switchToPage('profile');
      };
      this.addHandler(fn6, this.userLink);

      this.showLoggedOutOptions();
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.headerTitle = this.rootElement.querySelector('.navbar-brand');
      this.headerTarget = this.rootElement.querySelector('#bs-admin-topbar');
      this.contentTarget = this.rootElement.querySelector('#pageContent');
      this.footerTitle = this.rootElement.querySelector('.logo-font');
      this.footerAttribution = this.rootElement.querySelector('.attribution');
      this.homeLink = this.rootElement.querySelector('#home-link');
      this.signInLink = this.rootElement.querySelector('#sign-in-link');
      this.signUpLink = this.rootElement.querySelector('#sign-up-link');
      this.newPostLink = this.rootElement.querySelector('#new-post-link');
      this.settingsLink = this.rootElement.querySelector('#settings-link');
      this.userLink = this.rootElement.querySelector('#user-link');
      this.userImg = this.userLink.querySelector('img');
      this.userName = this.userLink.querySelector('span');
      this.contentPages = {};
      this.name = 'root'

    }

    disconnectedCallback() {
      if (this.onUnload) this.onUnload();
    }

  });

}
