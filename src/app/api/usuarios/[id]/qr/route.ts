import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

type tParams = Promise<{
  id: string;
}>;

// Función para generar el token QR
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { id } = await params;
    
    // Buscar el usuario para obtener su fecha de creación
    const { data: usuario, error } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // Obtener el secret de NextAuth
    const JWT_SECRET = process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('NEXTAUTH_SECRET no está configurado');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }
    
    // Crear el payload del token QR
    const qrPayload = {
      id: usuario.id,
      createdAt: usuario.created_at,
      timestamp: new Date().toISOString() // Añadir timestamp para invalidar QRs antiguos
    };
    
    // Firmar el token con JWT usando NEXTAUTH_SECRET
    const qrToken = jwt.sign(qrPayload, JWT_SECRET, { expiresIn: '7d' });
    
    // Devolver el token QR
    return NextResponse.json({ qrToken });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para validar QR
export async function POST(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { qrToken } = await request.json();
    
    if (!qrToken) {
      return NextResponse.json({ error: 'Token QR no proporcionado' }, { status: 400 });
    }
    
    // Obtener el secret de NextAuth
    const JWT_SECRET = process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('NEXTAUTH_SECRET no está configurado');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }
    
    try {
      // Verificar y decodificar el token
      const decodedToken = jwt.verify(qrToken, JWT_SECRET) as jwt.JwtPayload & {
        id: string;
        createdAt: string;
        timestamp: string;
      };
      
      // Verificar que el ID en el token coincide con el ID en la URL
      const { id } = await params;
      if (decodedToken.id !== id) {
        return NextResponse.json({ 
          valid: false, 
          error: 'El token QR no pertenece a este usuario' 
        }, { status: 400 });
      }
      
      // Buscar el usuario para confirmar que existe y verificar su fecha de creación
      const { data: usuario, error } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error al obtener usuario:', error);
        return NextResponse.json({ 
          valid: false, 
          error: 'Usuario no encontrado' 
        }, { status: 404 });
      }
      
      // Verificar que la fecha de creación en el token coincide con la del usuario
      if (new Date(decodedToken.createdAt).toISOString() !== new Date(usuario.created_at).toISOString()) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Información de QR no válida' 
        }, { status: 400 });
      }
      
      // Si todo está bien, el QR es válido
      return NextResponse.json({ 
        valid: true,
        usuario: {
          id: usuario.id,
          created_at: usuario.created_at
        }
      });
      
    } catch (jwtError) {
      console.error('Error al verificar token JWT:', jwtError);
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