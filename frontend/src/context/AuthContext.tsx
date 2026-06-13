import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import type { AuthResponse, User } from "../types";

type SignInPayload = {
  email: string;
  password: string;
};

type SignUpPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (payload: SignInPayload) => Promise<AuthResponse>;
  signUp: (payload: SignUpPayload) => Promise<AuthResponse>;
  updateProfile: (updates: Pick<User, "firstName" | "lastName" | "phone" | "avatar">) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "user";

function readStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => readStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const storedUser = readStoredUser();
    if (!storedUser?.token) {
      setIsBootstrapping(false);
      return;
    }

    api
      .get("/users/me")
      .then((response) => {
        const nextUser = {
          ...storedUser,
          ...response.data,
          token: storedUser.token,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsBootstrapping(false));
  }, []);

  const persistUser = (nextUser: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signIn = async (payload: SignInPayload) => {
    const response = await api.post<AuthResponse>("/users/signin", payload);
    persistUser(response.data);
    return response.data;
  };

  const signUp = async (payload: SignUpPayload) => {
    const response = await api.post<AuthResponse>("/users/signup", payload);
    persistUser(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Pick<User, "firstName" | "lastName" | "phone" | "avatar">) => {
    const response = await api.put<Omit<AuthResponse, "token">>("/users/me", updates);
    const nextUser = {
      ...user,
      ...response.data,
      token: user?.token ?? "",
    } as AuthResponse;
    persistUser(nextUser);
    return nextUser;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      isBootstrapping,
      signIn,
      signUp,
      updateProfile,
      logout,
    }),
    [user, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
