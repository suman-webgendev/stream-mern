import { useAuth } from "@/hooks/useAuth";
import { api, cn, formatPriceData } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCardLoading from "./PricingCardLoading";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);

const PricingCard = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: apiResponse,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["priceTable"],
    queryFn: async () => {
      const { data } = await api.get("/api/subscription/plans");
      return data;
    },
  });

  const priceData = formatPriceData(apiResponse);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 5,
      },
    },
  };

  const createSubscriptionMutation = useMutation({
    mutationFn: async (priceId) => {
      const { data } = await api.post("/api/subscriptions", { priceId });
      return data;
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    },
  });

  const createBillingPortalSessionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/subscription/billing-portal");
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const handlePurchase = (priceId) => {
    // createSubscriptionMutation.mutate(priceId);

    const selectedPlan = apiResponse.plans.find((plan) =>
      plan.prices.some((price) => price.id === priceId),
    );

    // Extract the correct price based on the selected plan and price ID
    const priceObject = selectedPlan.prices.find(
      (price) => price.id === priceId,
    );

    navigate("/checkout", {
      state: {
        priceId,
        price: priceObject ? priceObject.unit_amount / 100 : null,
      },
    });
  };
  const handleManagePlan = () => {
    createBillingPortalSessionMutation.mutate();
  };

  const isCurrentPlan = (planPrice) => {
    return user?.subscriptionAmount === planPrice;
  };

  return (
    <div className="relative antialiased">
      <main className="relative flex h-[92vh] flex-col items-center justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
          <h2 className="mb-6 text-center text-5xl font-extrabold">
            Choose a plan according to your need
          </h2>
          <div className="m-auto mb-8 flex max-w-[14rem] justify-center lg:mb-16">
            <div className="relative flex w-full rounded-full bg-slate-200 p-1">
              <span
                className="pointer-events-none absolute inset-0 m-1"
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute inset-0 w-1/2 translate-x-full transform rounded-full bg-indigo-500 shadow-sm shadow-indigo-950/10 transition-transform duration-150 ease-in-out",
                    isAnnual && "translate-x-0",
                  )}
                ></span>
              </span>
              <button
                className={cn(
                  "relative h-8 flex-1 rounded-full text-sm font-medium text-slate-500 transition-colors duration-150 ease-in-out",
                  isAnnual && "text-white",
                )}
                onClick={() => setIsAnnual(true)}
                aria-pressed={isAnnual}
              >
                Yearly
                <span
                  className={cn(
                    "text-slate-400",
                    isAnnual && "text-indigo-200",
                  )}
                >
                  -20%
                </span>
              </button>
              <button
                className={cn(
                  "relative h-8 flex-1 rounded-full text-sm font-medium text-white transition-colors duration-150 ease-in-out",
                  isAnnual && "text-slate-500",
                )}
                onClick={() => setIsAnnual(false)}
                aria-pressed={!isAnnual}
              >
                Monthly
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isAnnual ? "annual" : "monthly"}
              className="mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {isFetching && !error && <PricingCardLoading />}
              <Suspense fallback={<PricingCardLoading />}>
                {!isFetching &&
                  !error &&
                  priceData.map((plan, index) => (
                    <motion.div
                      key={index}
                      className="h-full"
                      variants={itemVariants}
                    >
                      <div
                        className={cn(
                          "relative flex h-full flex-col rounded-2xl border p-6 shadow shadow-slate-950/5",
                          isCurrentPlan(
                            isAnnual ? plan.annualPrice : plan.monthlyPrice,
                          )
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute right-0 top-0 -mt-4 mr-6">
                            <div className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-slate-950/5">
                              Most Popular
                            </div>
                          </div>
                        )}
                        {isCurrentPlan(
                          isAnnual ? plan.annualPrice : plan.monthlyPrice,
                        ) && (
                          <div className="absolute left-0 top-0 -mt-4 ml-6">
                            <div className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-slate-950/5">
                              Current Plan
                            </div>
                          </div>
                        )}
                        <div className="mb-5">
                          <div className="mb-1 font-semibold text-slate-900">
                            {plan.title}
                          </div>
                          <div className="mb-2 inline-flex items-baseline">
                            <span className="text-3xl font-bold text-slate-900">
                              $
                            </span>
                            <span className="text-4xl font-bold text-slate-900">
                              {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                            </span>
                            <span className="ml-0.5 font-medium text-slate-500">
                              {isAnnual ? " /year" : " /month"}
                            </span>
                          </div>
                          <div className="mb-5 text-sm text-slate-500">
                            {plan.description}
                          </div>
                          <button
                            className={cn(
                              "inline-flex w-full cursor-pointer justify-center whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring",
                              isCurrentPlan(
                                isAnnual ? plan.annualPrice : plan.monthlyPrice,
                              )
                                ? "bg-indigo-600 text-white shadow-indigo-950/10 hover:bg-indigo-700 focus-visible:ring-indigo-300"
                                : "bg-indigo-500 text-white shadow-indigo-950/10 hover:bg-indigo-600 focus-visible:ring-indigo-300",
                            )}
                            onClick={() =>
                              isCurrentPlan(
                                isAnnual ? plan.annualPrice : plan.monthlyPrice,
                              )
                                ? handleManagePlan()
                                : handlePurchase(
                                    isAnnual
                                      ? plan.annualPriceId
                                      : plan.monthlyPriceId,
                                  )
                            }
                            disabled={
                              createSubscriptionMutation.isLoading ||
                              createBillingPortalSessionMutation.isLoading
                            }
                          >
                            {createSubscriptionMutation.isLoading ||
                            createBillingPortalSessionMutation.isLoading
                              ? "Processing..."
                              : isCurrentPlan(
                                    isAnnual
                                      ? plan.annualPrice
                                      : plan.monthlyPrice,
                                  )
                                ? "Manage Plan"
                                : "Purchase Plan"}
                          </button>
                        </div>
                        <div className="mb-3 font-medium text-slate-900">
                          Includes:
                        </div>
                        <ul className="grow space-y-3 text-sm text-slate-600">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center"
                            >
                              <Check className="mr-3 size-5 shrink-0 text-emerald-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PricingCard;
