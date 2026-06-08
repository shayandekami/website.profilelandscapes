import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { theme } from "@/themes/active";
import { getPage } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  if (!page) return { title: "Profile Landscapes" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.lede || undefined,
    openGraph: page.heroImage ? { images: [page.heroImage] } : undefined,
  };
}

export default async function HomePage() {
  const page = await getPage("/");
  if (!page) notFound();

  return (
    <>
      {page.sections.map((s, i) => {
        const Component = theme.sections[s.type];
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            return (
              <div
                key={i}
                style={{
                  background: "#fff8e6",
                  color: "#7a5a16",
                  padding: 20,
                  border: "1px dashed #d9b96b",
                  margin: "20px 36px",
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              >
                ⚠ Theme &ldquo;{theme.name}&rdquo; has no renderer for section type
                &ldquo;{s.type}&rdquo;
              </div>
            );
          }
          return null;
        }
        return <Component key={i} props={s.props} />;
      })}
    </>
  );
}
