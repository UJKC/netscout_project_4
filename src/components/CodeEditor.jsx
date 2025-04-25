import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { registerCustomCompletions } from '../utility/DropdownController';

const CodeEditor = ({ onChange, results }) => {
  console.log("Here from CodeEditor by LC. Actual Editor");
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = monaco;
    registerCustomCompletions(monaco, results);

    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Enter) {
        e.preventDefault();
      }
    });
  };

  useEffect(() => {
    if (monacoRef.current && results) {
      registerCustomCompletions(monacoRef.current, results);
    }
  }, [results]);

  return (
    <Editor
      height="90vh"
      defaultLanguage="plaintext"
      theme="vs-dark"
      onMount={handleEditorDidMount}
      onChange={(value) => onChange(value)}
      options={{ lineNumbers: 'off', autoClosingBrackets: 'never'}}
    />
  );
};

export default CodeEditor;
