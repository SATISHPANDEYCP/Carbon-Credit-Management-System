import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactionHistory } from '../api/carbonApi';
import Header from '../components/Header';
import '../styles/dashboard.css';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (page = 1) => {
    try {
      const data = await getTransactionHistory(page, 50);
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setLoading(false);
    }
  };

  const isReceiver = (transaction) => {
    return transaction.transaction_type === 'share' && 
           transaction.to_user_id?._id === user?.id;
  };

  const getBadgeClass = (transaction) => {
    if (transaction.transaction_type === 'share') {
      return isReceiver(transaction) ? 'badge badge-received' : 'badge badge-share';
    }
    return `badge badge-${transaction.transaction_type}`;
  };
  
  const getTransactionType = (transaction) => {
    if (transaction.transaction_type === 'share') {
      return isReceiver(transaction) ? 'Received' : 'Shared';
    }
    return transaction.transaction_type.charAt(0).toUpperCase() + 
           transaction.transaction_type.slice(1);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="page-title">Transaction History</h1>
        
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="transactions-section">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{formatDate(transaction.created_at)}</td>
                    <td>
                      <span className={getBadgeClass(transaction)}>
                        {getTransactionType(transaction)}
                      </span>
                    </td>
                    <td>{transaction.from_user_id?.name || 'System'}</td>
                    <td>{transaction.to_user_id?.name || 'System'}</td>
                    <td>{transaction.credit_amount}</td>
                    <td>{transaction.balance_after != null ? Number(transaction.balance_after).toFixed(1) : '-'}</td>
                    <td>{transaction.message || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button 
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
