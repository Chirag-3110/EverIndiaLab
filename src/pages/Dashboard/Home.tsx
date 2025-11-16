import {
  ClipboardList,
  UserCheck,
  Activity,
  CalendarCheck,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";

import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import { useGetdashboardQuery } from "../../redux/api/dasboardApi";
import { Spin } from "antd";

export default function AdminDashboard() {
  const { data, isLoading } = useGetdashboardQuery({});
  const stats = data?.response?.data || {};

  // DEFAULT VALUES
  const safeTestOverview = stats?.testOverviewChatData || {
    testsPerMonth: [],
    salesPerMonth: [],
  };

  const safePatientGrowth = stats?.monthlyPatientGrowth || [];

  return (
    <>
      <PageMeta
        title="EverIndia Path Lab Admin Dashboard"
        description="Manage patient bookings..."
      />

      {/* ✔ Show loading until API returns */}
      {isLoading && (
        <div className="text-center py-10 h-[80vh] flex items-center justify-center flex-col gap-4 text-gray-600 text-lg">
          <Spin />
          Loading dashboard...
        </div>
      )}

      {/* ✔ Render only when data exists */}
      {!isLoading && (
        <>
          {/* Heading */}
          <section className="mb-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <ClipboardList className="w-8 h-8 text-[#07868D]" />
                <h1 className="text-3xl font-extrabold text-[#07868D]">
                  Lab Admin Dashboard
                </h1>
              </div>

              <div className="flex items-start gap-2 text-gray-600 max-w-xl">
                <p className="text-base sm:text-lg leading-relaxed">
                  Monitor patient bookings and manage operations seamlessly.
                </p>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {/* Boxes */}
            <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <UserCheck className="w-10 h-10 text-red-500" />
                <div>
                  <h2 className="text-lg font-semibold">New Patients</h2>
                  <span className="text-xl font-bold">
                    {stats?.newUsers || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <UserCheck className="w-10 h-10 text-green-500" />
                <div>
                  <h2 className="text-lg font-semibold">New Staff</h2>
                  <span className="text-xl font-bold">
                    {stats?.newStaff || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <Activity className="w-10 h-10 text-blue-500" />
                <div>
                  <h2 className="text-lg font-semibold">Tests Conducted</h2>
                  <span className="text-xl font-bold">
                    {stats?.testsConductedToday || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <CalendarCheck className="w-10 h-10 text-purple-500" />
                <div>
                  <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
                  <span className="text-xl font-bold">
                    {stats?.upcomingBookings || 0}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <CalendarCheck className="w-10 h-10 text-pink-500" />
                <div>
                  <h2 className="text-lg font-semibold">Pending Reports</h2>
                  <span className="text-xl font-bold">
                    {stats?.reportsPending || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="col-span-12 bg-white rounded-lg shadow p-4">
              <MonthlySalesChart
                title="Monthly Tests/Sales Overview"
                data={safeTestOverview}
              />
            </div>

            <div className="col-span-12 bg-white rounded-lg shadow p-4">
              <StatisticsChart
                title="Monthly Patient Growth"
                monthlyPatientGrowth={safePatientGrowth}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
