import PricingCardLoading from "@/components/payment/PricingCardLoading";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const verifySession = async (sessionId) => {
  const { data } = await api.post("/api/subscription/verify-session", {
    sessionId,
  });
  return data;
};

const PricingPage = () => {
  const PricingCard = lazy(() => import("@/components/payment/PricingCard"));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const {
    data: verificationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["verifySession", sessionId],
    queryFn: () => verifySession(sessionId),
    enabled: !!sessionId && status === "success",
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (verificationData || isError)) {
      navigate("/pricing", { replace: true });
    }
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
