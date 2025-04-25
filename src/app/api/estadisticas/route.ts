import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import moment from 'moment';

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

    // Obtener conteo por grupo
    const { data: grupoData, error: grupoError } = await supabase
      .rpc('get_user_count_by_grupo');
      
    if (grupoError) {
      console.error('Error al obtener el conteo de usuarios por grupo:', grupoError);
    }
    
    const grupoStats = grupoData || [];

    // Obtener fechas de creación de usuarios
    const { data: fechasCreacion, error: fechasError } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: true });
      
    if (fechasError) {
      console.error('Error al obtener las fechas de creación de usuarios:', fechasError);
    }
    
    // Formatear fechas y asignar IDs
    const creationDates = fechasCreacion?.map((fecha, index) => ({
      id: index,
      created_at: moment(fecha.created_at).format('YYYY-MM-DD HH:mm:ss')
    })) || [];

    // Log para depuración
    console.log(`Total de fechas de creación: ${creationDates.length}`);
    if (creationDates.length > 0) {
      console.log(`Primera fecha: ${creationDates[0].created_at}, Última fecha: ${creationDates[creationDates.length - 1].created_at}`);
    }

    const { data: edadPromedioData = [] } = await supabase
      .from('users')
      .select('edad')
      .order('edad', { ascending: true });

    const edadPromedio = edadPromedioData && edadPromedioData.length > 0 
      ? edadPromedioData.reduce((acc, user) => acc + user.edad, 0) / edadPromedioData.length 
      : 0;
    
    return NextResponse.json({
      totalUsuarios: totalUsuarios[0]?.count || 0,
      generoStats,
      grupoStats,
      creationDates,
      edadPromedio: edadPromedio.toFixed(0)
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
} 