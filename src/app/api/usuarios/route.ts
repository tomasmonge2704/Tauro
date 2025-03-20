import { NextResponse } from 'next/server';
import type { Usuario } from '@/types/usuario';

// Datos de ejemplo - En producción, esto vendría de una base de datos
const usuarios: Usuario[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'Administrador', edad: 30, status: 'Activo', genero: 'Masculino' },
  { id: 2, nombre: 'María López', email: 'maria@ejemplo.com', rol: 'Usuario', edad: 25, status: 'Inactivo', genero: 'Femenino' },
  { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos@ejemplo.com', rol: 'Editor', edad: 28, status: 'Activo', genero: 'Masculino' },
  { id: 4, nombre: 'Ana Martínez', email: 'ana@ejemplo.com', rol: 'Usuario', edad: 22, status: 'Activo', genero: 'Femenino' },
];

export async function GET() {
  // Aquí iría la lógica para obtener usuarios de la base de datos
  // Por ejemplo:
  // const usuarios = await prisma.usuario.findMany();
  
  return NextResponse.json(usuarios);
}

export async function POST(request: Request) {
  const nuevoUsuario = await request.json();
  
  // Aquí iría la lógica para crear un usuario en la base de datos
  // Por ejemplo:
  // const usuario = await prisma.usuario.create({ data: nuevoUsuario });
  
  // Simulamos la creación asignando un ID
  const usuario = { ...nuevoUsuario, id: usuarios.length + 1 };
  usuarios.push(usuario);
  
  return NextResponse.json(usuario, { status: 201 });
} 