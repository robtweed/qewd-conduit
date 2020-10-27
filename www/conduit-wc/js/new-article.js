/*

 ------------------------------------------------------------------------------------
 | wc-conduit: RealWorld Conduit Application Client using mg_webComponents          |
 |                                                                                  |
 | Copyright (c) 2020 M/Gateway Developments Ltd,                                   |
 | Redhill, Surrey UK.                                                              |
 | All rights reserved.                                                             |
 |                                                                                  |
 | http://www.mgateway.com                                                          |
 | Email: rtweed@mgateway.com                                                       |
 |                                                                                  |
 |                                                                                  |
 | Licensed under the Apache License, Version 2.0 (the "License");                  |
 | you may not use this file except in compliance with the License.                 |
 | You may obtain a copy of the License at                                          |
 |                                                                                  |
 |     http://www.apache.org/licenses/LICENSE-2.0                                   |
 |                                                                                  |
 | Unless required by applicable law or agreed to in writing, software              |
 | distributed under the License is distributed on an "AS IS" BASIS,                |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.         |
 | See the License for the specific language governing permissions and              |
 |  limitations under the License.                                                  |
 ------------------------------------------------------------------------------------

  23 October 2020

*/

export function new_article_assembly() {

  const component = {
    componentName: 'conduit-content-page',
    state: {
      name: 'new_article'
    },
    children: [
      {
        componentName: 'conduit-new-article',
        hooks: ['initialise']
      }
    ]
  };

  const hooks = {
    'conduit-new-article': {
      initialise: function() {
        let context = this.context;
        let contentPage = this.getParentComponent('conduit-content-page');
        contentPage.childComponent = this;
        this.setState({
          root: this.context.root
        });
        this.onSelected();
      }
    }
  };
  return {component, hooks};
};
