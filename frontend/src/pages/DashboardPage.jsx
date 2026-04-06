import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/carbonApi';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import StatsGrid from '../components/StatsGrid';
import ActionButtons from '../components/ActionButtons';
import TransactionTable from '../components/TransactionTable';
import MeasureModal from '../components/MeasureModal';
import ReduceModal from '../components/ReduceModal';
import OffsetModal from '../components/OffsetModal';
import ShareModal from '../components/ShareModal';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, updateUserBalance } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [measureModalOpen, setMeasureModalOpen] = useState(false);
  const [reduceModalOpen, setReduceModalOpen] = useState(false);
  const [offsetModalOpen, setOffsetModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getDashboardSummary();
      setDashboardData(data);
      updateUserBalance(data.current_balance);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    // Refresh dashboard data after modal closes
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <BalanceCard balance={dashboardData?.current_balance} />
        <StatsGrid stats={dashboardData} />
        <ActionButtons 
          onMeasure={() => setMeasureModalOpen(true)}
          onReduce={() => setReduceModalOpen(true)}
          onOffset={() => setOffsetModalOpen(true)}
          onShare={() => setShareModalOpen(true)}
        />
        <TransactionTable transactions={dashboardData?.recent_activities} />
      </div>

      {/* Modals */}
      <MeasureModal 
        isOpen={measureModalOpen} 
        onClose={() => {
          setMeasureModalOpen(false);
          handleModalClose();
        }} 
      />
      <ReduceModal 
        isOpen={reduceModalOpen} 
        onClose={() => {
          setReduceModalOpen(false);
          handleModalClose();
        }} 
      />
      <OffsetModal 
        isOpen={offsetModalOpen} 
        onClose={() => {
          setOffsetModalOpen(false);
          handleModalClose();
        }} 
      />
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => {
          setShareModalOpen(false);
          handleModalClose();
        }} 
      />
    </div>
  );
};

export default DashboardPage;
