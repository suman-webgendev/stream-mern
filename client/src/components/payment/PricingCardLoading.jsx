import { Skeleton } from "../ui/skeleton";

const PricingCardLoading = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-full" key={index}>
          <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow shadow-slate-950/5">
            <Skeleton className="mb-3 h-[4.5rem]" />
            <Skeleton className="mb-1 h-4" />
            <Skeleton className="mb-4 h-4 w-64" />
            <Skeleton className="mb-7 h-10" />
            <Skeleton className="mb-4 h-6 w-48" />
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      ))}
    </>
  );
};

export default PricingCardLoading;
