// src/App.jsx
import React from 'react';
import CodeEditor from './components/CodeEditor';
import Data from '../src/utility/Constants';
import Dupli from './components/SDD';

function App() {
  return (
    <div>
      <h1>Monaco Editor in React</h1>
      <Dupli cacheData={Data} />
    </div>
  );
}

export default App;
