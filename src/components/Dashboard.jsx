import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './Layout';
import UserDashboard from './UserDashboard';
import Settings from './Settings';

const Dashboard = () => {
  const location = useLocation();

  // Debug logging
  console.log('Dashboard - Current location:', location.pathname);

  return (
    <Layout>
      <Routes>
        <Route index element={<UserDashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
