import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

import {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types/auth.types";

import { authService } from "../services/authService";
interface AuthContextType {
  state: AuthState;
  login: (crdentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" };

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  if (action.type === "AUTH_LOADING") {
    return { ...state, isLoading: true, error: null };
  }
  if (action.type === "AUTH_SUCCESS") {
    return {
      ...state,
      isLoading: false,
      isAuthenticated: true,
      user: action.payload.user,
      token: action.payload.token,
      error: null,
    };
  }
  if (action.type === "AUTH_ERROR") {
    return {
      ...state,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      error: action.payload,
    };
  }
  if (action.type === "AUTH_LOGOUT") {
    return {
      ...state,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
    };
  }
  return state;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authService.checkAuth();
        if (result) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: result.user, token: result.token },
          });
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        dispatch({
          type: "AUTH_ERROR",
          payload: "Failed to authenticate",
        });
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: "AUTH_LOADING" });

    try {
      const result = await authService.login(credentials);

      if (result) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: result.user, token: result.token },
        });
        return true;
      } else {
        dispatch({
          type: "AUTH_ERROR",
          payload: "Invalid credentials",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch({
        type: "AUTH_ERROR",
        payload: "An error occurred during login",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
        return await authService.register(userData);
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            error: 'An error occurred during registration'
        }
    }
  };

  const logout = async (): Promise<void> => {
    try {
        await authService.logout();
        dispatch({ type: "AUTH_LOGOUT"});
    } catch (error) {
        console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
