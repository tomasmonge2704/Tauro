import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.NEXTAUTH_SECRET || '';
const TOKEN_EXPIRY = '24h';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }
    // Buscar el usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) {
      console.error("Usuario no encontrado:", error);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Verificar si el usuario tiene contraseña
    if (!user.password) {
      console.error("Usuario sin contraseña");
      return NextResponse.json({ error: 'Cuenta de usuario incompleta' }, { status: 401 });
    }
    
    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.error("Contraseña incorrecta");
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }
    
    // Generar token JWT con los mismos campos que usa NextAuth
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: user.rol
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    delete user.password;
    
    return NextResponse.json({
      token,
      user
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 