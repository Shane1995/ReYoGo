export type CredentialsFormProps = {
  tursoUrl: string;
  authToken: string;
  connecting: boolean;
  connectError: string | null;
  onUrlChange: (v: string) => void;
  onTokenChange: (v: string) => void;
  onConnect: () => void;
};
