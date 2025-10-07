import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Modal, message, Space } from "antd";
import { toast } from "react-toastify";
import {
  useGetcontactQuery,
  useUpdatecontactMutation,
} from "../../redux/api/contactApi";
import { EditOutlined } from "@ant-design/icons";

const ContactPage = () => {
  const { data, isLoading } = useGetcontactQuery({});
  const [updateContact] = useUpdatecontactMutation();
  const baseColor = "#07868D";

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // When API responds, set initial form values
  useEffect(() => {
    if (data?.response?.length > 0) {
      const contact = data.response[0]; // take first contact
      setSelectedContact(contact);
      form.setFieldsValue({
        contactNumber: contact.contactNumber,
        whatsappNumber: contact.whatsappNumber,
        email: contact.email,
        address: contact.address,
      });
    }
  }, [data, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedContact?._id) {
        message.error("No contact found to update");
        return;
      }

      await updateContact({
        id: selectedContact._id,
        body: values,
      }).unwrap();

      toast.success("Contact updated successfully");
      setIsEditing(false);
    } catch (err) {
      message.error("Failed to update contact");
    }
  };

  if (isLoading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 40,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 18px",
            }}
          >
            <span style={{ color: baseColor, fontWeight: "700", fontSize: 22 }}>
              Contact Details
            </span>
            <Space>
              <Button
                type="primary"
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: baseColor,
                  borderColor: baseColor,
                }}
                icon={<EditOutlined />}
              />
            </Space>
          </div>
        }
        bordered
        style={{
          width: 600,
          boxShadow: `0 4px 20px ${baseColor}40`,
          borderTop: `4px solid ${baseColor}`,
        }}
        headStyle={{ padding: 0 }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ paddingTop: 10 }}
          disabled={!isEditing}
        >
          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[
              { required: true, message: "Contact number is required" },
              { pattern: /^\d+$/, message: "Only digits allowed" },
            ]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            label="WhatsApp Number"
            name="whatsappNumber"
            rules={[
              { required: true, message: "WhatsApp number is required" },
              { pattern: /^\d+$/, message: "Only digits allowed" },
            ]}
          >
            <Input placeholder="Enter WhatsApp number" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input.TextArea placeholder="Enter address" rows={3} />
          </Form.Item>

          {isEditing && (
            <Form.Item>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <Button
                  onClick={() => {
                    form.resetFields();
                    if (selectedContact) {
                      form.setFieldsValue(selectedContact);
                    }
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ContactPage;
