const PricingTable = () => {
  return (
    <div>
      <stripe-pricing-table
        pricing-table-id={import.meta.env.VITE_PRICE_TABLE_ID}
        publishable-key={import.meta.env.VITE_STRIPE_PUBLISH_KEY}
      ></stripe-pricing-table>
    </div>
  );
};

export default PricingTable;
