import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import ProjectAdminDashboard from './ProjectAdminDashboard';
import SalesUserDashboard from './SalesUserDashboard';
import ViewerDashboard from './ViewerDashboard';
import CustomerDashboard from './CustomerDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'project-admin':
      return <ProjectAdminDashboard />;
    case 'sales-user':
      return <SalesUserDashboard />;
    case 'viewer':
      return <ViewerDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <div>Invalid role</div>;
  }
};

export default DashboardRouter;
