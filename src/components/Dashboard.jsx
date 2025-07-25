import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import APIs from './APIs';
import { TimeSheetList } from './Timesheets/TimeSheetList';

const Dashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/timesheets" replace />} />
        {/* <Route path="apis" element={<APIs />} /> */}
        <Route path="timesheets" element={<TimeSheetList />} />
        <Route path="*" element={<Navigate to="/timesheets" replace />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
