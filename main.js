try {
  eval('1n');
  document.getElementById('runbutton').removeAttribute('disabled');
} catch (e) {
  document.getElementById('missingbigint').removeAttribute('hidden');
}

const perlDoc = new CodeMirror.Doc('', 'perl6');
const htmlDoc = new CodeMirror.Doc('', 'html');
const cssDoc = new CodeMirror.Doc('', 'css');

const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    theme: 'zenburn',
    lineWrapping: true,
    cursorHeight: 0.85,
    tabSize: 4,
    indentUnit: 4,
    // Increase the number of lines that are rendered above and before
    viewportMargin: 100,
    autofocus: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    value: perlDoc
});

document.getElementById('runbutton').addEventListener('click', function() { const output = document.getElementById('output');
    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    const code = editor.getValue();
    window.evalP6(code);
//  eval(code); // for quicker testing with js
});

document.getElementById('sharebutton').addEventListener('click', function() {
    window.open('https://github.com/perl6/6pad/wiki/Sharing-Guide', '_blank');
});

function setupTabs(tabs, defaultIndex) {
  let selected = tabs[defaultIndex].button;

  for (const tab of tabs) {
    tab.button.addEventListener('click', function() {
      tab.action();
      selected.removeAttribute('selected');
      tab.button.setAttribute('selected', '');
      selected = tab.button;
    });
  }
}

setupTabs([
  {
    button: document.getElementById("perltab"),
    action:  function() {editor.swapDoc(perlDoc)}
  },
  {
    button: document.getElementById("htmltab"),
    action:  function() {editor.swapDoc(htmlDoc)}
  },
  {
    button: document.getElementById("csstab"),
    action:  function() {editor.swapDoc(cssDoc)}
  },
], 0);

const output = document.getElementById("output");
const frame = document.getElementById("frame");

setupTabs([
  {
    button: document.getElementById("resulttab"),
    action:  function() {
       output.style.visibility = 'hidden';
       frame.style.visibility = '';
    }
  },
  {
    button: document.getElementById("consoletab"),
    action:  function() {
       output.style.visibility = '';
       frame.style.visibility = 'hidden';
    }
  },
], 1);


async function loadGist(gist) {
  const response = await fetch("https://api.github.com/gists/" + gist);
  const json = await response.json();
  for (const fileName in json.files) {
      const file = json.files[fileName];
      if (file === 'main.p6') {
          perlDoc.setValue(file.content);
      }
      if (file === 'index.html') {
          htmlDoc.setValue(file.content);
      }
      if (file === 'styles.css') {
          cssDoc.setValue(file.content);
      }
  }
}


if (document.location.hash) {
    loadGist(document.location.hash.substr(1));
}

window.NQP_STDOUT = function(str) {
  document.getElementById('output').appendChild(document.createTextNode(str));
};

