import { redirect } from "react-router";

// DEPRECATED
export const loader = async () => {
  return redirect("/my?path=pickups");
};
