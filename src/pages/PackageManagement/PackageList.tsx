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
} from "../../redux/api/packageApi";

const PackageList = () => {
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

  const packages = data?.response?.packages ?? [];
  const total = data?.response?.pagination?.totalCount ?? 0;

  const handleDelete = async (id) => {
    try {
      await deletePackage(id).unwrap();
      toast.success("Package deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete package");
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => navigate(`/packages/details/${record._id}`)}
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
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (v) => (
    //     <Tag color={v ? "green" : "red"} style={{ cursor: "pointer" }}>
    //       {v ? "Active" : "Inactive"}
    //     </Tag>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* <Button
            icon={
              record.status === true ? (
                <CheckCircleOutlined style={{ color: "green" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "red" }} />
              )
            }
            onClick={() => handleStatusChange(record)}
          /> */}
          {/* <Button
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/packages/edit/${record._id}`, { state: record })
            }
          /> */}
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
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
      />
    </div>
  );
};

export default PackageList;
