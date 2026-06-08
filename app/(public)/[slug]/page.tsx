import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { theme } from "@/themes/active";
import { getPage } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage("/" + slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.lede || undefined,
  };
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPage("/" + slug);
  if (!page || page.status !== "live") notFound();

  return (
    <>
      {page.sections.map((s, i) => {
        const Component = theme.sections[s.type];
        if (!Component) return null;
        return <Component key={i} props={s.props} />;
      })}
    </>
  );
}
