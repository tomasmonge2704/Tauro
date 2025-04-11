import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/app/utils/getUserData';
import { STATUS_PAID_COMPLETED } from '@/constants/options';

type tParams = Promise<{
  id: string;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { id } = await params;
    const updated_at = new Date().toISOString();
    const datosActualizados = await request.json();
    
    // Obtener los datos del usuario que está haciendo la petición
    const user = await getUserData(request);
    const updated_by = user?.nombre;

    if (datosActualizados.status === STATUS_PAID_COMPLETED && !datosActualizados.paid_at) {
      datosActualizados.paid_at = new Date().toISOString();
    }
    
    // Actualizar el usuario incluyendo quien hizo la actualización
    const { data, error } = await supabase
      .from('users')
      .update({ ...datosActualizados, updated_at, updated_by })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Verificar si se actualizó alguna fila
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No se pudo actualizar el usuario' }, { status: 404 });
    }
    
    console.log('Usuario actualizado:', data[0]);
    
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error al eliminar usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Devolver el usuario eliminado
    return NextResponse.json({ id, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 