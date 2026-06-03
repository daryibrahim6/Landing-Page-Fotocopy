interface Window {
  snap?: {
    pay: (token: string, options: { onSuccess: () => void; onPending: () => void; onError: () => void }) => void;
  };
}
