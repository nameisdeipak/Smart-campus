import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function PageLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

export default PageLayout;
