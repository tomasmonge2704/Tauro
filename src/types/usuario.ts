export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: number;
  edad: number;
  status: string;
  genero: string;
  grupo: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  monto_pago?: number;
  fecha_pago?: string;
  qr_scanned_at?: string;
  pago_completado?: boolean;
}; 