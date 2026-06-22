import { getCheckoutPrefill } from "@/actions/customerAuthActions";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const prefill = await getCheckoutPrefill();
  return <CheckoutForm prefill={prefill} />;
}
