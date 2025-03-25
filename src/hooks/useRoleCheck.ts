import { useSession } from 'next-auth/react';

export const useRoleCheck = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === 0;
  return { isAdmin };
};