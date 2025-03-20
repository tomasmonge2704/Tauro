import { NextResponse } from 'next/server';
import type { Usuario } from '@/types/usuario';

// Datos de ejemplo - En producción, esto vendría de una base de datos
let usuarios: Usuario[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'Administrador', edad: 30, status: 'Activo', genero: 'Masculino' },
  { id: 2, nombre: 'María López', email: 'maria@ejemplo.com', rol: 'Usuario', edad: 25, status: 'Inactivo', genero: 'Femenino' },
  { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos@ejemplo.com', rol: 'Editor', edad: 28, status: 'Activo', genero: 'Masculino' },
  { id: 4, nombre: 'Ana Martínez', email: 'ana@ejemplo.com', rol: 'Usuario', edad: 22, status: 'Activo', genero: 'Femenino' },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  // Aquí iría la lógica para obtener un usuario específico de la base de datos
  // Por ejemplo:
  // const usuario = await prisma.usuario.findUnique({ where: { id } });
  
  const usuario = usuarios.find(u => u.id === id);
  
  if (!usuario) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  
  return NextResponse.json(usuario);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const datosActualizados = await request.json();
  
  // Aquí iría la lógica para actualizar un usuario en la base de datos
  // Por ejemplo:
  // const usuario = await prisma.usuario.update({ 
  //   where: { id }, 
  //   data: datosActualizados 
  // });
  
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  
  usuarios[index] = { ...usuarios[index], ...datosActualizados };
  
  return NextResponse.json(usuarios[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  // Aquí iría la lógica para eliminar un usuario de la base de datos
  // Por ejemplo:
  // await prisma.usuario.delete({ where: { id } });
  
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  
  const usuarioEliminado = usuarios[index];
  usuarios = usuarios.filter(u => u.id !== id);
  
  return NextResponse.json(usuarioEliminado);
} 