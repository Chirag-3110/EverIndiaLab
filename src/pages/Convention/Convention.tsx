import { useState } from "react";
import { Table, Button, Switch, Image, message } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetPropertiesQuery } from "../../redux/api/propertyApi";
import AddPropertyModal from "../Property/AddPropertyModal";

const initialProperties = [
  {
    id: 1,
    name: "Luxury Villa",
    owner: "John Doe",
    status: "Disapproved",
    location: "Hyderabad",
    address: "Plot No. 12, Jubilee Hills, Hyderabad, Telangana, India",
    enabled: true,
    highlighted: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9xkKKotJCQl9xrAZ2I3w5FXzu7IFBPA7hRw&s",
  },
  {
    id: 2,
    name: "Downtown Apartment",
    owner: "Jane Smith",
    status: "Approved",
    location: "Mumbai",
    address:
      "Flat 402, Marine Drive Apartments, Churchgate, Mumbai, Maharashtra, India",
    enabled: false,
    highlighted: false,
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=100&q=80",
  },
];

const Convention = () => {
  const { data, error, isLoading, isFetching } = useGetPropertiesQuery();

  console.log(data);
  const [properties, setProperties] = useState(initialProperties);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleEnable = (id: number) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === id ? { ...prop, enabled: !prop.enabled } : prop
      )
    );
    message.success("Property enable status changed");
  };

  const toggleHighlighted = (id: number) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === id ? { ...prop, highlighted: !prop.highlighted } : prop
      )
    );
    message.success("Property highlighted status changed");
  };

  const changeStatus = (id: number, newStatus: string) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === id ? { ...prop, status: newStatus } : prop
      )
    );
    message.success(`Property status changed to ${newStatus}`);
  };

  const handleAddProperty = (newProperty: any) => {
    setProperties((prev) => [
      ...prev,
      { ...newProperty, id: Date.now() }, // unique ID
    ]);
    message.success("Property added successfully");
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (url: string) => <Image width={80} src={url} alt="Property" />,
    },
    { title: "Property Name", dataIndex: "name", key: "name" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (value: string) => <div>{value || "Hyderabad"}</div>,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (value: string) => <div className="max-w-[200px]">{value}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          style={{
            color: status === "Approved" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Enabled",
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: any, record: any) => (
        <Switch
          checked={enabled}
          onChange={() => toggleEnable(record.id)}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
      ),
    },
    {
      title: "Highlighted",
      dataIndex: "highlighted",
      key: "highlighted",
      render: (highlighted: any, record: any) => (
        <Switch
          checked={highlighted}
          onChange={() => toggleHighlighted(record.id)}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <>
          {record.status === "Approved" ? (
            <Button
              type="default"
              onClick={() => changeStatus(record.id, "Disapproved")}
              style={{ marginRight: 8 }}
            >
              Disapprove
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => changeStatus(record.id, "Approved")}
              style={{ marginRight: 8 }}
            >
              Approve
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Convention Space" />

      {/* Add Button */}
      {/* <div className="flex justify-end mb-4">
        <Button
          type="primary"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Property
        </Button>
      </div> */}

      <Table
        columns={columns}
        dataSource={properties}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["5", "10", "15"],
          showSizeChanger: true,
          defaultPageSize: 5,
        }}
        scroll={{ x: 1000 }}
      />

      {/* Modal */}
      <AddPropertyModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onAdd={handleAddProperty}
      />
    </div>
  );
};

export default Convention;
