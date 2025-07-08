import React from "react";

export const DashboardLayout = ({ sidebar, topbar, children }: { sidebar: React.ReactNode, topbar: React.ReactNode, children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex">
    {/* Sidebar */}
    <aside className="hidden md:flex flex-col w-64 bg-white border-r px-4 py-6">
      {sidebar}
    </aside>
    <div className="flex-1 flex flex-col">
      {/* Topbar */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b sticky top-0 z-10">
        {topbar}
      </header>
      {/* Content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  </div>
);

