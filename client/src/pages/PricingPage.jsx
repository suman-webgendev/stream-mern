import PricingCardLoading from "@/components/payment/PricingCardLoading";
import { useSessionVerification } from "@/hooks/stripe";
import { lazy, Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PricingPage = () => {
  const PricingCard = lazy(() => import("@/components/payment/PricingCard"));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const subscriptionId = searchParams.get("subscriptionId");

  const {
    data: verificationData,
    isLoading,
    isError,
  } = useSessionVerification(subscriptionId, sessionId, status);

  useEffect(() => {
    if (!isLoading && (verificationData || isError)) {
      navigate("/pricing", { replace: true });
    }

    setTimeout(() => {
      navigate("/pricing", { replace: true });
    }, 100);
  }, [isLoading, verificationData, isError, navigate]);

  return (
    <div className="relative antialiased">
      <main className="relative flex h-[92vh] flex-col items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="mb-4 text-center text-indigo-600">
            Verifying your subscription...
          </div>
        )}
        <Suspense fallback={<PricingCardLoading />}>
          <PricingCard />
        </Suspense>
      </main>
    </div>
  );
};

export default PricingPage;
