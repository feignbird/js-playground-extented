import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, insertTab, indentMore, indentLess, indentWithTab } from '@codemirror/commands';
import { basicSetup } from 'codemirror';
import { javascript } from "@codemirror/lang-javascript";

// authors: feignbird & oceanencrypt, we've just extended it to easy use for react-native.
// credit: dabbot (the maker of JS playground)
(function(){
  "use strict";
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
          "prelude": `
    var bundle = window['react-navigation-bundle'];
    __VendorComponents.register('@react-navigation/native', { NavigationContainer: bundle.NavigationContainer });
    __VendorComponents.register('@react-navigation/stack', { createStackNavigator: bundle.createStackNavigator });

    function extractAndSendDivContent(fromParent=null) {
        try {
            // Try accessing the middle iframe's \`document\`
            let parentDoc = window.parent.document;

            // Get the div inside the middle iframe (Change selector as needed)
            let targetDiv = parentDoc.querySelector("#player-root").children[0].children[0].children[0].children[1];

            if (targetDiv) {
                let divContent = targetDiv.outerHTML;
                let message = {
                  'type' : 'element',
                  'value' : divContent,
                  'fromParent' : fromParent
                };
                // Send the extracted div content to the top-level parent page
                window.top.postMessage({ type: 'middle-iframe-div', content: JSON.stringify(message) }, '*');
            } else {
                message['type'] = 'error'
                message['value'] = 'Target div not found in middle iframe.'
                window.top.postMessage({ type: 'middle-iframe-div', content: JSON.stringify(message) }, '*');
                console.warn("Target div not found in middle iframe.");
            }
        } catch (err) {
            message['type'] = 'error'
            message['value'] = "Cannot access middle iframe:" + err
            window.top.postMessage({ type: 'middle-iframe-div', content: JSON.stringify(message) }, '*');
            console.error("Cannot access middle iframe:", err);
        }
    }

    // Try extracting when the page loads
    window.addEventListener('load', extractAndSendDivContent);
    // window.parent.window.addEventListener('load', extractAndSendDivContent);
    // window.parent.window.addEventListener('message', (e)=>{extractAndSendDivContent(e.data)});
    // window.setInterval(()=>{extractAndSendDivContent();}, 2000);
    // Try extracting when content updates

    new MutationObserver(extractAndSendDivContent).observe(document.body, { childList: true, subtree: true });
`,
          "modules": [
            {
              "name": "react-navigation-bundle",
              "url": "https://static-archives.s3.ap-south-1.amazonaws.com/react-navigation-bundle.js",
              "globalName": "react-navigation-bundle"
            }
          ]
        }
      ],
      "files": {
          "App.js" : "import { StyleSheet, Text, View } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>    \n      <Text>Hello world!</Text>      \n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n});"
      }
    };
  const cl = console.log;


  var FILE_NAMES = [];
  var current_configuration = {};
  var justChangedFileName = "";
  var selectedFileName = "";

  // ############################### editor code ####################################

  const view = new EditorView({
    state: EditorState.create({
        // doc: "// A sample \"Hello world\" code in react-native!\n\nimport { StyleSheet, Text, View } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>    \n      <Text>Hello world!</Text>      \n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n});",
        extensions: [
            basicSetup,
            javascript(),
            EditorState.tabSize.of(4),
            keymap.of([
              ...defaultKeymap,
              {
                  key: 'Tab',
                  preventDefault: true,
                  run: insertTab,
              },
              {
                  key: 'Shift-Tab',
                  preventDefault: true,
                  run: indentLess,
              },
            ]),
            EditorView.updateListener.of((v)=>{
                if(v.docChanged){
                    cl("changed somthing.")
                    setConfiguration(view.state.doc.toString());
                    setLocationHash(current_configuration);
                }
            })
        ]
    }),
    parent: document.getElementById('editor-container')
  })



  // This function takes the current_configuration and return the js_playground source url.
  const getIframeUrl = () => {
    return UNPKG_JS_PLAYGROUND_URL_PATH + encodeURIComponent(JSON.stringify(current_configuration)).replace(/\'/g,"%27").replace(/\"/g,"%22");
  };

  // This function takes optionally any url which has location hash set & return the configuation file.
  const getConfiguration = (srcUrl=null) => {
    if(srcUrl){
      return JSON.parse(decodeURIComponent(srcUrl.slice(srcUrl.indexOf("#data=")+6).replace(/\+/g,  " ")));
    }else if(window.location.hash.startsWith("#data=")){
      return JSON.parse(decodeURIComponent(window.location.href.slice(window.location.href.indexOf("#data=")+6).replace(/\+/g,  " ")));
    }else{
      return {};
    }
  };

  const setConfiguration = (value=null) => {
    if(value && (typeof value === 'string') && (selectedFileName.length != 0)){
      current_configuration.files[selectedFileName] = value;
    }
  };

  // This function takes the configuration and set proper file names in FILE_NAMES variable & also, returns it.
  const getFileNames = (newJSPlaygroundConfig=null) => {
    FILE_NAMES = Object.keys(newJSPlaygroundConfig?.files);
    return FILE_NAMES;
  };

  const setLocationHash = (configuration = null) => {
    if(configuration){
      window.location.hash = "data="+encodeURIComponent(JSON.stringify(configuration)).replace(/\'/g,"%27").replace(/\"/g,"%22");
    }else{
      window.location.hash = "data="+encodeURIComponent(JSON.stringify(STANDARD_JS_PLAYGROUND_CONFIG)).replace(/\'/g,"%27").replace(/\"/g,"%22");
    }
  };

  const setSelectedFileName = (fileName = null) => {
    if(fileName && (typeof fileName === 'string') && (fileName.length != 0) && (fileName in current_configuration.files)){
      selectedFileName = fileName;
    }
  };

  const setDoc = (value=null) => {
    if((typeof value === 'string') && value != null){
      view.dispatch({
        "changes" : {
          from : 0,
          to : view.state.doc.toString().length,
          insert: value
        }
      })
    }
  };

  const setEditorValueWithSelectedFileName = () => {
    if(selectedFileName.length == 0 || selectedFileName == null || selectedFileName.trim().length==0 || !current_configuration.files.hasOwnProperty(selectedFileName)){
      selectedFileName = FILE_NAMES[0];
    }
    setDoc(current_configuration.files[selectedFileName]);
  };

  const renderSelectedFile = () => {
    Array.from($('.fileName-input')).forEach((element)=>{
      if(element.innerText.trim() === selectedFileName.trim()){
        element.classList.add('fileName-input-selected');
      }else{
        element.classList.remove('fileName-input-selected');
      }
    })
  };

  // this function returns a tab's outer html with given file name
  const getATabBlockHtmlString = (fileName=null) => {
      return `
          <div class='tab-block'>
              <div class='fileName-input'>${fileName}</div>
              <div class='rename-button'><img src='./assets/rename-icon.png' alt='file rename button' width="20px" height="20px"></div>
              <div class='delete-button'>&times</div>
          </div>`;
  };

  // this function just renders the tab bar with given fileNames.
  const renderTabBarBlockHtmlString = (fileNameList=null) => {
    if(!fileNameList){ fileNameList = FILE_NAMES.sort(); }
    $('#tab-bar').empty();
    $('#tab-bar').append(fileNameList.map((item)=>getATabBlockHtmlString(item)).join('\n'));
    eventBinder();
    renderSelectedFile();
  };


  const errorEvent = (event) => {
    // TODO: Main issue is that when the error comes the prelude don't even get executed in the player-frame (nested-frame)
    // and everthing previous in the prelude gets removed. So, The error can only be shown when the javascript-playground repo (devit abbot) 
    // itself gets changed.
    // console.log("Received message:", event);
    // Check if the message is from the middle iframe (indirectly)
    // console.log("event: ", event.data);
    if (event.data.type === "middle-iframe-div") {
      console.log("Extracted div content from middle iframe:", event.data.content);
      $('#output-error').empty();
      let parsedJson = JSON.parse(event.data.content);
      if (parsedJson.type==="element"){
        $('#output-error').append(parsedJson.value);
      } else if (parsedJson.type==="error"){
        $('#output-error').append("<p> Internal error, Can't display the error! </p>");
        $('#output-error').append(`<p> ${parsedJson.value} </p>`);
      }
    }
  }


  const renderIframeBlockHtmlString = (srcUrl=null) => {
    $('#iframe-container').empty();
    window.removeEventListener('nested-iframe-content', errorEvent);
    window.addEventListener('message', errorEvent);
    $('#iframe-container').append(`<iframe src="${srcUrl}" id='main-iframe'></iframe>`);
  };

  const addAFile = (e=null) => {
    let renameList = FILE_NAMES.filter((item)=>item.includes('renameMe'));
    if(renameList.length==0){
      current_configuration.files['renameMe1.js'] = "";
      getFileNames(current_configuration);
    }else{
      renameList.sort(function(a, b){return (+a.slice(8,-3))-(+b.slice(8, -3))});
      let nextFileNumber = +renameList[renameList.length-1].slice(8,-3)+1;
      current_configuration.files[`renameMe${nextFileNumber}.js`] = "";
      getFileNames(current_configuration);
    }
    renderTabBarBlockHtmlString();
    setLocationHash(current_configuration);
  };

  const deleteAFile = (e=null) => {
    delete current_configuration.files[e.target.parentElement.querySelector('.fileName-input').innerText];
    getFileNames(current_configuration);
    setSelectedFileName(FILE_NAMES[0]);
    setEditorValueWithSelectedFileName();
    renderTabBarBlockHtmlString();
    setLocationHash(current_configuration);
  };


  const showFile = (e=null) => {
    setSelectedFileName(e.target.innerText.trim());
    setEditorValueWithSelectedFileName();
    renderSelectedFile();
    setLocationHash(current_configuration);
  };


  const chagneAFileName = (e=null) => {
    cl("In changeAFileName event handler onClick on rename button.....")
    let renamingElement = e.target.parentElement.parentElement.children[0]
    justChangedFileName = renamingElement.innerText.trim();
    let chosen_name = window.prompt("Please enter the filename: ", justChangedFileName);
    if(chosen_name===justChangedFileName){
      return null;
    }
    let valueOfJustChangedFile = current_configuration.files[justChangedFileName];
    delete current_configuration.files[justChangedFileName];
    let chosen_fileName = chosen_name.trim().slice(-4,).includes('.js')?chosen_name.trim():chosen_name.trim()+".js";
    current_configuration.files[chosen_fileName] = valueOfJustChangedFile;
    cl("renamingElement:", renamingElement);
    cl("justChangedFileName:", justChangedFileName);
    getFileNames(current_configuration);
    setSelectedFileName(chosen_fileName);
    renderTabBarBlockHtmlString();
    renderIframeBlockHtmlString(getIframeUrl());
    setLocationHash(current_configuration);
  };

  const renderIframe = (e=null) => {
    cl("renderIframe....");
    getFileNames(current_configuration);
    setLocationHash(current_configuration);
    renderIframeBlockHtmlString(getIframeUrl());
    cl("url: ", getIframeUrl());
  };

  const eventBinder = () => {
    cl("Current Configuration: ", current_configuration);
    $("#add-button").off();
    $("#add-button").on('click', addAFile);
    $('.delete-button').off();
    $('.delete-button').on('click', deleteAFile);
    $('.fileName-input').off();
    $('.fileName-input').on('click', showFile);
    $('.rename-button').off();
    $('.rename-button').on('click', chagneAFileName);
    $('#run').off();
    $('#run').on('click', renderIframe);
  };

  const renderRootBlock = (fileNameList=null, srcUrl=null) => {
    renderTabBarBlockHtmlString(fileNameList);
    renderSelectedFile();
    renderIframeBlockHtmlString(srcUrl);
  };

  // main code starting...... 
  if(!window.location.hash.startsWith('#data=')){
    current_configuration = STANDARD_JS_PLAYGROUND_CONFIG;
    setLocationHash(current_configuration);
    getFileNames(current_configuration);
    setEditorValueWithSelectedFileName();
  }else{
    current_configuration = getConfiguration(window.location.href);
    setLocationHash(current_configuration);
    getFileNames(current_configuration);
    setEditorValueWithSelectedFileName();
  }
  renderRootBlock(null, getIframeUrl());
})();
