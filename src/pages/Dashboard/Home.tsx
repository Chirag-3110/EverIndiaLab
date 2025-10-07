import {
  ClipboardList,
  UserCheck,
  Activity,
  CalendarCheck,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics"; // You can rename this to LabMetrics later
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";

export default function AdminDashboard() {
  return (
    <>
      <PageMeta
        title="EverIndia Path Lab Admin Dashboard"
        description="Manage patient bookings, test reports, and lab operations efficiently — all in one dashboard."
      />

      {/* Heading Section */}
      <section className="mb-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          {/* Heading with icon */}
          <div className="flex items-center gap-3 flex-wrap">
            <ClipboardList className="w-8 h-8 text-[#07868D]" />
            <h1 className="text-3xl font-extrabold text-[#07868D] whitespace-nowrap">
              {localStorage.getItem("lab")
                ? JSON.parse(localStorage.getItem("lab")).name
                : "Lab"}
            </h1>
          </div>

          {/* Paragraph with tagline */}
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 max-w-xl">
            <p className="text-base sm:text-lg leading-relaxed">
              Monitor patient bookings, track test reports, and manage lab
              operations seamlessly — all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Metric Boxes */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
            <UserCheck className="w-10 h-10 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold">New Patients</h2>
              <p className="text-gray-500">Total patients registered today</p>
              <span className="text-xl font-bold">120</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
            <Activity className="w-10 h-10 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Tests Conducted</h2>
              <p className="text-gray-500">Number of tests done today</p>
              <span className="text-xl font-bold">85</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
            <CalendarCheck className="w-10 h-10 text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
              <p className="text-gray-500">Scheduled for today</p>
              <span className="text-xl font-bold">32</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
            <ClipboardList className="w-10 h-10 text-pink-500" />
            <div>
              <h2 className="text-lg font-semibold">Reports Pending</h2>
              <p className="text-gray-500">Reports yet to be generated</p>
              <span className="text-xl font-bold">15</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-lg shadow p-4">
          <MonthlySalesChart title="Daily Tests Overview" />
        </div>

        <div className="col-span-12 md:col-span-6 bg-white rounded-lg shadow p-4">
          <StatisticsChart title="Monthly Patient Growth" />
        </div>

        {/* Monthly Target / Goals */}
        <div className="col-span-12">
          <MonthlyTarget title="Lab Performance Goals" />
        </div>
      </div>
    </>
  );
}
