"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useSolanaAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { SignatureModal } from "@/components/auth/SignatureModal";

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
    // If user has wallet connected but no JWT, show modal
    if (currentUser && solanaAddress && !isAuthenticated()) {
      setShowSignatureModal(true);
      setIsReady(false);
    } else if (isAuthenticated() && solanaAddress) {
      setShowSignatureModal(false);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [currentUser, solanaAddress]);

  const handleAuthSuccess = () => {
    setShowSignatureModal(false);
    setIsReady(true);
    // Redirect to dashboard after successful authentication
    router.push("/dashboard");
  };

  const modal = (
    <SignatureModal
      open={showSignatureModal}
      onOpenChange={() => {}} // Cannot be closed
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

