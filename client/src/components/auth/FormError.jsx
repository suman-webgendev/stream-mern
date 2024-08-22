import React from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const FormError = (props) => {
  if (!props.message) return null;
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
      <ExclamationTriangleIcon className="size-4" />
      <p>{props.message}</p>
    </div>
  );
};

export default FormError;

