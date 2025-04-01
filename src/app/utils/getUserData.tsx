import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export const getUserData = async (req: NextRequest) => {
  return await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
};

export const getUserRole = async (req: NextRequest) => {
  const user = await getUserData(req);
  return user?.rol as number;
};

