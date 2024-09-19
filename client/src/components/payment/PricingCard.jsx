import { api, cn, formatPriceData } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Suspense, useState } from "react";
import PricingCardLoading from "./PricingCardLoading";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);

const PricingCard = () => {
  const [isAnnual, setIsAnnual] = useState(true);

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
        damping: 7,
      },
    },
  };

  const createSubscriptionMutation = useMutation({
    mutationFn: async (priceId) => {
      console.log(priceId);
      const { data } = await api.post("/api/subscriptions", { priceId });
      return data;
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    },
    onError: (error) => {
      console.error("Subscription creation failed:", error);
      // Handle error (e.g., show error message to user)
    },
  });

  const handlePurchase = (priceId) => {
    createSubscriptionMutation.mutate(priceId);
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
                      <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow shadow-slate-950/5">
                        {plan.popular && (
                          <div className="absolute right-0 top-0 -mt-4 mr-6">
                            <div className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-slate-950/5">
                              Most Popular
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
                            <span className="font-medium text-slate-500">
                              {isAnnual ? "/year" : "/month"}
                            </span>
                          </div>
                          <div className="mb-5 text-sm text-slate-500">
                            {plan.description}
                          </div>
                          <button
                            className="inline-flex w-full justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 transition-colors duration-150 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300"
                            onClick={() =>
                              handlePurchase(
                                isAnnual
                                  ? plan.annualPriceId
                                  : plan.monthlyPriceId,
                              )
                            }
                            disabled={createSubscriptionMutation.isLoading}
                          >
                            {createSubscriptionMutation.isLoading
                              ? "Processing..."
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
