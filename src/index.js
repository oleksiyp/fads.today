import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


function handleNewHash() {
  var location = window.location.hash.replace(/^#/, '');
  var application = <App location={location} />;
  ReactDOM.render(application, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
window.addEventListener('hashchange', handleNewHash, false);
handleNewHash()
