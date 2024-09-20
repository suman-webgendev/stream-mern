// import PricingCard from "@/components/payment/PricingCard";

// const PricingPage = () => {
//   return (
//     <div>
//       <PricingCard />
//     </div>
//   );
// };

// export default PricingPage;

import PricingCard from "@/components/payment/PricingCard";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const verifySession = async (sessionId) => {
  const { data } = await api.post("/api/subscription/verify-session", {
    sessionId,
  });
  return data;
};

const PricingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  console.log(status, "status");
  console.log(sessionId, "session_id");

  const {
    data: verificationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["verifySession", sessionId],
    queryFn: () => verifySession(sessionId),
    enabled: !!sessionId && status === "success",
    retry: false, // Don't retry on failure
  });

  useEffect(() => {
    if (!isLoading && (verificationData || isError)) {
      // Clear URL parameters after verification attempt
      navigate("/pricing", { replace: true });
    }
  }, [isLoading, verificationData, isError, navigate]);

  const subscriptionStatus = (() => {
    if (status === "success" && verificationData?.verified) return "success";
    if (status === "canceled") return "canceled";
    if (
      status === "failed" ||
      (status === "success" && verificationData?.verified === false)
    )
      return "failed";
    return null;
  })();

  return (
    <div className="relative antialiased">
      <main className="relative flex h-[92vh] flex-col items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="mb-4 text-center text-indigo-600">
            Verifying your subscription...
          </div>
        )}
        {subscriptionStatus && (
          <div
            className={`mb-4 text-center ${
              subscriptionStatus === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {subscriptionStatus === "success" && "Subscription successful!"}
            {subscriptionStatus === "canceled" && "Subscription canceled."}
            {subscriptionStatus === "failed" &&
              "Subscription failed. Please try again."}
          </div>
        )}
        <PricingCard verificationData={verificationData} />
      </main>
    </div>
  );
};

export default PricingPage;
