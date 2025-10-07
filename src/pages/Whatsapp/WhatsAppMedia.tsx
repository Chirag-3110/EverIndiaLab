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
import moment from "moment";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const { Option } = Select;

const dummyUsers = [
  { id: 1, name: "Alice Johnson", phone: "+1234567890" },
  { id: 2, name: "Bob Smith", phone: "+1987654321" },
  { id: 3, name: "Charlie Davis", phone: "+1122334455" },
  { id: 4, name: "Diana Evans", phone: "+1098765432" },
];

const WhatsAppMedia = () => {
  const [messages, setMessages] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    time: null,
    audienceType: "all",
    selectedUsers: [],
  });

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

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Mock send WhatsApp message (replace with backend API call)
  const sendWhatsAppMessage = async (phone, title, description) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`WhatsApp message sent to ${phone} with title "${title}"`);
        resolve(true);
      }, 500);
    });
  };

  const submitWhatsAppMessage = async () => {
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

    const recipients =
      formValues.audienceType === "all"
        ? dummyUsers
        : dummyUsers.filter((u) => formValues.selectedUsers.includes(u.id));

    try {
      for (const user of recipients) {
        await sendWhatsAppMessage(
          user.phone,
          formValues.title,
          formValues.description
        );
      }

      setMessages((prev) => [
        {
          id: Date.now(),
          title: formValues.title,
          description: formValues.description,
          time: formValues.time || moment(),
          audience:
            formValues.audienceType === "all"
              ? "All Users"
              : recipients.map((r) => r.name).join(", "),
        },
        ...prev,
      ]);

      message.success("WhatsApp message sent successfully.");
      setModalVisible(false);
    } catch (error) {
      message.error("Failed to send WhatsApp message.");
    }
  };

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    message.success("Message deleted!");
  };

  const rescheduleMessage = (record) => {
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
    deleteMessage(record.id);
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Sent Time",
      dataIndex: "time",
      key: "time",
      render: (time) => moment(time).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Audience", dataIndex: "audience", key: "audience" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => rescheduleMessage(record)}>Reschedule</Button>
          <Popconfirm
            title="Are you sure to delete this message?"
            onConfirm={() => deleteMessage(record.id)}
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
      <PageBreadcrumb pageTitle="WhatsApp Messages History" />
      <Button type="primary" onClick={openModal} style={{ marginBottom: 16 }}>
        Send New WhatsApp Message
      </Button>

      <Table
        columns={columns}
        dataSource={messages}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="Send WhatsApp Message"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitWhatsAppMessage}
        okText="Send"
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

export default WhatsAppMedia;
