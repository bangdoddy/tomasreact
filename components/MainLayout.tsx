import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import UserManagement from './UserManagement';
import ToolsManagement from './ToolsManagement';
import Dashboard from './Dashboard';
import Location from './Location';
import RolesManagement from './RolesManagement';
import PermissionsManagement from './PermissionsManagement';
import StandardQuantity from './StandardQuantity';
import ToolActivation from './ToolActivation';
import BookingTools from './BookingTools';
import RentTools from './RentTools';
import ReturnTools from './ReturnTools';
import Capex from './Capex';
import Opex from './Opex';
import FormOrderBudget from './FormOrderBudget';
import OutstandingBAKT from './OutstandingBAKT';
import FollowUp from './FollowUp';
import ReactivationDisposedTools from './ReactivationDisposedTools';
import ActivationToolApproval from './approval/ActivationToolApproval';
import BAKTApproval from './approval/BAKTApproval';
import TRFApproval from './approval/TRFApproval';
import InspectionScheduling from './inspection/InspectionScheduling';
import ToolBoxInspection from './inspection/ToolBoxInspection';
import ToolRoomInspection from './inspection/ToolRoomInspection';
import ToolCertification from './inspection/ToolCertification';
import UserPopulation from './reports/UserPopulation';
import ToolPopulation from './reports/ToolPopulation';
import RentReturnReport from './reports/RentReturnReport';
import ActivationReport from './reports/ActivationReport';
import BAKTReport from './reports/BAKTReport';
import DisposedToolReport from './reports/DisposedToolReport';
import ToolRoomInspectionReport from './reports/ToolRoomInspectionReport';
import ToolBoxInspectionReport from './reports/ToolBoxInspectionReport';
import CertificationCalibrationReport from './reports/CertificationCalibrationReport';
import ToolOrderMonitoringReport from './reports/ToolOrderMonitoringReport';
import UserGuide from './help/UserGuide';
import FAQ from './help/FAQ';
import VideoTutorial from './help/VideoTutorial';
import ContactUs from './help/ContactUs';
import TipsTricks from './help/TipsTricks';
import About from './About';
import GeneralSetting from './GeneralSetting';
import ToolsType from './ToolsType';
import { Toaster } from './ui/sonner';
// import type { AuthUser } from '../App';
import { AuthUsers } from '../service/AuthContext';
import React from 'react';

interface MainLayoutProps {
  currentUser: AuthUsers;
  onLogout: () => void;
}

export default function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'user-management':
        return <UserManagement />;
      case 'roles':
        return <RolesManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'tools-management':
        return <ToolsManagement />;
      case 'standard-quantity':
        return <StandardQuantity />;
      case 'tool-activation':
        return <ToolActivation />;
      case 'booking-tools':
        return <BookingTools />;
      case 'rent-tools':
        return <RentTools />;
      case 'return-tools':
        return <ReturnTools />;
      case 'capex':
        return <Capex />;
      case 'opex':
        return <Opex />;
      case 'order-budget':
        return <FormOrderBudget />;
      case 'outstanding-bakt':
        return <OutstandingBAKT />;
      case 'reactivation-disposed':
        return <ReactivationDisposedTools />;
      case 'follow-up':
        return <FollowUp />;
      case 'activation-tool-approval':
        return <ActivationToolApproval />;
      case 'bakt-approval':
        return <BAKTApproval />;
      case 'trf-approval':
        return <TRFApproval />;
      case 'inspection-scheduling':
        return <InspectionScheduling />;
      case 'toolbox-inspection':
        return <ToolBoxInspection />;
      // case 'toolroom-inspection':
      //   return <ToolRoomInspection />;
      case 'tool-certification':
        return <ToolCertification />;
      case 'user-population':
        return <UserPopulation />;
      case 'tool-population':
        return <ToolPopulation />;
      case 'rent-return-report':
        return <RentReturnReport />;
      case 'activation-report':
        return <ActivationReport />;
      case 'bakt-report':
        return <BAKTReport />;
      case 'disposed-tool-report':
        return <DisposedToolReport />;
      // case 'toolroom-inspection-report':
      //   return <ToolRoomInspectionReport />;
      case 'toolbox-inspection-report':
        return <ToolBoxInspectionReport />;
      case 'certification-calibration-report':
        return <CertificationCalibrationReport />;
      case 'tool-order-monitoring-report':
        return <ToolOrderMonitoringReport />;
      case 'user-guide':
        return <UserGuide />;
      case 'faq':
        return <FAQ />;
      case 'video-tutorial':
        return <VideoTutorial />;
      case 'contact-us':
        return <ContactUs />;
      case 'tips-tricks':
        return <TipsTricks />;
      case 'about':
        return <About />;
      case 'setting':
        return <GeneralSetting />
      case 'jobsite':
        return <GeneralSetting kategori="Jobsite" />
      case 'location':
        return <Location />
      case 'toolstype':
        return <ToolsType />
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" richColors />

      <Header currentUser={currentUser} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {renderPage()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}