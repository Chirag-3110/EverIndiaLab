import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetsocialMediasQuery,
  useEditsocialMediaMutation,
} from "../../redux/api/socialMediaApi";

const SiteSetting = () => {
  const { data, isLoading } = useGetsocialMediasQuery();
  const [editSocialMedia, { isLoading: isSaving }] =
    useEditsocialMediaMutation();
  const [form] = Form.useForm();

  const [isEditing, setIsEditing] = useState(false);
  const [socialMediaFields, setSocialMediaFields] = useState<
    { name: string; url: string; key: string }[]
  >([]);

  // Populate form fields from API on load or when data changes
  useEffect(() => {
    if (data?.response?.setting?.socialMedia) {
      const fields = data.response.setting.socialMedia.map((item) => ({
        name: item.name,
        url: item.url,
        key: item._id, // use _id as unique key
      }));
      setSocialMediaFields(fields);

      // Pre-fill form with the url values keyed by index or key
      const initialValues = {};
      fields.forEach((item, idx) => {
        initialValues[`url_${item.key}`] = item.url;
      });
      form.setFieldsValue(initialValues);
    }
  }, [data, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Map form values back to socialMedia array with name and url
      const updatedSocialMedia = socialMediaFields.map((item) => ({
        name: item.name,
        url: values[`url_${item.key}`] || "",
      }));

      // Call mutation with socialMedia array only, per your API
      await editSocialMedia({
        formData: { socialMedia: updatedSocialMedia },
      }).unwrap();

      toast.success("Site settings updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update site settings");
    }
  };

  if (isLoading) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Loading site settings...
      </p>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
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
              padding: "0 12px",
            }}
          >
            <span style={{ color: "#07868D", fontWeight: 700, fontSize: 22 }}>
              Site Settings
            </span>
            {!isEditing ? (
              <Button
                type="primary"
                onClick={() => setIsEditing(true)}
                style={{ backgroundColor: "#07868D", borderColor: "#07868D" }}
                icon={<EditOutlined />}
              />
            ) : null}
          </div>
        }
        bordered
        style={{
          boxShadow: "0 4px 20px #07868D40",
          borderTop: "4px solid #07868D",
        }}
        headStyle={{ padding: "12px" }}
      >
        <Form form={form} layout="vertical" disabled={!isEditing}>
          {socialMediaFields.map((item) => (
            <Form.Item
              key={item.key}
              label={item.name}
              name={`url_${item.key}`}
              rules={[
                { required: true, message: `Please enter ${item.name} URL` },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder={`Enter ${item.name} URL`} />
            </Form.Item>
          ))}

          {isEditing && (
            <Form.Item>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => {
                    form.resetFields();
                    // Reset form to original values
                    const initialValues = {};
                    socialMediaFields.forEach((item) => {
                      initialValues[`url_${item.key}`] = item.url;
                    });
                    form.setFieldsValue(initialValues);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={isSaving}
                  onClick={handleSave}
                  icon={<Save size={16} />}
                >
                  Save
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default SiteSetting;
