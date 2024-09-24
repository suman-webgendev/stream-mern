import { lazy, Suspense } from "react";

const CheckoutForm = () => {
  const CreditCard = lazy(() => import("./CreditCard"));
  return (
    <div className="h-[90vh]">
      <Suspense fallback={<div>Loading...</div>}>
        <CreditCard />
      </Suspense>
    </div>
  );
};

export default CheckoutForm;
