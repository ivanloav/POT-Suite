import React from "react";
import "./StatusCard.css";

interface StatusCardProps {
  title: string;
  count: number;
  color: string;
  footerLabel: string;
  onClick?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, count, color, footerLabel, onClick }) => {
  return (
    <div className="status-card" 
        style={{ backgroundColor: color }}
        onClick={onClick}>
        <div className="status-card-main">
            <div className="status-info">
            <span className="status-count">{count}</span>
            <span className="status-title">{title}</span>
            </div>
        </div>
        <div className="status-card-footer">
            <span className="status-footer-label">{footerLabel}</span>
        </div>
    </div>
  );
};