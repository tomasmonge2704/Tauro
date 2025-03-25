import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    
    // Obtener estadísticas generales
    const { data: totalUsuarios, error: errorTotal } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
    
    if (errorTotal) {
      throw new Error(`Error al obtener el total de usuarios: ${errorTotal.message}`);
    }
    
    // Mockear conteo por género
    const generoStats = [
      { genero: 'masculino', count: 100 },
      { genero: 'femenino', count: 120 }
    ];
    
    // Mockear conteo por estado
    const statusStats = [
      { status: 'active', count: 150 },
      { status: 'inactive', count: 50 }
    ];
    
    // Mockear conteo por grupo
    const grupoStats = [
      { grupo: 'grupo1', count: 80 },
      { grupo: 'grupo2', count: 90 }
    ];
    
    // Mockear edad promedio
    const edadPromedio = 30;
    
    return NextResponse.json({
      totalUsuarios: totalUsuarios[0]?.count || 0,
      generoStats,
      statusStats,
      grupoStats,
      edadPromedio
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
} 