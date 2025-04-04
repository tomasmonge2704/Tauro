import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { qrToken } = await request.json();
    
    if (!qrToken) {
      return NextResponse.json({ error: 'Token QR no proporcionado' }, { status: 400 });
    }
    
    try {      
      // Buscar el usuario para confirmar que existe y verificar su fecha de creación
      const { data, error } = await supabase
        .from('users')
        .select('id, qr_scanned_at')
        .eq('id', qrToken)
        .single();
      
      if (data?.qr_scanned_at) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Ya ha sido escaneado' 
        }, { status: 400 });
      }
      
      if (error) {
        console.error('Error al obtener usuario:', error);
        return NextResponse.json({ 
          valid: false, 
          error: 'Usuario no encontrado' 
        }, { status: 404 });
      }
      
      // Actualizar el usuario para indicar que el QR ha sido escaneado
      const { data: user, error: updateError } = await supabase
        .from('users')
        .update({ qr_scanned_at: new Date().toISOString() })
        .eq('id', qrToken)
        .select('id, nombre')
        .single();
      
      if (updateError) {
        console.error('Error al actualizar usuario:', updateError);
        return NextResponse.json({ 
          valid: false, 
          error: 'Error al actualizar usuario' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        valid: true,
        user: user
      });
      
    } catch (error) {
      console.error('Error al verificar token QR:', error);
      return NextResponse.json({ 
        valid: false, 
        error: 'Token QR inválido o expirado' 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 