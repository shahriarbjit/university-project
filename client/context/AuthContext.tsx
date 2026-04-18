import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => boolean;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users database
const DUMMY_USERS: User[] = [
  {
    id: "1",
    email: "student1@university.edu",
    fullName: "John Smith",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    email: "student2@university.edu",
    fullName: "Sarah Johnson",
    createdAt: "2024-01-16",
  },
  {
    id: "3",
    email: "student3@university.edu",
    fullName: "Michael Brown",
    createdAt: "2024-01-17",
  },
  {
    id: "4",
    email: "student4@university.edu",
    fullName: "Emily Davis",
    createdAt: "2024-01-18",
  },
  {
    id: "5",
    email: "student5@university.edu",
    fullName: "David Wilson",
    createdAt: "2024-01-19",
  },
];

// Dummy credentials for login demo
const DUMMY_CREDENTIALS = {
  email: "safal@northsouth.edu",
  password: "demo123",
  fullName: "Safal Khan",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);

  const login = (email: string, password: string): boolean => {
    // Check against dummy credentials
    if (
      email === DUMMY_CREDENTIALS.email &&
      password === DUMMY_CREDENTIALS.password
    ) {
      const user: User = {
        id: "demo",
        email: DUMMY_CREDENTIALS.email,
        fullName: DUMMY_CREDENTIALS.fullName,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const register = (email: string, password: string, fullName: string): boolean => {
    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return false;
    }

    if (!email || !password || !fullName || password.length < 6) {
      return false;
    }

    const newUser: User = {
      id: String(users.length + 1),
      email,
      fullName,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        register,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
