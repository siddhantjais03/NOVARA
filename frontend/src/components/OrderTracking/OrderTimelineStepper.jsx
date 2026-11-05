import React from 'react';
import { CheckCircle2, Clock, Truck, Home, AlertCircle } from 'lucide-react';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import './OrderTimelineStepper.css';

export const OrderTimelineStepper = ({ order }) => {
  if (!order) return null;

  const status = order.orderStatus || 'Confirmed';
  const isCancelled = status === 'Cancelled';

  // 4 Core Stages: Confirmed -> Processing -> Shipped -> Delivered
  const stages = [
    {
      key: 'Confirmed',
      label: 'Order Confirmed',
      icon: CheckCircle2,
      description: 'Reservation accepted & registered in ledger'
    },
    {
      key: 'Processing',
      label: 'Atelier Processing',
      icon: Clock,
      description: 'Quality inspection & artisan packaging at BKC'
    },
    {
      key: 'Shipped',
      label: 'Shipped & In Transit',
      icon: Truck,
      description: 'Handed to premium courier dispatch'
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      icon: Home,
      description: 'Received at customer destination'
    }
  ];

  const getStageIndex = (st) => {
    switch (st) {
      case 'Confirmed':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(status);

  // Genuine Recorded Timestamps only — STRICTLY NO FABRICATED DATES
  const getStageTimestamp = (stageKey) => {
    if (stageKey === 'Confirmed' && order.createdAt) {
      return formatOrderDateTimeIST(order.createdAt);
    }
    if (stageKey === 'Delivered' && status === 'Delivered') {
      if (order.deliveredAt) return formatOrderDateTimeIST(order.deliveredAt);
      if (order.updatedAt) return formatOrderDateTimeIST(order.updatedAt);
    }
    return null;
  };

  if (isCancelled) {
    return (
      <div className="order-cancelled-banner">
        <AlertCircle size={22} className="cancelled-icon" />
        <div>
          <strong>Order Cancelled</strong>
          <p>This reservation has been voided. Any captured funds are automatically refunded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-stepper-root">
      <div className="stepper-header-row">
        <div>
          <span className="stepper-kicker">Live Order Trajectory</span>
          <h4 className="stepper-title">Fulfillment Progress</h4>
        </div>
        <span className="stepper-current-pill">
          Current Status: <strong>{status}</strong>
        </span>
      </div>

      <div className="stepper-track-wrap">
        <div className="stepper-track-line">
          <div
            className="stepper-track-fill"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        <div className="stepper-stages-grid">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;
            const Icon = stage.icon;
            const recordedTimestamp = getStageTimestamp(stage.key);

            let nodeStateClass = 'upcoming';
            if (isCompleted) nodeStateClass = 'completed';
            if (isCurrent) nodeStateClass = 'current';

            return (
              <div key={stage.key} className={`stepper-node ${nodeStateClass}`}>
                <div className="stepper-icon-disc">
                  <Icon size={18} />
                </div>
                <div className="stepper-node-content">
                  <span className="stepper-node-label">{stage.label}</span>
                  <p className="stepper-node-desc">{stage.description}</p>
                  {recordedTimestamp ? (
                    <span className="stepper-node-time" title="Genuine recorded timestamp in IST">
                      {recordedTimestamp}
                    </span>
                  ) : (
                    <span className="stepper-node-pending">
                      {isUpcoming ? 'Awaiting milestone' : 'Status confirmed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

