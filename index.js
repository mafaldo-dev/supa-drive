import { registerRootComponent } from 'expo';
import { ThemeProvider } from './src/context/ThemeContext';
import App from './App';
import React from 'react';

const Root = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

registerRootComponent(Root);
