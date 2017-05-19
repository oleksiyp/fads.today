import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


function handleNewHash() {
  var date = window.location.hash.replace(/^#\/?|\/$/g, '');
  var application = <App date={date} />;
  ReactDOM.render(application, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
window.addEventListener('hashchange', handleNewHash, false);
handleNewHash()
