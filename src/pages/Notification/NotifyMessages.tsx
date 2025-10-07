import React, { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  message,
} from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import moment from "moment";

const { Option } = Select;

const dummyUsers = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Davis" },
  { id: 4, name: "Diana Evans" },
  // Add more dummy users as needed
];

const NotifyMessages = () => {
  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Update",
      description: "System will be updated at midnight.",
      time: moment().add(1, "day"),
      audience: "All Users",
    },
    {
      id: 2,
      title: "Special Offer",
      description: "Exclusive sale for selected users.",
      time: null,
      audience: "Bob Smith",
    },
  ]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    time: null,
    audienceType: "all", // "all" or "individual"
    selectedUsers: [],
  });

  // Open modal and reset form
  const openModal = () => {
    setFormValues({
      title: "",
      description: "",
      time: null,
      audienceType: "all",
      selectedUsers: [],
    });
    setModalVisible(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Add new notification handler
  const addNotification = () => {
    if (!formValues.title.trim() || !formValues.description.trim()) {
      message.error("Title and description are required.");
      return;
    }

    if (
      formValues.audienceType === "individual" &&
      formValues.selectedUsers.length === 0
    ) {
      message.error("Please select at least one user.");
      return;
    }

    const audienceText =
      formValues.audienceType === "all"
        ? "All Users"
        : formValues.selectedUsers
            .map((id) => {
              const user = dummyUsers.find((u) => u.id === id);
              return user ? user.name : "";
            })
            .join(", ");

    const newNotification = {
      id: Date.now(),
      title: formValues.title,
      description: formValues.description,
      time: formValues.time,
      audience: audienceText,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    message.success("Notification added!");
    setModalVisible(false);
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    message.success("Notification deleted!");
  };

  // Reschedule notification - open modal with data loaded
  const rescheduleNotification = (record) => {
    setFormValues({
      title: record.title,
      description: record.description,
      time: record.time,
      audienceType: record.audience === "All Users" ? "all" : "individual",
      selectedUsers:
        record.audience === "All Users"
          ? []
          : record.audience
              .split(", ")
              .map((name) => {
                const user = dummyUsers.find((u) => u.name === name);
                return user ? user.id : null;
              })
              .filter(Boolean),
    });
    setModalVisible(true);

    // Also remove the old notification; user will add new/rescheduled notification after editing
    deleteNotification(record.id);
  };

  // Table columns
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (time) => (time ? time.format("YYYY-MM-DD HH:mm") : "N/A"),
    },
    { title: "Audience", dataIndex: "audience", key: "audience" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => rescheduleNotification(record)}>
            Reschedule
          </Button>
          <Popconfirm
            title="Are you sure to delete this notification?"
            onConfirm={() => deleteNotification(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  
  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb pageTitle="Notification History" />
      <Button type="primary" style={{ marginBottom: 16 }} onClick={openModal}>
        Add New Notification
      </Button>

      <Table
        columns={columns}
        dataSource={notifications}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="Add New Notification"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={addNotification}
        okText="Submit"
      >
        <Input
          placeholder="Title"
          value={formValues.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input.TextArea
          placeholder="Description"
          value={formValues.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          style={{ marginBottom: 12 }}
        />
        <DatePicker
          showTime
          placeholder="Select time (optional)"
          value={formValues.time}
          onChange={(value) => handleInputChange("time", value)}
          style={{ width: "100%", marginBottom: 12 }}
        />

        <Select
          value={formValues.audienceType}
          onChange={(value) => handleInputChange("audienceType", value)}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <Option value="all">All Users</Option>
          <Option value="individual">Individual User(s)</Option>
        </Select>

        {formValues.audienceType === "individual" && (
          <Select
            mode="multiple"
            showSearch
            placeholder="Select user(s)"
            optionFilterProp="children"
            value={formValues.selectedUsers}
            onChange={(value) => handleInputChange("selectedUsers", value)}
            filterOption={(input, option: any) => {
              const label = option?.children;
              if (typeof label === "string") {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            style={{ width: "100%" }}
          >
            {dummyUsers.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>
        )}
      </Modal>
    </div>
  );
};

export default NotifyMessages;
