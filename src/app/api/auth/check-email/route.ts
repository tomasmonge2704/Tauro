import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRole } from '@/app/utils/getUserData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email no proporcionado' }, { status: 400 });
    }
    
    // Buscar el usuario por email
    const { data, error } = await supabase
      .from('users')
      .select('id, password, role')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 es el código cuando no se encuentra ningún registro
      console.error('Error al buscar usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Determinar si el usuario existe y si tiene contraseña
    const exists = !!data;
    const hasPassword = exists && !!data.password;
    const roleData = await getRole(data?.role);
    
    return NextResponse.json({
      exists,
      hasPassword,
      userId: exists ? data.id : undefined,
      requeredPassword: roleData?.requeredPassword || false,
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 