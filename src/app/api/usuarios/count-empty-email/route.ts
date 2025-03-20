import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Consulta para contar usuarios con email vacío
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .or('email.is.null,email.eq.');
    
    if (error) {
      console.error('Error al contar usuarios con email vacío:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 