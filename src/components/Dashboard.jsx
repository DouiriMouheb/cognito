import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LoadingScreen from './LoadingScreen';

// Lazy load heavy components
const TimeSheetList = lazy(() => import('./Timesheets/TimeSheetList').then(module => ({ default: module.TimeSheetList })));
// const APIs = lazy(() => import('./APIs'));

const Dashboard = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingScreen message="Loading..." />}>
        <Routes>
          <Route index element={<Navigate to="/timesheets" replace />} />
          {/* <Route path="apis" element={<APIs />} /> */}
          <Route path="timesheets" element={<TimeSheetList />} />
          <Route path="*" element={<Navigate to="/timesheets" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default Dashboard;
