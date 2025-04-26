'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState, useEffect } from 'react';

export interface IPoint {
  x: number;
  y: number;
}
export interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface IDetectedBarcode {
  boundingBox: IBoundingBox;
  cornerPoints: IPoint[];
  format: string;
  rawValue: string;
}

interface VerificadorQRProps {
  setUserId: (userId: string) => void;
}

export default function VerificadorQR({ setUserId }: VerificadorQRProps) {
  const [result, setResult] = useState<IDetectedBarcode | null>(null);

  useEffect(() => {
    if (result?.rawValue) {
      console.log(result.rawValue);
      setUserId(result.rawValue);
    }
  }, [result]);
  return <Scanner allowMultiple={false} onScan={(result) => setResult(result[0])} />;
}
