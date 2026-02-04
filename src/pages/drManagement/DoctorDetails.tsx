import React, { useState, useMemo } from "react";
import {
  Tabs,
  Descriptions,
  Button,
  Tag,
  Table,
  Input,
  Spin,
  Select,
} from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Download,
  File,
  PenBoxIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { useGetdrDetailsQuery } from "../../redux/api/drApi";

const { Search } = Input;
const { Option } = Select;

const DoctorDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const shouldSkip = !id || id === "undefined" || id === "null";

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useGetdrDetailsQuery(id, { skip: shouldSkip });

  const doctor = data?.response?.data;

  console.log(doctor);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    if (!doctor?.bookings) return [];
    return doctor.bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingId?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.familyMemberId?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [doctor?.bookings, searchText, statusFilter]);

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Patient",
      dataIndex: ["familyMemberId", "name"],
      key: "patient",
      render: (name, record) => name || record.userId || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "samplereceived"
              ? "blue"
              : "default"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Final Amount",
      dataIndex: ["amount", "finalAmount"],
      key: "finalAmount",
      render: (amount) => `₹${amount || 0}`,
    },
    {
      title: "Tests",
      key: "tests",
      render: (_, record) => {
        const tests = record.items?.[0]?.name || "N/A";
        return <span>{tests}</span>;
      },
    },
    {
      title: "Lab",
      key: "lab",
      render: (_, record) => record.assignedLabId?.name || "N/A",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color={status === "paid" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   render: (_, record) => (
    //     <div className="flex gap-2">
    //       {record.invoicePath && (
    //         <Button
    //           size="small"
    //           icon={<Download size={16} />}
    //           onClick={() => {
    //             const BASE_URL = import.meta.env.VITE_BASE_URL;
    //             const invoiceUrl = `${BASE_URL}${record.invoicePath.replace(
    //               /^\//,
    //               ""
    //             )}`;
    //             window.open(invoiceUrl, "_blank", "noopener,noreferrer");
    //           }}
    //         >
    //           Invoice
    //         </Button>
    //       )}

    //     </div>
    //   ),
    // },
  ];

  if (shouldSkip || isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Doctor Details" />
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Doctor Details" />
        <div className="text-center py-20">No doctor data found.</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Doctor Details" />
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate(-1)}>← Back to Doctors List</Button>
      </div>

      <Descriptions
        title="Doctor Information"
        bordered
        column={1}
        size="middle"
        className="mb-8"
      >
        <Descriptions.Item label="Name">
          {doctor?.doctor?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Speciality">
          {doctor?.doctor?.speciality}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={doctor?.doctor?.status ? "green" : "red"}>
            {doctor?.doctor ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="ID">{doctor?.doctor?._id}</Descriptions.Item>
        <Descriptions.Item label="Total Bookings">
          {doctor?.totalBookings || doctor?.length || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(doctor?.doctor?.createdAt).toLocaleDateString()}
        </Descriptions.Item>
      </Descriptions>

      <div className="bg-white mt-4 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Bookings ({filteredBookings.length})
          </h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Search
              placeholder="Search by ID, patient, status..."
              allowClear
              onSearch={setSearchText}
              style={{ width: 200 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="All Status"
            >
              <Option value="all">All</Option>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="samplereceived">Sample Received</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="bookingId"
          pagination={{
            current: page,
            pageSize,
            total: filteredBookings.length,
            onChange: setPage,
            onShowSizeChange: setPageSize,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1200 }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default DoctorDetails;
