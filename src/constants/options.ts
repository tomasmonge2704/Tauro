/**
 * Opciones para los selectores de género
 */
export const OPCIONES_GENERO = [
  { value: 'Hombre', label: 'Masculino' },
  { value: 'Mujer', label: 'Femenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Prefiere no decir', label: 'Prefiere no decir' }
];

/**
 * Opciones para los selectores de estado
 */
export const OPCIONES_STATUS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
  { value: 'Pendiente', label: 'Pendiente' }
];

/**
 * Opciones para los selectores de grupo
 */
export const OPCIONES_GRUPO = [
  { value: 'Administración', label: 'Administración' },
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Desarrollo', label: 'Desarrollo' },
  { value: 'Soporte', label: 'Soporte' },
  { value: 'Recursos Humanos', label: 'Recursos Humanos' }
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

/**
 * Función para obtener el color de un estado
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Activo': return 'success';
    case 'Inactivo': return 'error';
    case 'Pendiente': return 'warning';
    default: return 'default';
  }
}; 