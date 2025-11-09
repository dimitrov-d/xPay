"use client";

import { SignatureModal } from "@/components/auth/SignatureModal";
import { isAuthenticated } from "@/lib/auth";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Hook that checks authentication and shows signature modal if needed
 * Returns whether user is authenticated and ready to use the app
 */
export function useRequireAuth() {
  const { currentUser } = useCurrentUser();
  const { solanaAddress } = useSolanaAddress();
  const router = useRouter();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (currentUser && solanaAddress && !isAuthenticated()) {
      const timer = setTimeout(() => {
        setShowSignatureModal(true);
        setIsReady(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isAuthenticated() && solanaAddress) {
      setShowSignatureModal(false);
      setIsReady(true);
    } else {
      setIsReady(false);
      setShowSignatureModal(false);
    }
  }, [currentUser, solanaAddress]);

  const handleAuthSuccess = () => {
    setShowSignatureModal(false);
    setIsReady(true);
    router.push("/dashboard");
  };

  const modal = (
    <SignatureModal
      open={showSignatureModal}
      onOpenChange={() => { }} // Cannot be closed
      onSuccess={handleAuthSuccess}
    />
  );

  return {
    isAuthenticated: isAuthenticated(),
    isReady,
    hasWallet: !!solanaAddress,
    needsSignature: currentUser && solanaAddress && !isAuthenticated(),
    showModal: showSignatureModal,
    SignatureModal: modal,
  };
}

