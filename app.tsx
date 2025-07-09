import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth';
import { ThemeProvider } from './theme';
import { CoinProvider } from './context/coin';
import Login from './login';
import AdminPanel from './admindashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user && user.isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

function Builder() {
  return (
    <div className="app-builder">
      <header className="app-nav">
        <CoinBalance />
        <ThemeToggle />
      </header>
      <main className="app-main">
        <section className="selectors">
          <HeaderSelector />
          <HeroSelector />
        </section>
        <section className="tools">
          <PaletteGenerator />
          <Editor />
        </section>
      </main>
      <footer className="app-footer">
        <ExportSection />
      </footer>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CoinProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPanel />
                  </RequireAdmin>
                }
              />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <Builder />
                  </RequireAuth>
                }
              />
            </Routes>
          </Router>
        </CoinProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;