import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Obtener conteo por pagos (corregido)
    const { data: totalPagos, error } = await supabase
      .from('users')
      .select('monto_pago')
      .gt('monto_pago', 0);
    
    const totalRecaudado = totalPagos?.reduce((acc, pago) => acc + pago.monto_pago, 0) || 0;
    const entradaPromedio = totalRecaudado / (totalPagos?.length || 1);
    if (error) {
      console.error('Error al obtener el total de pagos:', error);
    }

    return NextResponse.json({
      totalPagos: totalPagos?.length || 0,
      totalRecaudado,
      entradaPromedio,
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
} 