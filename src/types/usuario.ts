export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  role: string;
  edad: number;
  status: string;
  genero: string;
  grupo: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  monto_pago?: number;
  paid_at?: string;
  qr_scanned_at?: string;
}; 