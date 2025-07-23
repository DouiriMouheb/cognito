import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import UserDashboard from './UserDashboard';
import Settings from './Settings';
import APIs from './APIs';
import { TimeSheetList } from './Timesheets/TimeSheetList';

const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<UserDashboard />} />
        <Route path="apis" element={<APIs />} />
        <Route path="timesheets" element={<TimeSheetList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
