import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function MonthlyCombinedChart({ data, title }) {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },

    colors: ["#07868D", "#9CB9FF"],

    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    xaxis: {
      categories: data.testsPerMonth.map((item) => item.month),
    },

    markers: {
      size: 4,
      hover: { size: 7 },
    },

    yaxis: [
      {
        title: { text: "Tests", style: { color: "#07868D" } },
      },
      {
        opposite: true,
        title: { text: "Sales", style: { color: "#9CB9FF" } },
      },
    ],

    tooltip: {
      shared: true,
      intersect: false,
    },

    grid: {
      borderColor: "#e5e7eb",
    },
  };

  // ✅ Apply your API data here
  const series = [
    {
      name: "Tests",
      data: data.testsPerMonth.map((i) => i.value),
    },
    {
      name: "Sales",
      data: data.salesPerMonth.map((i) => i.value),
    },
  ];

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="text-lg font-semibold mb-4">
        Monthly Tests & Sales Report
      </h3>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
}
