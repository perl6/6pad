
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    theme: 'zenburn'
});

document.getElementById('runbutton').addEventListener('click', function() {
    const code = editor.getValue();
    console.log('Running', code);
    eval(code);
});

async function loadGist(gist) {
  const response = await fetch("https://api.github.com/gists/" + gist);
  const json = await response.json();
  for (const fileName in json.files) {
      const file = json.files[fileName];
      if (/.p6$/.test(fileName)) {
          editor.setValue(file.content);
      }
  }
  console.log(json.files);
}


if (document.location.hash) {
    loadGist(document.location.hash.substr(1));
}
