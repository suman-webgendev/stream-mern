import PricingTable from "@/components/payment/PricingTable";

const PricingPage = () => {
  return (
    <div className="m-3 p-4">
      <h2 className="mb-6 text-center text-3xl font-bold">
        Choose the plan according to your need
      </h2>
      <PricingTable />
    </div>
  );
};

export default PricingPage;
