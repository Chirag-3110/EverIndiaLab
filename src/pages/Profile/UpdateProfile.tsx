import React, { useEffect, useRef } from "react";
import { Card, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useUpdateUserProfileMutation } from "../../redux/api/profileApi";
import { useGetlabDetailsQuery } from "../../redux/api/categoryApi";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libs: Libraries = ["places"];

export default function UpdateProfile() {
  const [form] = Form.useForm();
  const [updateUserProfile, { isLoading: updating }] =
    useUpdateUserProfileMutation();

  const { data: labDetail } = useGetlabDetailsQuery({});

  // 👉 Must be HTML input element for Google Autocomplete
  const addressRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_KEY,
    libraries: libs,
  });

  // Prefill form
  useEffect(() => {
    if (labDetail?.response?.lab) {
      const lab = labDetail.response.lab;

      form.setFieldsValue({
        name: lab.name,
        email: lab.email,
        phoneNumber: lab.contactNumber,
        address: lab.address,
      });
    }
  }, [labDetail]);

  // Google Autocomplete Setup
  useEffect(() => {
    if (isLoaded && addressRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        addressRef.current,
        {
          fields: ["formatted_address", "geometry"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place?.formatted_address) {
          form.setFieldsValue({
            address: place.formatted_address,
          });
        }
      });
    }
  }, [isLoaded]);

  const handleSubmit = async (values: any) => {
    try {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("contactNumber", values.phoneNumber);
      fd.append("address", values.address);

      await updateUserProfile({
        id: labDetail?.response?.lab._id,
        formData: fd,
      }).unwrap();

      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <Card title="Update Lab Details" style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Lab Name" rules={[{ required: true }]}>
            <Input placeholder="Enter lab name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Contact Number">
            <Input placeholder="Enter contact number" />
          </Form.Item>

          {/* PERFECT GOOGLE AUTOCOMPLETE */}
          <Form.Item name="address" label="Address">
            <Input
              placeholder="Search address"
              defaultValue={labDetail?.response?.lab?.address}
              ref={(el) => {
                // el = Antd Input component instance
                // el?.input = the REAL HTML input element
                addressRef.current = el?.input || null;
              }}
              onChange={(e) => {
                form.setFieldsValue({ address: e.target.value });
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              style={{ width: "100%", backgroundColor: "#1F9298" }}
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Details"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
