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
    
    // Obtener conteo por género
    const { data, error } = await supabase
      .rpc('get_user_count_by_gender');
      
    if (error) {
      console.error('Error al obtener el conteo de usuarios por género:', error);
    }
    
    const generoStats = (data || []).reduce((acc: Record<string, number>, { genero, count }: { genero: string, count: number }) => {
      acc[genero] = count;
      return acc;
    }, {});
        
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