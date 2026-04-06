import { useAuth } from '../context/AuthContext';

const TransactionTable = ({ transactions }) => {
  const { user } = useAuth();
  
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
  
  const getDescription = (transaction) => {
    if (transaction.transaction_type === 'share') {
      return isReceiver(transaction)
        ? `Received from ${transaction.from_user_id?.email || 'Unknown'}`
        : `Shared to ${transaction.to_user_id?.email || 'Unknown'}`;
    }
    return transaction.message || 'N/A';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="transactions-section">
      <h2>Recent Transactions</h2>
      {transactions && transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Balance</th>
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
                <td>{getDescription(transaction)}</td>
                <td>
                  {transaction.transaction_type === 'measure' 
                    ? `-${transaction.credit_amount} kg CO₂`
                    : `${transaction.credit_amount} credits`}
                </td>
                <td>{transaction.balance_after != null ? Number(transaction.balance_after).toFixed(1) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions yet</p>
      )}
    </div>
  );
};

export default TransactionTable;
