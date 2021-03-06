let loaded = false;

function updateButton() {
  if (loaded) {
    document.getElementById('runbutton').removeAttribute('disabled');
  }
}

window.addEventListener("load", function(event) {
  loaded = true;
  updateButton();
});

const perlDoc = new CodeMirror.Doc('', 'perl6');
const htmlDoc = new CodeMirror.Doc('', 'htmlmixed');
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
});

editor.swapDoc(perlDoc);

document.getElementById('runbutton').addEventListener('click', function() { const output = document.getElementById('output');
    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    const code = perlDoc.getValue();
    window.evalP6(code);
});

document.getElementById('sharebutton').addEventListener('click', function() {
    window.open('https://github.com/perl6/6pad/wiki/Sharing-Guide', '_blank');
});

class Tabs {
  constructor(tabs, defaultIndex) {
    this.tabs = tabs;
    this.selected = tabs[defaultIndex].button;

    for (const tab of tabs) {
      tab.button.addEventListener('click', () => {
        this.select(tab);
      });
    }
  }

  select(tab) {
    tab.action();
    this.selected.removeAttribute('selected');
    tab.button.setAttribute('selected', '');
    this.selected = tab.button;
  }
}

new Tabs([
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

const outputTabs = new Tabs([
  {
    button: document.getElementById("resulttab"),
    action:  function() {
       output.style.visibility = 'hidden';
       frame.style.visibility = 'visible';
    }
  },
  {
    button: document.getElementById("consoletab"),
    action:  function() {
       output.style.visibility = 'visible';
       frame.style.visibility = 'hidden';
    }
  },
], 1);


async function loadGist(gist) {
  const response = await fetch("https://api.github.com/gists/" + gist);
  const json = await response.json();
  for (const fileName in json.files) {
      const file = json.files[fileName];
      if (fileName === 'main.p6') {
          perlDoc.setValue(file.content);
      } else if (fileName === 'index.html') {
          htmlDoc.setValue(file.content);
          outputTabs.select(outputTabs.tabs[0]);
      } else if (fileName === 'styles.css') {
          cssDoc.setValue(file.content);
      } else {
          window.NQP_STDOUT('Unrecognized file in gist: ' + fileName);
      }
  }
}

console.log('document.location.hash', document.location.hash);
if (document.location.hash) {
    console.log('hash', document.location.hash);
    loadGist(document.location.hash.substr(1));
}

window.NQP_STDOUT = function(str) {
  const span = document.createElement('span');
  span.innerHTML = str;
  document.getElementById('output').appendChild(span);
};

const samples = document.getElementById('samples');
samples.onchange = function() {
  if (samples.value && samples.value != '0') {
    document.location.hash = samples.value;
    loadGist(samples.value);
  }
}

class Reconciler {
  constructor(source, set) {
    this.source = source;
    this.targetValue = '';
    this.set = set;
    window.setInterval(() => {
      const newValue = this.source.getValue();
      if (newValue != this.targetValue) {
        this.set(newValue);
        this.targetValue = newValue;
      }
    });
  }
};

new Reconciler(htmlDoc, html => frame.innerHTML = html);

const cssPart = document.getElementById('csspart');
new Reconciler(cssDoc, css => {
  while (cssPart.firstChild) {
    cssPart.removeChild(cssPart.firstChild);
  }
  cssPart.appendChild(document.createTextNode(css));
});
