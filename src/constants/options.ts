/**
 * Opciones para los selectores de género
 */
export const OPCIONES_GENERO = [
  { value: 'Hombre', label: 'Masculino' },
  { value: 'Mujer', label: 'Femenino' },
];

export const STATUS_PAID_COMPLETED = 'ya_pago';
export const STATUS_WAITING_PAYMENT = 'esperando_pago';
/**
 * Opciones para los selectores de estado
 */
export const OPCIONES_STATUS = [
  { value: STATUS_WAITING_PAYMENT, label: 'Esperando Pago', color: 'warning', label2: 'Pago pendiente', icon: 'credit-card' },
  { value: STATUS_PAID_COMPLETED, label: 'Ya Pago', color: 'success', label2: 'Pago realizado', icon: 'check-circle' },
];

/**
 * Opciones para los selectores de rol
 */
export const OPCIONES_ROL = [
  { value: 0, label: 'Administrador' },
  { value: 1, label: 'Gerente' },
  { value: 2, label: 'Supervisor' },
  { value: 3, label: 'Usuario Avanzado' },
  { value: 4, label: 'Usuario Estándar' }
];

/**
 * Función para obtener el nombre de un rol según su valor
 */
export const getRoleName = (role?: number): string => {
  if (role === undefined) return 'Sin rol';
  
  const rolEncontrado = OPCIONES_ROL.find(opcion => opcion.value === role);
  return rolEncontrado ? rolEncontrado.label : `Rol ${role}`;
};

/**
 * Función para obtener el color de un grupo
 */
export const getGrupoColor = (grupo: string): string => {
  switch (grupo) {
    case 'Administración': return 'blue';
    case 'Ventas': return 'green';
    case 'Marketing': return 'purple';
    case 'Desarrollo': return 'cyan';
    case 'Soporte': return 'orange';
    case 'Recursos Humanos': return 'pink';
    default: return 'default';
  }
};
