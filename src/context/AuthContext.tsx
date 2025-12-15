import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { authService } from "../services/authService";
import { onboardingService } from "../services/onboardingService";
import {
  AuthResponse,
  AuthState,
  LoginCredentials,
  User,
  UserRole,
  UserUpdate,
  UserInfo,
  TokenResponse,
} from "../types/auth.types";
import { EnhancedSignupData, EnhancedSignupUser } from "../types/onboarding.types";

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: EnhancedSignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: UserUpdate) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "UPDATE_USER"; payload: UserUpdate };

const initialState: AuthState = {
  is_loading: true,
  is_authenticated: false,
  needs_onboarding: true,
  user: null, // This will be User type after conversion
  token: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, is_loading: true, error: null };
    
    case "AUTH_SUCCESS":
      return {
        ...state,
        is_loading: false,
        is_authenticated: true,
        user: action.payload.user as any,
        token: action.payload.token,
        error: null,
      };
    
    case "AUTH_ERROR":
      return {
        ...state,
        is_loading: false,
        is_authenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    
    case "AUTH_LOGOUT":
      return {
        ...state,
        is_loading: false,
        is_authenticated: false,
        user: null,
        token: null,
        error: null,
      };
    
    case "UPDATE_USER":
      if (state.user) {
        return {
          ...state,
          user: {
            ...state.user,
            ...action.payload
          } as any, 
        };
      }
      return state;
    
    default:
      return state;
  }
};

const convertUserInfoToUser = (userInfo: UserInfo): User => {
  return {
    id: userInfo.id,
    email: userInfo.email,
    first_name: userInfo.first_name,
    last_name: userInfo.last_name,
    role: userInfo.role,
    company_id: userInfo.company_id,
    instructor_id: userInfo.instructor_id || null,
    has_completed_onboarding: userInfo.has_completed_onboarding,
    is_active: userInfo.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const convertSignupUserToUser = (signupUser: EnhancedSignupUser): User => {
  return {
    id: signupUser.user_id,
    email: signupUser.email,
    first_name: signupUser.first_name,
    last_name: signupUser.last_name,
    role: signupUser.role,
    company_id: signupUser.company_id,
    instructor_id: signupUser.instructor_id || null,
    has_completed_onboarding: signupUser.has_completed_onboarding,
    is_active: signupUser.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const needsOnboarding = Boolean(
    state.user && state.user.company_id === null
  );

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!state.user || !state.user.role) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(state.user.role);
    }
    return state.user.role === requiredRole;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const result = await authService.checkAuth();
        
        if (result) {
          console.log("User is authenticated");
          const user = convertUserInfoToUser(result.user);
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, token: result.token },
          });
        } else {
          console.log("No valid authentication found");
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error(" Auth check error:", error);
        dispatch({
          type: "AUTH_ERROR",
          payload: "Failed to authenticate",
        });
      }
    };
    checkAuth();
  }, []); // Empty dependency array means "run once on mount"

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log("Starting login process for:", credentials.email);
      
      const loginResult = await authService.login(credentials);

      if (!loginResult.success || !loginResult.data) {
        console.log("Login failed:", loginResult.error);
        return false;
      }

      console.log("Login successful, fetching user profile...");

      dispatch({ type: "AUTH_LOADING" });
      
      const userResult = await authService.getCurrentUser(loginResult.data.access_token);

      if (!userResult.success || !userResult.data) {
        console.log("Failed to fetch user data:", userResult.error);
        dispatch({
          type: "AUTH_ERROR",
          payload: userResult.error || "Failed to fetch user data",
        });
        return false;
      }

      console.log("User profile fetched successfully");
      
      const user = convertUserInfoToUser(userResult.data);
      
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { 
          user, 
          token: loginResult.data.access_token 
        },
      });
      
      return true;

    } catch (error) {
      console.error("Login error:", error);
      dispatch({
        type: "AUTH_ERROR",
        payload: "Network error occurred during login",
      });
      return false;
    }
  };

  const register = async (userData: EnhancedSignupData): Promise<AuthResponse> => {
  dispatch({ type: "AUTH_LOADING" });
  
  try {
    console.log("Starting enhanced signup for:", userData.email);
    
    const signupResult = await onboardingService.completeEnhancedSignup(userData);
    
    if (!signupResult.success || !signupResult.data) {
      dispatch({
        type: "AUTH_ERROR",
        payload: signupResult.error || "Registration failed"
      });
      
      return {
        success: false,
        error: signupResult.error || "Registration failed"
      };
    }

    console.log("Account created successfully");
    console.log("Logging in new user...");
    
    const loginResult = await authService.login({
      email: userData.email,
      password: userData.password
    });

    if (!loginResult.success || !loginResult.data) {
      dispatch({
        type: "AUTH_ERROR",
        payload: "Account created but automatic login failed. Please login manually."
      });
      
      return {
        success: false,
        error: "Registration completed but automatic login failed"
      };
    }

    const userResult = await authService.getCurrentUser(loginResult.data.access_token);

    if (!userResult.success || !userResult.data) {
      dispatch({
        type: "AUTH_ERROR",
        payload: "Login successful but failed to fetch user data"
      });
      
      return {
        success: false,
        error: "Registration completed but failed to fetch user data"
      };
    }

    const user = convertUserInfoToUser(userResult.data);
    
    dispatch({
      type: "AUTH_SUCCESS",
      payload: { 
        user: user, 
        token: loginResult.data.access_token 
      },
    });

    return {
      success: true,
      data: user
    };

  } catch (error) {
    console.error("Registration error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred during registration";
    
    dispatch({
      type: "AUTH_ERROR",
      payload: errorMessage
    });
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

  const logout = async (): Promise<void> => {
    try {
      console.log("Logging out user...");
      await authService.logout();
      dispatch({ type: "AUTH_LOGOUT" });
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const updateUser = (userData: UserUpdate): void => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isLoading: state.is_loading,
    isAuthenticated: state.is_authenticated,
    user: state.user as User | null, 
    needsOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};