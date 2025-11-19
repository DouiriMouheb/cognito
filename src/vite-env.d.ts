/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TRANSPORTATION_COST_API: string;
  readonly VITE_COGNITO_AUTHORITY: string;
  readonly VITE_COGNITO_HOSTED_UI_DOMAIN: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_COGNITO_CLIENT_SECRET: string;
  readonly VITE_COGNITO_REDIRECT_URI: string;
  readonly VITE_COGNITO_POST_LOGOUT_REDIRECT_URI: string;
  readonly VITE_SINERGIA_CLIENT_ID: string;
  readonly VITE_SINERGIA_CLIENT_SECRET: string;
  readonly VITE_SINERGIA_TOKEN_URL: string;
  readonly VITE_SINERGIA_API_BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
