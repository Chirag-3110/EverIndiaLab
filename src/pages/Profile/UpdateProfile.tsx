import React, { useEffect, useRef, useState } from "react";
import { Card, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useUpdateUserProfileMutation } from "../../redux/api/profileApi";
import { useGetlabDetailsQuery } from "../../redux/api/categoryApi";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libs: Libraries = ["places"];

export default function UpdateProfile() {
  const [form] = Form.useForm();
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 0,
    lng: 0,
  });

  const [updateUserProfile, { isLoading: updating }] =
    useUpdateUserProfileMutation();

  const { data: labDetail } = useGetlabDetailsQuery({});

  // IMPORTANT: Antd InputRef, NOT HTMLInputElement
  const addressRef = useRef<any>(null);

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

      setSelectedLocation({
        lat: lab.latitude || 0,
        lng: lab.longitude || 0,
      });
    }
  }, [labDetail]);

  console.log(selectedLocation);

  // Google Autocomplete Setup
  useEffect(() => {
    if (isLoaded && addressRef.current?.input) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressRef.current.input,
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

        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          setSelectedLocation({ lat, lng });
        }
      });
    }
  }, [isLoaded]);

  const handleSubmit = async (values: any) => {
    if (!selectedLocation.lat || !selectedLocation.lng) {
      toast.info("Please select a valid address from suggestions.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("contactNumber", values.phoneNumber);
      fd.append("address", values.address);
      fd.append("latitude", selectedLocation.lat.toString());
      fd.append("longitude", selectedLocation.lng.toString());

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

          {/* GOOGLE AUTOCOMPLETE WORKS NOW */}
          <Form.Item name="address" label="Address">
            <Input
              placeholder="Search address"
              ref={addressRef} // <-- Correct ref for Antd Input
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
