/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resultado from './pages/Resultado';
import Privacidade from './pages/Privacidade';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/privacidade" element={<Privacidade />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
