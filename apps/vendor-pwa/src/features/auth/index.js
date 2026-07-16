// Auth Feature - Architecture modulaire
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as ResetPinPage } from './pages/ResetPinPage';
export { default as LogoutPage } from './pages/LogoutPage';

export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as ResetPinForm } from './components/ResetPinForm';
export { default as AuthLayout } from './components/AuthLayout';
export { default as AuthGuard } from './components/AuthGuard';

export { default as useAuth } from './hooks/useAuth';
export { default as useAuthGuard } from './hooks/useAuthGuard';

export { default as authService } from './services/authService';
export { default as authStore } from './stores/authStore';

// Feature module
const AuthFeature = {
  name: 'auth',
  pages: {
    login: 'LoginPage',
    register: 'RegisterPage',
    resetPin: 'ResetPinPage',
    logout: 'LogoutPage'
  },
  components: {
    LoginForm: 'LoginForm',
    RegisterForm: 'RegisterForm',
    ResetPinForm: 'ResetPinForm',
    AuthLayout: 'AuthLayout',
    AuthGuard: 'AuthGuard'
  },
  hooks: {
    useAuth: 'useAuth',
    useAuthGuard: 'useAuthGuard'
  },
  services: {
    authService: 'authService'
  },
  stores: {
    authStore: 'authStore'
  }
};

export default AuthFeature; 