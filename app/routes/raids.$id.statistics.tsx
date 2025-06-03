import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

// [DEPRECATED 2025-05-25] redirect to raids.$id
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/raids/${params.id}?screen=statistics`);
};
