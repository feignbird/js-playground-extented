"use strict";
// authors: feignbird & oceanencrypt, we've just extended it to easy use for react-native.
// credit: dabbot (the maker of JS playground)
(function(){

  const UNPKG_JS_PLAYGROUND_URL_PATH = "https://unpkg.com/javascript-playgrounds@1.1.4/public/index.html#data=";
  const STANDARD_JS_PLAYGROUND_CONFIG = {
      "preset": "react-native",
      "fullscreen": true,
      "panes": [
        "editor",
        {
          "id": "player",
          "type": "player",
          "platform": "ios",
          "width": 320,
          "scale": 1,
          "prelude": "var bundle = window['react-navigation-bundle'];\n__VendorComponents.register('@react-navigation/native', { NavigationContainer: bundle.NavigationContainer });\n__VendorComponents.register('@react-navigation/stack', { createStackNavigator: bundle.createStackNavigator });",
          "modules": [
            {
              "name": "react-navigation-bundle",
              "url": "https://the-coder.s3.ap-south-1.amazonaws.com/js/react-navigation-bundle.js",
              "globalName": "react-navigation-bundle"
            },
            {
              "name": "tinylib",
              "url": "https://the-coder.s3.ap-south-1.amazonaws.com/tinylib.js",
              "globalName": "tinylib"
            }
          ]
        }
      ],
      "responsivePaneSets": [
        {
          "maxWidth": 920,
          "panes": [
            {
              "id": "stack",
              "type": "stack",
              "children": [
                {
                  "id": "editor-0",
                  "title": "Code",
                  "type": "editor"
                },
                {
                  "id": "player",
                  "title": "Live Preview",
                  "type": "player",
                  "platform": "ios",
                  "width": 320,
                  "scale": 1,
                  "prelude": "var bundle = window['react-navigation-bundle'];\n__VendorComponents.register('@react-navigation/native', { NavigationContainer: bundle.NavigationContainer });\n__VendorComponents.register('@react-navigation/stack', { createStackNavigator: bundle.createStackNavigator });",
                  "modules": [
                    {
                      "name": "react-navigation-bundle",
                      "url": "https://the-coder.s3.ap-south-1.amazonaws.com/js/react-navigation-bundle.js",
                      "globalName": "react-navigation-bundle"
                    },
                    {
                      "name": "tinylib",
                      "url": "https://the-coder.s3.ap-south-1.amazonaws.com/tinylib.js",
                      "globalName": "tinylib"
                    }
                  ],
                  "style": {
                    "paddingLeft": "0px",
                    "paddingRight": "0px"
                  }
                }
              ]
            }
          ]
        }
      ],
      "files": {
          "App.js" : "import { StyleSheet, Text, View } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>    \n      <Text>Hello world!</Text>      \n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n});",
          "homeScreen.js" : ""
      },
      "extraFiles": {},
      "styles": {
        "tab": {
          "backgroundColor": "rgb(250,250,250)"
        },
        "header": {
          "backgroundColor": "rgb(250,250,250)",
          "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 1px",
          "zIndex": 9
        },
        "headerText": {
          "color": "#AAA",
          "fontWeight": "normal"
        },
        "transpilerHeader": {
          "backgroundColor": "rgb(240,240,240)",
          "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 1px",
          "zIndex": 9
        },
        "transpilerHeaderText": {
          "color": "#888",
          "fontWeight": "normal"
        },
        "tabText": {
          "color": "#AAA"
        },
        "tabTextActive": {
          "color": "#333",
          "borderBottomColor": "rgb(59, 108, 212)"
        },
        "playerPane": {
          "overflow": "hidden",
          "background": "rgb(250, 250, 250)",
          "marginLeft": "0",
          "marginRight": "0",
          "paddingLeft": "10px",
          "paddingRight": "10px"
        },
        "consolePane": {
          "backgroundColor": "white"
        },
        "workspacesPane": {
          "flex": "0 0 25%"
        },
        "playerHeader": {
          "backgroundColor": "rgb(250,250,250)",
          "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 1px",
          "zIndex": 9
        },
        "playerHeaderText": {
          "color": "#AAA",
          "fontWeight": "normal"
        },
        "workspacesHeader": {
          "backgroundColor": "rgb(250,250,250)",
          "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 1px",
          "zIndex": 9
        },
        "workspacesHeaderText": {
          "color": "#AAA",
          "fontWeight": "normal"
        },
        "workspacesButtonWrapper": {
          "backgroundColor": "rgb(59, 108, 212)"
        },
        "workspacesRowActive": {
          "backgroundColor": "rgb(59, 108, 212)",
          "borderLeftColor": "rgb(59, 108, 212)"
        },
        "workspacesDescription": {
          "backgroundColor": "rgb(59, 108, 212)"
        }
      }
    };
  const cl = console.log;


  var FILE_NAMES = [];
  var EXTRA_FILE_NAMES = [];
  var current_configuration = {};
  var justChangedFileName = "";


  const getIframeUrl = () => {
    return UNPKG_JS_PLAYGROUND_URL_PATH + encodeURIComponent(JSON.stringify(current_configuration)).replace(/\'/g,"%27").replace(/\"/g,"%22");
  };

  const getConfiguration = (srcUrl=null) => {
    if(srcUrl){
      return JSON.parse(decodeURIComponent(srcUrl.slice(srcUrl.indexOf("#data=")+6).replace(/\+/g,  " ")));
    }else if(window.location.hash.startsWith("#data=")){
      return JSON.parse(decodeURIComponent(window.location.href.slice(window.location.href.indexOf("#data=")+6).replace(/\+/g,  " ")));
    }else{
      return {};
    }
  };

  const getFileNames = (newJSPlaygroundConfig=null) => {
    if(!newJSPlaygroundConfig.hasOwnProperty('extraFiles')){
        newJSPlaygroundConfig['extraFiles'] = {};
    }
    FILE_NAMES = Object.keys(newJSPlaygroundConfig?.files);
    EXTRA_FILE_NAMES = Object.keys(newJSPlaygroundConfig?.extraFiles);
    return [FILE_NAMES, EXTRA_FILE_NAMES];
  };

  const getATabBlockHtmlString = (fileName=null) => {
      let tabBlockOuterHtmlTemplate = `
          <div class='tab-block'>
              <div class='fileName-input'>${fileName}</div>
              <div class='delete-button'>&times</div>
          </div>`;
      return tabBlockOuterHtmlTemplate;
  };

  const renderTabBarBlockHtmlString = (fileNameList=null) => {
    if(!fileNameList){
      fileNameList = FILE_NAMES.concat(EXTRA_FILE_NAMES).sort();
    }
    $('#tab-bar').empty();
    $('#tab-bar').append(fileNameList.map((item)=>getATabBlockHtmlString(item)).join('\n'));
    eventBinder();
  };

  const renderIframeBlockHtmlString = (srcUrl=null) => {
    $('#iframe-container').empty();
    $('#iframe-container').append(`<iframe src="${srcUrl}" id='main-iframe'></iframe>`);
  };

  const addAFile = (e=null) => {
    let renameList = FILE_NAMES.concat(EXTRA_FILE_NAMES).filter((item)=>item.includes('renameMe'));
    if(renameList.length==0){
      current_configuration.extraFiles['renameMe1.js'] = "";
      getFileNames(current_configuration);
    }else{
      renameList.sort(function(a, b){return (+a.slice(8,-3))-(+b.slice(8, -3))});
      let nextFileNumber = +renameList[renameList.length-1].slice(8,-3)+1;
      current_configuration.extraFiles[`renameMe${nextFileNumber}.js`] = "";
      getFileNames(current_configuration);
    }
    renderTabBarBlockHtmlString();
  };

  const deleteAFile = (e=null) => {
    delete current_configuration.files[e.target.parentElement.querySelector('.fileName-input').innerText];
    delete current_configuration.extraFiles[e.target.parentElement.querySelector('.fileName-input').innerText];
    getFileNames(current_configuration);
    renderTabBarBlockHtmlString();
  };

  const putTheFileInIframe = (e=null) => {
    cl(e.target);
    current_configuration.extraFiles = {...current_configuration.extraFiles,  ...current_configuration.files }
    FILE_NAMES.forEach((item)=>{
      delete current_configuration.files[item]
    })
    current_configuration.files[e.target.innerText.trim()] = (function(){for(let fileName in current_configuration.extraFiles){
      if(fileName.trim() === e.target.innerText.trim()){
        return current_configuration.extraFiles[fileName];
      }
    }})();
    delete current_configuration.extraFiles[e.target.innerText.trim()];
    getFileNames(current_configuration);
    renderTabBarBlockHtmlString();
    renderIframeBlockHtmlString(getIframeUrl());
  };

  const chagneAFileName = (e=null) => {
    justChangedFileName = e.target.innerText.trim();
    e.target.focus = true;
    e.target.contentEditable = true;
  };

  const saveFileName = (e=null) => {
    if(current_configuration.files.hasOwnProperty(justChangedFileName)){
      let valueOfJustChangedFile = current_configuration.files[justChangedFileName];
      delete current_configuration.files[justChangedFileName];
      current_configuration.files[e.target.innerText.trim().slice(-4,).includes('.js')?e.target.innerText.trim():e.target.innerText.trim()+".js"] = valueOfJustChangedFile;
    }else if(current_configuration.extraFiles.hasOwnProperty(justChangedFileName)){
      let valueOfJustChangedFile = current_configuration.extraFiles[justChangedFileName];
      delete current_configuration.extraFiles[justChangedFileName];
      current_configuration.extraFiles[e.target.innerText.trim().slice(-4,).includes('.js')?e.target.innerText.trim():e.target.innerText.trim()+".js"] = valueOfJustChangedFile;      
    }
    e.target.contentEditable = false;
    e.target.focus = false;
    getFileNames(current_configuration);
    renderTabBarBlockHtmlString();
    renderIframeBlockHtmlString(getIframeUrl());
  };

  const saveFileNameOnEnter = (e=null) => {
    if(e.keyCode==13){
      saveFileName(e);
    }
  };

  const eventBinder = () => {
    $("#add-button").off();
    $("#add-button").on('click', addAFile);
    $('.delete-button').off();
    $('.delete-button').on('click', deleteAFile);
    $('.fileName-input').off();
    // $('.fileName-input').on('click', putTheFileInIframe);
    $('.fileName-input').on('dblclick', chagneAFileName);
    $('.fileName-input').on('focusout', saveFileName);
    $('.fileName-input').on('keypress', saveFileNameOnEnter);
    $('#iframe-container > iframe').on('change', function(e){
      cl(e.target);
    });
    // $("#iframe-container").off();
    // $('#iframe-container').on('message', function(event) {
    //   cl(event);
    // });
  };

  const renderRootBlock = (fileNameList=null, srcUrl=null) => {
    renderTabBarBlockHtmlString(fileNameList);
    renderIframeBlockHtmlString(srcUrl);
  };


  if(!window.location.hash.startsWith('#data=')){
    window.location.hash = "data="+encodeURIComponent(JSON.stringify(STANDARD_JS_PLAYGROUND_CONFIG)).replace(/\'/g,"%27").replace(/\"/g,"%22");
    current_configuration = STANDARD_JS_PLAYGROUND_CONFIG;
    getFileNames(current_configuration);
  }else{
    current_configuration = getConfiguration(window.location.href);
    getFileNames(current_configuration);
  }
  renderRootBlock(null, getIframeUrl());

  // check if location hash exist or not.
      // if exists:
          // convert it into an object
          // read the files
      // if not exists:
          // just add the standard frame src with hello world App.js file.
      
      // get the url and analyse it
      // add a overflow-x button-bar
          // add each file name as blocks with file name as labels in button-bar
          // the actions related to the button are defined seperately.

  // Buttons actions:
      // actions are creating a new file with add button at the end of the button bar
        // adding the new file to extraFiles object.
        // filtering the files name which have renameMe in them.
        // checking the list length if the length is 0 then getting adding 'renameMe1.js' to extraFiles & rerunning the getFileNames function.
        // 
      // deleting a file with delete button at the end of each button
      // opening a file in frame by clicking on them.
      // renaming a file by double clicking on them & focussing on that area.
})();
