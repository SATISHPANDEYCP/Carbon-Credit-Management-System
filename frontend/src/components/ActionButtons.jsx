const ActionButtons = ({ onMeasure, onReduce, onOffset, onShare }) => {
  return (
    <div className="actions-section">
      <h2>Quick Actions</h2>
      <div className="action-buttons">
        <div className="action-btn" onClick={onMeasure}>
          <div className="action-icon">📊</div>
          <h3>Measure</h3>
          <p>Track your carbon emissions</p>
        </div>
        <div className="action-btn" onClick={onReduce}>
          <div className="action-icon">🌿</div>
          <h3>Reduce</h3>
          <p>Log reduction activities</p>
        </div>
        <div className="action-btn" onClick={onOffset}>
          <div className="action-icon">💚</div>
          <h3>Offset</h3>
          <p>Purchase carbon credits</p>
        </div>
        <div className="action-btn" onClick={onShare}>
          <div className="action-icon">🤝</div>
          <h3>Share</h3>
          <p>Transfer credits to others</p>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
