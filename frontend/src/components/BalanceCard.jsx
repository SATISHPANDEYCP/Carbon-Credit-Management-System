const BalanceCard = ({ balance }) => {
  return (
    <div className="balance-card">
      <h2>Your Carbon Credit Balance</h2>
      <div className="balance-amount">{balance?.toLocaleString() || 0}</div>
      <div className="balance-unit">Credits Available</div>
    </div>
  );
};

export default BalanceCard;
