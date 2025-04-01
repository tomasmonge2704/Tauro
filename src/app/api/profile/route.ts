import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Obtener el token del usuario autenticado
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Verificar que el usuario esté autenticado
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = token.id as string;
    
    // Obtener los datos del usuario desde la base de datos
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error al obtener perfil del usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    // Devolver los datos del usuario
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 