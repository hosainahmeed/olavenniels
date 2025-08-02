import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import Header from "./common/Header";
const MainLayout = () => {
  const [userRole, setUserRole] = useState(null);
  return (
    <div className="flex flex-col h-dvh bg-[#111]">
      {/* Header */}
      <header className="bg-[var(--color-white)]  border-gray-700">
        <div className="max-w-full mx-auto">
          <Header setUserRole={setUserRole} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed on large screens */}
        <div className="flex flex-shrink-0">
          <div className="flex flex-col w-[300px] bg-[var(--color-white)]">
            <Sidebar userRole={userRole} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-full overflow-y-auto min-h-[calc(100vh-64px)] mx-auto p-4 sm:p-6 md:p-8 w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
