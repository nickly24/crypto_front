"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

type SubscriptionModalContextValue = {
  openSubscriptionModal: () => void;
};

const SubscriptionModalContext = createContext<SubscriptionModalContextValue | null>(null);

export function useSubscriptionModal() {
  const ctx = useContext(SubscriptionModalContext);
  return ctx;
}

export function SubscriptionModalProvider({
  children,
  onOpenChange,
}: {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const openSubscriptionModal = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const value = useMemo(
    () => ({ openSubscriptionModal }),
    [openSubscriptionModal]
  );

  return (
    <SubscriptionModalContext.Provider value={value}>
      {children}
    </SubscriptionModalContext.Provider>
  );
}
