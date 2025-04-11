import { useSession } from 'next-auth/react';

export const useRoleCheck = () => {
  const { data: session } = useSession();
  const { isAdmin, roleComplete } = session?.user || { isAdmin: false, roleComplete: 0 };

  return { isAdmin, roleComplete, roleName: roleComplete?.name };
};