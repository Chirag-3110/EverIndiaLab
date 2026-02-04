import { Button, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useAddNewAddressMutation,
  useEditAddressMutation,
} from "../../../../redux/api/addressApi";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

type Libraries = ("places" | "drawing" | "geometry")[];
const libs: Libraries = ["places"];

// Jaipur config
const JAIPUR_CENTER = { lat: 26.9124, lng: 75.7873 };
const MAX_DISTANCE_KM = 30;

export const AddEditAddressForm = ({
  userId,
  initialData,
  onCancel,
  onSaved,
}) => {
  const [form] = Form.useForm();
  const [addNewAddress] = useAddNewAddressMutation();
  const [editAddress] = useEditAddressMutation();

  const autocompleteRef = useRef<any>(null);

  const [location, setLocation] = useState({
    lat: initialData?.latitude || 0,
    lng: initialData?.longitude || 0,
  });

  const [description, setDescription] = useState(
    initialData?.description || ""
  );



  /* ---------- Helpers ---------- */
  const isPlaceInJaipur = (place) => {
    const components = place.address_components || [];
    return components.some(
      (c) =>
        c.long_name.toLowerCase() === "jaipur" && c.types.includes("locality")
    );
  };

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  /* ---------- Prefill form on edit ---------- */
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        houseNo: initialData.houseNo,
        apartmentName: initialData.streetName,
        landmark: initialData.landmark,
        postalCode: initialData.postalCode,
      });

      setLocation({
        lat: initialData.latitude,
        lng: initialData.longitude,
      });

      setDescription(initialData.description);
    }
  }, [initialData]);

  /* ---------- When place selected ---------- */
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const distance = getDistanceKm(
      JAIPUR_CENTER.lat,
      JAIPUR_CENTER.lng,
      lat,
      lng
    );

    const validCity = isPlaceInJaipur(place);

    if (!validCity && distance > MAX_DISTANCE_KM) {
      toast.error(
        "We are currently operational only in Jaipur and nearby areas."
      );
      setDescription("");
      setLocation({ lat: 0, lng: 0 });
      return;
    }

    setLocation({ lat, lng });
    setDescription(place.formatted_address);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (values) => {
    if (!description || !location.lat) {
      toast.error("Please select a valid Jaipur location from Google");
      return;
    }

    const payload = {
      userId,
      addressType: "normal",
      houseNo: values.houseNo,
      streetName: values.apartmentName,
      landmark: values.landmark,
      description,
      latitude: location.lat,
      longitude: location.lng,
      postalCode: values.postalCode || "",
      ...(initialData && { id: initialData._id }),
    };

    try {
      initialData
        ? await editAddress(payload).unwrap()
        : await addNewAddress(payload).unwrap();

      toast.success(
        initialData
          ? "Address updated successfully"
          : "Address added successfully"
      );

      onCancel();
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      {/* -------- Google Location -------- */}
        <Form.Item label="Search Location" required>
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "in" },
              bounds: {
                north: 27.1,
                south: 26.7,
                east: 76.1,
                west: 75.5,
              },
              strictBounds: false,
            }}
          >
            <Input
              placeholder="Search location on Google Maps"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setLocation({ lat: 0, lng: 0 });
              }}
            />
          </Autocomplete>
        </Form.Item>

      {/* -------- Address Fields -------- */}
      <Form.Item name="houseNo" label="House No" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="apartmentName"
        label="Street / Apartment"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="landmark" label="Landmark">
        <Input />
      </Form.Item>

      <Form.Item name="postalCode" label="Postal Code">
        <Input />
      </Form.Item>

      {/* -------- Buttons -------- */}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Save Address
        </Button>
      </div>
    </Form>
  );
};
