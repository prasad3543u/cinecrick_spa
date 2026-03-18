import { Breadcrumbs } from "../components/Breadcrumbs";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#070812]">
      <div className="px-4 sm:px-6 py-4">
        <Breadcrumbs />
        {children}
      </div>
    </div>
  );
}