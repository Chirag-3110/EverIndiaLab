import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Popconfirm, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetpackageQuery,
  useDeletepackageMutation,
  useUpdatePackageStatusMutation,
  useUnassignedPackageMutation,
} from "../../redux/api/packageApi";
import { useAuth } from "../../context/AuthContext";

const PackageList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data, isLoading, refetch } = useGetpackageQuery({
    searchText,
    page,
    pageSize,
  });

  const [deletePackage] = useDeletepackageMutation();
  const [updateStatus] = useUpdatePackageStatusMutation();
  const [unassignedPackage] = useUnassignedPackageMutation();

  const packages = data?.response?.packages ?? [];
  const total = data?.response?.pagination?.totalCount ?? 0;

  const handleDelete = async (id) => {
    try {
      const payload = {
        packageId: id,
        labId: user?._id,
      };
      await unassignedPackage(payload).unwrap();
      toast.success("Package removed successfully");
      refetch();
    } catch {
      toast.error("Failed to removed package");
    }
  };

  const handleStatusChange = async (record) => {
    console.log(record);
    try {
      await updateStatus({ id: record._id, body: { status: !record.status } });
      toast.success("Status updated successfully");
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // /packages/adeilst;
  const columns = [
    {
      title: "Packages",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
        // style={{ cursor: "pointer", color: "#1890ff" }}
        // onClick={() => navigate(`/packages/details/${record._id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (v) => `${v}`,
    },
    {
      title: "Tests",
      dataIndex: "includedTests",
      key: "includedTests",
      render: (arr) => (arr?.length ? arr.length + " Tests" : "--"),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v) => `₹${v}`,
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Remove</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

    const includedTestsColumns = [
      {
        title: "Test Title",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (text) => text || "-",
      },
      {
        title: "Recommended Gender",
        dataIndex: "recommendedGender",
        key: "recommendedGender",
      },
      {
        title: "Report Time",
        dataIndex: "reportTime",
        key: "reportTime",
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
      },
    ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Packages" />
      <div className="flex justify-between items-center gap-4 mb-4">
        <Input.Search
          placeholder="Search packages"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          enterButton
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/packages/new")}
          style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }} // green
        >
          Add Package
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/packages/assign")}
          style={{
            backgroundColor: "#FF9800",
            borderColor: "#FF9800",
            marginLeft: 10,
          }} // orange
        >
          Assign Packages
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={packages}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              columns={includedTestsColumns}
              dataSource={record.includedTests}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          ),
          rowExpandable: (record) =>
            Array.isArray(record.includedTests) &&
            record.includedTests.length > 0,
        }}
      />
    </div>
  );
};

export default PackageList;
