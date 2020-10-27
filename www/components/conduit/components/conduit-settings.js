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

  const componentName = 'conduit-settings';

  customElements.define(componentName, class conduit_settings extends HTMLElement {
    constructor() {
      super();

      const html = `
<div class="settings-page">
  <div class="container page">
    <div class="row">

      <div class="col-md-6 offset-md-3 col-xs-12">
        <h1 class="text-xs-center">Your Settings</h1>
        <ul class="error-messages"></ul>
        <form>
          <fieldset>
              <fieldset class="form-group">
                <input class="form-control" type="text" placeholder="URL of profile picture">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Username">
              </fieldset>
              <fieldset class="form-group">
                <textarea class="form-control form-control-lg" rows="8" placeholder="Short bio about you"></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Email">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="password" placeholder="New Password">
              </fieldset>
              <button class="btn btn-lg btn-primary pull-xs-right">
                Update Settings
              </button>
          </fieldset>
        </form>
        <hr />
        <button id="settings-logout" class="btn btn-outline-danger">
          Or click here to logout.
        </button>
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

    addError(text) {
      let el = document.createElement('li');
      el.textContent = text;
      this.errorsEl.appendChild(el);
    }

    show(el) {
      el.style = 'display:';
    }

    hide(el) {
      el.style = 'display: none';
    }

    onSelected() {
      //console.log('current user:');
      //console.log(this.context.user);

      let user = this.context.user;
      this.settingsForm.image.value = user.image;
      this.settingsForm.username.value = user.username;
      this.settingsForm.bio.value = user.bio;
      this.settingsForm.email.value = user.email;
      this.settingsForm.password.value = '';

      // clear down any errors
      this.errorsEl.textContent = '';
    }

    onLoaded() {

      // handler for form submit button

      const fn1 = async (e) => {
        e.preventDefault();
        let form = this.settingsForm;
        let params = {
          bio: form.bio.value,
          email: form.email.value,
          image: form.image.value,
          username: form.username.value,
          password: form.password.value
        };
        

        let results = await this.root.apis.updateUser(params);
        if (results.errors) {
          // display the errors at the top of the form
          for (let type in results.errors) {
            results.errors[type].forEach((text) => {
              let error = type + ' ' + text;
              this.addError(error);
            });
          }
        }
        else {
          // update the jwt and user context
          let jwt = results.user.token;
          this.context.jwt = jwt;
          localStorage.setItem('conduit-jwt', jwt);
          this.context.user = results.user;
          this.root.switchToPage('home_page');
        }
      };
      this.addHandler(fn1, this.submitBtn);

      // handler for logout button

      const fn2 = () => {
        delete this.context.jwt;
        localStorage.removeItem('conduit-jwt');
        this.root.showLoggedOutOptions();
        this.context.refresh_home_page = true;

        // remove all pages except home_page

        let pages = ['new_article', 'article', 'profile', 'signup', 'login', 'settings'];
        pages.forEach((page) => {
          let content_page = this.root.getComponentByName('CONDUIT-CONTENT-PAGE', page);
          if (content_page) {
            content_page.remove();
            delete this.root.contentPages[page];
          }
        });

        this.root.switchToPage('home_page');
      };
      this.addHandler(fn2, this.logoutBtn);

    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.errorsEl = this.rootElement.querySelector('.error-messages');
      this.form = this.rootElement.querySelector('form');
      let fields = this.form.getElementsByClassName('form-control');
      this.settingsForm = {
        image: fields[0],
        username: fields[1],
        bio: fields[2],
        email: fields[3],
        password: fields[4]
      }
      this.submitBtn = this.form.querySelector('button');
      this.logoutBtn = this.rootElement.querySelector('#settings-logout');
    }

    disconnectedCallback() {
      //console.log('*** settings component was removed!');
      if (this.onUnload) this.onUnload();
    }
  });
}
