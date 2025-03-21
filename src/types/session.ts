export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
  };
} | null;