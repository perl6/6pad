console.log('starting up 6pad');

const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    theme: 'zenburn'
});

document.getElementById('runbutton').addEventListener('click', function() {
    const code = editor.getValue();
    console.log('Running', code);
    eval(code);
});
