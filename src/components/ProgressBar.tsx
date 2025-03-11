// components/ProgressBar.tsx
export default function ProgressBar({ percentage }: { percentage: number }) {
    return (
      <div className="progress-bar-wrapper">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="progress-bar-text">{percentage.toFixed(2)}%</div>
      </div>
    );
  }
  