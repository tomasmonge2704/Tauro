import React from 'react';
import { OPCIONES_STATUS } from '../constants/options';
import { Steps } from 'antd'; // Asumiendo que usas Ant Design
import { CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface StatusStepperProps {
  currentStatus: string;
}

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  // Encuentra el índice del estado actual
  const currentIndex = OPCIONES_STATUS.findIndex(option => option.value === currentStatus);

  return (
    <div style={{ width: '100%', margin: '20px 0' }}>
      <Steps
        current={currentIndex}
        items={OPCIONES_STATUS.map(option => ({
          title: option.label2,
          icon: option.icon === 'credit-card' ? <CreditCardOutlined /> : <CheckCircleOutlined />,
          status: option.value === currentStatus ? 'process' : 
                 OPCIONES_STATUS.findIndex(opt => opt.value === option.value) < currentIndex ? 'finish' : 'wait',
        }))}
      />
    </div>
  );
};

export default StatusStepper;