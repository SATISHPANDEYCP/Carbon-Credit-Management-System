const StatsGrid = ({ stats }) => {
  const formatNumber = (num) => {
    if (num == null) return '0.0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Emissions</h3>
        <div className="stat-value">{formatNumber(stats?.total_emissions)} kg</div>
      </div>
      <div className="stat-card">
        <h3>Total Reductions</h3>
        <div className="stat-value">{formatNumber(stats?.total_reductions)} kg</div>
      </div>
      <div className="stat-card">
        <h3>Credits Purchased</h3>
        <div className="stat-value">{formatNumber(stats?.total_offsets)}</div>
      </div>
      <div className="stat-card">
        <h3>Credits Shared</h3>
        <div className="stat-value">{formatNumber(stats?.total_shared)}</div>
      </div>
    </div>
  );
};

export default StatsGrid;
