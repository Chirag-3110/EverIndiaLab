import React, { useEffect } from "react";
import { Card, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useUpdateUserProfileMutation } from "../../redux/api/profileApi";
import { useGetlabDetailsQuery } from "../../redux/api/categoryApi";

const UpdateProfile = () => {
  const { updateUser } = useAuth();

  const [updateUserProfile, { isLoading: updating }] =
    useUpdateUserProfileMutation();

  const { data: labDetail, isLoading: labLoading } = useGetlabDetailsQuery({});

  const [form] = Form.useForm();

  // Set form fields from lab profile data whenever labDetail changes
  useEffect(() => {
    if (labDetail?.response?.lab) {
      const lab = labDetail.response.lab;
      form.setFieldsValue({
        name: lab.name || "",
        email: lab.email || "",
        phoneNumber: lab.contactNumber || "",
        address: lab.address || "",
      });
    }
  }, [labDetail, form]);

  // Profile update handler sends only these fields (adjust API as needed)
  const handleProfileUpdate = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("contactNumber", values.phoneNumber);
      formData.append("address", values.address);
      // If you're uploading an image:
      // if (values.categoryImage?.file) {
      //   formData.append('categoryImage', values.categoryImage.file);
      // }

      const response: any = await updateUserProfile({
        id: labDetail?.response?.lab._id,
        formData,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <Card
        title="Update Lab Details"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
      >
        <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
          <Form.Item
            name="name"
            label="Lab Name"
            rules={[{ required: true, message: "Please enter lab name" }]}
          >
            <Input placeholder="Enter lab name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Contact Number">
            <Input placeholder="Enter contact number" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#07868D",
                borderColor: "#07868D",
                color: "white",
                borderRadius: 8,
                width: "100%",
              }}
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Details"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateProfile;
