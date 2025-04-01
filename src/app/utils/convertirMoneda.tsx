export const convertirMoneda = (monto: number, currency: string = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
  }).format(monto);
};
