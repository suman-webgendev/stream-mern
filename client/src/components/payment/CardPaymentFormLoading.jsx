import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CardPaymentFormLoading = () => {
  return (
    <Card className="h-[33.5rem] w-[28rem] max-w-[90vw] shadow-xl">
      <div className="p-4">
        <Skeleton className="mb-2 h-7 w-24 rounded-md" />
        <Skeleton className="mb-3 h-10 w-full rounded-md" />

        <Skeleton className="mb-2 h-7 w-24 rounded-md" />
        <Skeleton className="mb-3 h-10 w-full rounded-md" />

        <Skeleton className="mb-2 h-7 w-24 rounded-md" />
        <Skeleton className="mb-3 h-10 w-full rounded-md" />

        <Skeleton className="mb-2 h-7 w-24 rounded-md" />
        <Skeleton className="mb-3 h-10 w-full rounded-md" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="mb-2 h-7 w-24 rounded-md" />
            <Skeleton className="mb-3 h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="mb-2 h-7 w-24 rounded-md" />
            <Skeleton className="mb-3 h-10 w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </Card>
  );
};

export default CardPaymentFormLoading;
