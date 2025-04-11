import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Role } from '@/types/role';

export const getUserData = async (req: NextRequest) => {
  return await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
};

export const getRole = async (id: string) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single();
    if (error) {
      throw new Error("Error al verificar el rol del usuario:", error);
    }
    return data as Role;
}

