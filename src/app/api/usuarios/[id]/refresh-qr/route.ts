import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type tParams = Promise<{
  id: string;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ qr_scanned_at: null })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data); 
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al refrescar el QR' }, { status: 500 });
  }
}