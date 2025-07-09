import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { store } from './store';
import { MonetizationProvider } from './monetization';
import { ThemeProvider } from './theme';
import reportWebVitals from './reportWebVitals';

function renderApp(): void {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ReduxProvider store={store}>
        <MonetizationProvider>
          <ThemeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </MonetizationProvider>
      </ReduxProvider>
    </React.StrictMode>
  );
}

function main(): void {
  renderApp();
  reportWebVitals();
}

main();