import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const searchTerm = searchParams.get('search') || '';
    const genero = searchParams.get('genero') || '';
    const status = searchParams.get('status') || '';
    const grupo = searchParams.get('grupo') || '';
    const montoMin = searchParams.get('montoMin') ? parseInt(searchParams.get('montoMin') || '0') : null;
    const montoMax = searchParams.get('montoMax') ? parseInt(searchParams.get('montoMax') || '100000') : null;
    
    // Calcular el rango para Supabase
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Construir la consulta base
    let query = supabase.from('users').select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (searchTerm) {
      query = query.ilike('nombre', `%${searchTerm}%`);
    }
    
    if (genero) {
      query = query.eq('genero', genero);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (grupo) {
      query = query.eq('grupo', grupo);
    }
    
    if (montoMin !== null) {
      query = query.gte('monto_pago', montoMin);
    }
    
    if (montoMax !== null) {
      query = query.lte('monto_pago', montoMax);
    }
    
    // Obtener el total de registros para calcular el total de páginas
    const { count, error: countError } = await query
        // @ts-expect-error Supabase permite este uso aunque TypeScript no lo reconozca
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error al obtener el conteo de usuarios:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    
    // Reiniciar la consulta para obtener los datos
    query = supabase.from('users').select('*');
    
    // Aplicar los mismos filtros nuevamente
    if (searchTerm) {
      query = query.ilike('nombre', `%${searchTerm}%`);
    }
    
    if (genero) {
      query = query.eq('genero', genero);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (grupo) {
      query = query.eq('grupo', grupo);
    }
    
    if (montoMin !== null) {
      query = query.gte('monto_pago', montoMin);
    }
    
    if (montoMax !== null) {
      query = query.lte('monto_pago', montoMax);
    }
    
    // Obtener los datos paginados
    // @ts-xpect-error Supabase permite este uso aunque TypeScript no lo reconozca
    const { data, error } = await query
      .order('nombre', { ascending: true })
      .range(from, to);
    
    if (error) {
      console.error('Error al obtener usuarios:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Devolver datos con metadatos de paginación
    return NextResponse.json({
      data,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const nuevoUsuario = await request.json();
    
    const { data, error } = await supabase
      .from('users')
      .insert([nuevoUsuario])
      .select();
    
    if (error) {
      console.error('Error al crear usuario:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 