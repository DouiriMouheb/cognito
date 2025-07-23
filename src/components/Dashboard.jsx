import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import UserDashboard from './UserDashboard';
import Settings from './Settings';
import Timesheet from './Timesheet';

const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<UserDashboard />} />
        <Route path="timesheet" element={<Timesheet />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
