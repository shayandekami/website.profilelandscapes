import { getSiteSettings } from "@/lib/content";
import { FeatureUnavailable } from "@/components/commerce/FeatureUnavailable";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  if (!settings.commerce_features.shop && !settings.commerce_features.nursery) {
    return <FeatureUnavailable eyebrow="Checkout" title="Checkout is currently unavailable." body="Contact the team and we can help complete your order or prepare a supply quote." />;
  }
  return children;
}
