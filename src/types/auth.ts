export interface User {
    id: string;
    email?: string;
    username?: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
  }