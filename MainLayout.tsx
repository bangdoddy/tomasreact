import { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import UserManagement from './UserManagement';
import ToolsManagement from './ToolsManagement';
import Dashboard from './Dashboard';
import DashboardFacility from './DashboardFacility';
import RolesManagement from './RolesManagement';
import PermissionsManagement from './PermissionsManagement';
import CategoryTool from './CategoryTool';
import ConditionTool from './ConditionTool';
import GroupTools from './GroupTools';
import Jobsite from './Jobsite';
import Location from './Location';
import BinLocation from './BinLocation';
import WorkGroup from './WorkGroup';
import UOM from './UOM';
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
import FacilityPopulationReport from './reports/FacilityPopulationReport';
import FacilityInspectionReport from './reports/FacilityInspectionReport';
import FacilityInspection from './inspection/FacilityInspection';
import FacilityPopulation from './dashboards/FacilityPopulation';
import AcvInspectionWorkshop from './dashboards/AcvInspectionWorkshop';
import AcvInspectionPitStop from './dashboards/AcvInspectionPitStop';
import AcvInspectionWashingBays from './dashboards/AcvInspectionWashingBays';
import AcvCertificationCalibration from './dashboards/AcvCertificationCalibration';
import UserGuide from './help/UserGuide';
import FAQ from './help/FAQ';
import VideoTutorial from './help/VideoTutorial';
import ContactUs from './help/ContactUs';
import TipsTricks from './help/TipsTricks';
import About from './About';
import { Toaster } from './ui/sonner';
import { AuthUsers } from '../service/AuthContext';

interface MainLayoutProps {
  currentUser: AuthUsers;
  onLogout: () => void;
}

export default function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top whenever page changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard-facility':
        return <DashboardFacility />;
      case 'user-management':
        return <UserManagement />;
      case 'roles':
        return <RolesManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'tools-management':
        return <ToolsManagement />;
      case 'category-tool':
        return <CategoryTool />;
      case 'condition-tool':
        return <ConditionTool />;
      case 'group-tools':
        return <GroupTools />;
      case 'jobsite':
        return <Jobsite />;
      case 'location':
        return <Location />;
      case 'bin-location':
        return <BinLocation />;
      case 'work-group':
        return <WorkGroup />;
      case 'uom':
        return <UOM />;
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
      case 'follow-up':
        return <FollowUp />;
      case 'reactivation-disposed':
        return <ReactivationDisposedTools />;
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
      case 'toolroom-inspection':
        return <ToolRoomInspection />;
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
      case 'toolroom-inspection-report':
        return <ToolRoomInspectionReport />;
      case 'toolbox-inspection-report':
        return <ToolBoxInspectionReport />;
      case 'certification-calibration-report':
        return <CertificationCalibrationReport />;
      case 'tool-order-monitoring-report':
        return <ToolOrderMonitoringReport />;
      case 'facility-population-report':
        return <FacilityPopulationReport />;
      case 'facility-inspection-report':
        return <FacilityInspectionReport />;
      case 'facility-inspection':
        return <FacilityInspection />;
      case 'facility-population':
        return <FacilityPopulation />;
      case 'acv-inspection-workshop':
        return <AcvInspectionWorkshop />;
      case 'acv-inspection-pit-stop':
        return <AcvInspectionPitStop />;
      case 'acv-inspection-washing-bays':
        return <AcvInspectionWashingBays />;
      case 'acv-certification-calibration':
        return <AcvCertificationCalibration />;
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
        
        <main className="flex-1 overflow-y-auto" ref={mainContentRef}>
          <div className="container mx-auto p-4 max-w-7xl">
            {renderPage()}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
