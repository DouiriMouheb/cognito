// Cognito Authentication is currently disabled for development
// To re-enable: uncomment imports in main.jsx and update this file

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy load Dashboard for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));

function App() {
  return (
    <>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingScreen message="Loading..." subtitle="Please wait" />}>
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/*" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
      <Toaster />
    </>
  );
}

export default App;
