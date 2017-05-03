import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import WebFontLoader from 'webfontloader';

WebFontLoader.load({
  google: {
    families: ['Roboto:300,400,500,700', 'Material Icons'],
  },
});

function handleNewHash() {
  var date = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
  var application = <App date={date} />;
  ReactDOM.render(application, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
handleNewHash()
window.addEventListener('hashchange', handleNewHash, false);
