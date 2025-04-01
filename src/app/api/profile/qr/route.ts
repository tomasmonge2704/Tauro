import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getToken } from 'next-auth/jwt';

export async function GET(
  request: NextRequest,
) {
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
    
    // Buscar el usuario para obtener su fecha de creación
    const { data: usuario, error } = await supabase
      .from('users')
      .select('id, qr_scanned_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (usuario?.qr_scanned_at) {
      return NextResponse.json({ error: 'QR ya escaneado' }, { status: 400 });
    }
    // Devolver el token QR
    return NextResponse.json({qrToken: usuario.id});
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
