import { featureAccess, getSiteSettings } from "@/lib/content";
import { FeatureUnavailable } from "@/components/commerce/FeatureUnavailable";

export default async function CartLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const [_shop, _nursery] = await Promise.all([featureAccess("shop"), featureAccess("nursery")]);
  if (!_shop.visible && !_nursery.visible) {
    return <FeatureUnavailable eyebrow="Online ordering" title="Online ordering is currently unavailable." body="Contact the team for product orders, nursery stock and project supply enquiries." />;
  }
  return children;
}
