import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function StatisticsChart({ title, monthlyPatientGrowth }) {
  const months = monthlyPatientGrowth?.map((item) => item.month) || [];
  const values = monthlyPatientGrowth?.map((item) => item.value) || [];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 310,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },

    colors: ["#07868D"],

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
        dataLabels: {
          position: "top",
        },
      },
    },

    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#333"],
      },
    },

    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "12px", colors: "#6B7280" },
      },
    },

    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },

    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },

    tooltip: { enabled: true },
  };

  const series = [
    {
      name: "Monthly Value",
      data: values,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-gray-500 text-theme-sm">
            Monthly performance overview
          </p>
        </div>
      </div>

      <Chart options={options} series={series} type="bar" height={310} />
    </div>
  );
}
