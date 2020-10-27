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

  const componentName = 'conduit-new-article';

  customElements.define(componentName, class conduit_new_article extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="editor-page">
  <div class="container page">
    <div class="row">
      <div class="col-md-10 offset-md-1 col-xs-12">
        <ul class="error-messages">
        </ul>
        <form>
          <fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control form-control-lg" placeholder="Article Title">
            </fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control" placeholder="What's this article about?">
            </fieldset>
            <fieldset class="form-group">
                <textarea class="form-control" rows="8" placeholder="Write your article (in markdown)"></textarea>
            </fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control" placeholder="Enter tags">
                <div class="tag-list"></div>
            </fieldset>
            <button class="btn btn-lg pull-xs-right btn-primary" type="button">
                Publish Article
            </button>
          </fieldset>
        </form>
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
      }
    }

    addErrors(errors) {
      let type;
      for (type in errors) {
        errors[type].forEach((error) => {
          this.addError(type + ' ' + error);
        });
      }
    }

    addError(text) {
      let li = document.createElement('li');
      let span = document.createElement('span');
      span.textContent = text;
      li.appendChild(span);
      this.errorsEl.appendChild(li);
    }

    clearErrors() {
      this.errorsEl.textContent = '';
    }

    addTags(tags) {
      const noOfTags = tags.length;

      const addTag = async (no) => {
        if (no > (noOfTags -1)) {
          return;
        }
        await this.addTag(tags[no]);
        addTag(no + 1);
      }

      // kick it off
      addTag(0);
    }

    async addTag(tag) {
      let assembly = {
        componentName: 'conduit-new-article-tag',
        state: {
          text: tag,
          new_article: this
        }
      };
      await this.loadAssembly(assembly, this.tagListEl, this.context);
    }

    removeTags() {
      let tags = [...this.tagListEl.getElementsByTagName('conduit-new-article-tag')];
      tags.forEach((tag_component) => {
        tag_component.remove();
      });
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    onSelected() {

      this.article.title.value = '';
      this.article.description.value = '';
      this.article.body.value = '';
      this.article.tagList.value = '';
      this.tagList = [];
      this.removeTags();

      if (this.context.editing_article) {
        // populate the form with data from the selected article
        let article = this.context.editing_article;
        this.article.title.value = article.title;
        this.article.description.value = article.description;
        this.article.body.value = article.body;
        this.addTags(article.tagList);
        this.tagList = article.tagList;
      }

    }

    onLoaded() {

      this.tagList = [];

      // tag list input handler

      const fn1 = async () => {

        const value = this.article.tagList.value;

        if (this.tagList.indexOf(value) !== -1) {
          // already added this tag, so ignore and clear the field
          this.article.tagList.value = '';
          return;
        }

        // create a new tag icon
        this.tagList.push(value);
        this.addTag(value);
        // clear the input for the next tag being specified
        this.article.tagList.value = '';

      };
      this.addHandler(fn1, this.article.tagList, 'change');

      // form submission handler

      const fn2 = async (e) => {
        e.preventDefault();
        let article = this.article;
        let results;

        if (this.context.editing_article) {
          // submitting edits to an existing article
          let slug = this.context.editing_article.slug;
          results = await this.root.apis.updateArticle(slug, article.title.value, article.description.value, article.body.value, this.tagList);
        }
        else {
          // submitting a new article
          results = await this.root.apis.createArticle(article.title.value, article.description.value, article.body.value, this.tagList);
        }
        if (!results.errors) {
          this.context.editing_article = false;
          this.context.refresh_home_page = true;
          this.context.slug = results.article.slug;
          this.root.switchToPage('article');
        }
        else {
          this.clearErrors();
          this.addErrors(results.errors);
        }

      };
      this.addHandler(fn2, this.submitBtn);

    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.form = this.rootElement.querySelector('form');
      let fields = [...this.form.getElementsByClassName('form-control')];
      this.article = {
        title: fields[0],
        description: fields[1],
        body: fields[2],
        tagList: fields[3]
      };
      this.tagListEl = this.form.querySelector('.tag-list');
      this.submitBtn = this.form.querySelector('button');
      this.errorsEl = this.rootElement.querySelector('.error-messages');
    }

    disconnectedCallback() {
      //console.log('*** new article component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
