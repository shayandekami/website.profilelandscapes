/**
 * Loads the admin stylesheets for ALL admin routes (chromed and chromeless).
 * Chrome (sidebar + top nav) is in app/admin/(chrome)/layout.tsx so the login
 * page can render without it.
 */
export default function AdminBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href="/admin/admin.css" />
      <link rel="stylesheet" href="/admin/admin-ext.css" />
      {children}
    </>
  );
}
