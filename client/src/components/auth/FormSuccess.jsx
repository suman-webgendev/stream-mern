import React from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";

const FormSuccess = (props) => {
  if (!props.message) return null;
  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CheckCircledIcon className="size-4" />
      <p>{props.message}</p>
    </div>
  );
};

export default FormSuccess;

