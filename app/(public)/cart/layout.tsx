import { getSiteSettings } from "@/lib/content";
import { FeatureUnavailable } from "@/components/commerce/FeatureUnavailable";

export default async function CartLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  if (!settings.commerce_features.shop && !settings.commerce_features.nursery) {
    return <FeatureUnavailable eyebrow="Online ordering" title="Online ordering is currently unavailable." body="Contact the team for product orders, nursery stock and project supply enquiries." />;
  }
  return children;
}
