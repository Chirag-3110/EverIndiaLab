import React, { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useGettestFormQuery } from "../../../redux/api/testFormApi";
import { useGetpackageQuery } from "../../../redux/api/packageApi";
import { useGetCouponQuery } from "../../../redux/api/couponApi";
import {
  useAddGetManualUserFinalBookingDetailsMutation,
  useAddGetManualUserPreBookingDetailsMutation,
} from "../../../redux/api/manualApi";
import { Tabs, Table, Input, Button, Modal } from "antd";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/utils";

const AddBookingItems = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const USER_ID = state?.userId;
  const familyMemberId = state?.familyMemberId;

  const [activeTab, setActiveTab] = useState("test");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

  const [couponSearch, setCouponSearch] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [preBookingAmount, setPreBookingAmount] = useState<any>(null);


  const { data: testRes, isFetching: testLoading } = useGettestFormQuery({
    searchText,
    page,
    pageSize,
  });

  const { data: packageRes, isFetching: packageLoading } = useGetpackageQuery({
    searchText,
    page,
    pageSize,
  });

  const { data: couponRes, isFetching: couponLoading } = useGetCouponQuery("");

  const [fetchPreBooking, { isLoading: preLoading }] =
    useAddGetManualUserPreBookingDetailsMutation();

  const [finalBooking, { isLoading: finalLoading }] =
    useAddGetManualUserFinalBookingDetailsMutation();


  const testColumns = [
    { title: "Test Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Discount Price", dataIndex: "discountPrice" },
  ];

  const packageColumns = [
    { title: "Package Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Discount Price", dataIndex: "discountPrice" },
  ];

  const couponColumns = [
    { title: "Coupon Code", dataIndex: "code" },
    {
      title: "Discount",
      render: (_: any, r: any) =>
        r.discountType === "percentage"
          ? `${r.discountValue}%`
          : `₹${r.discountValue}`,
    },
    {
      title: "Valid From",
      dataIndex: "validFrom",
      render: formatDate,
    },
    {
      title: "Valid Till",
      dataIndex: "validTill",
      render: formatDate,
    },
  ];


  const handleContinue = async () => {
    try {
      const items = [
        ...selectedTests.map((t) => ({ type: "test", testId: t._id })),
        ...selectedPackages.map((p) => ({
          type: "package",
          packageId: p._id,
        })),
      ];

      const res = await fetchPreBooking({
        userId: USER_ID,
        items,
        couponId: selectedCoupon || undefined,
      }).unwrap();

      const { message, ...amount } = res.response;
      setPreBookingAmount(amount);
      setSummaryModalOpen(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Pre booking failed");
    }
  };


  const handleFinalBooking = async () => {
    try {
      const itemsFinal = [
        ...selectedTests.map((t) => ({
          itemType: "TestForm",
          itemId: t._id,
          price: t.price,
        })),
        ...selectedPackages.map((p) => ({
          itemType: "Package",
          itemId: p._id,
          price: p.price,
        })),
      ];

      const formData = new FormData();
      formData.append("userId", USER_ID);
      formData.append("paymentType", "cash");
      if (familyMemberId) formData.append("familyMemberId", familyMemberId);
      if (selectedCoupon) formData.append("offerId", selectedCoupon);
      formData.append("items", JSON.stringify(itemsFinal));
      formData.append(
        "amount",
        JSON.stringify({
          total: preBookingAmount?.totalOriginalAmount,
          discount: preBookingAmount?.couponAppliedAmount || 0,
          finalAmount: preBookingAmount?.payableAmount,
          platformFee: preBookingAmount?.platformFee || 0,
          collectiontype: "Lab Visit",
        })
      );

      await finalBooking(formData).unwrap();
      toast.success("Booking completed successfully");
      navigate("/booking-list");
    } catch (err: any) {
      toast.error(err?.data?.message || "Final booking failed");
    }
  };

  const filteredCoupons =
    couponRes?.message?.coupons?.filter((c: any) =>
      c.code.toLowerCase().includes(couponSearch.toLowerCase())
    ) || [];

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white p-4 rounded-xl">
      <PageBreadcrumb pageTitle="Add Booking Items" />

      {/* Coupon Button */}
      <div className="flex justify-end mb-3">
        <Button onClick={() => setCouponModalOpen(true)}>
          Apply Coupon (Optional)
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPage(1);
          setSearchText("");
        }}
        items={[
          {
            key: "test",
            label: "Tests",
            children: (
              <>
                <Input.Search
                  placeholder="Search test"
                  onSearch={(v) => {
                    setSearchText(v);
                    setPage(1);
                  }}
                  className="mb-3"
                />

                <Table
                  rowKey="_id"
                  loading={testLoading}
                  columns={testColumns}
                  dataSource={testRes?.response?.testForms || []}
                  rowSelection={{
                    selectedRowKeys: selectedTests.map((i) => i._id),
                    onChange: (_, rows) => setSelectedTests(rows),
                  }}
                  pagination={{
                    current: testRes?.response?.pagination?.currentPage || page,
                    pageSize,
                    total: testRes?.response?.pagination?.totalCount || 0,
                    onChange: (p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: "package",
            label: "Packages",
            children: (
              <>
                <Input.Search
                  placeholder="Search package"
                  onSearch={(v) => {
                    setSearchText(v);
                    setPage(1);
                  }}
                  className="mb-3"
                />

                <Table
                  rowKey="_id"
                  loading={packageLoading}
                  columns={packageColumns}
                  dataSource={packageRes?.response?.packages || []}
                  rowSelection={{
                    selectedRowKeys: selectedPackages.map((i) => i._id),
                    onChange: (_, rows) => setSelectedPackages(rows),
                  }}
                  pagination={{
                    current: page,
                    pageSize,
                    total: packageRes?.response?.pagination?.totalCount || 0,
                    onChange: (p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    },
                  }}
                />
              </>
            ),
          },
        ]}
      />

      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          disabled={!selectedTests.length && !selectedPackages.length}
          loading={preLoading}
          onClick={handleContinue}
        >
          Next
        </Button>
      </div>

      <Modal
        title="Select Coupon"
        open={couponModalOpen}
        onCancel={() => {
          setCouponModalOpen(false);
          setCouponSearch("");
        }}
        footer={null}
      >
        {/* 🔍 Search Coupon */}
        <Input.Search
          placeholder="Search coupon code"
          allowClear
          value={couponSearch}
          onChange={(e) => setCouponSearch(e.target.value)}
          className="mb-3"
        />

        <Table
          rowKey="_id"
          loading={couponLoading}
          columns={couponColumns}
          dataSource={filteredCoupons}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedCoupon ? [selectedCoupon] : [],
            onChange: (keys) => setSelectedCoupon(keys[0] as string),
          }}
          pagination={false}
        />

        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            disabled={!selectedCoupon}
            onClick={() => setCouponModalOpen(false)}
          >
            Apply
          </Button>
        </div>
      </Modal>

      <Modal
        title="Booking Summary"
        open={summaryModalOpen}
        onCancel={() => setSummaryModalOpen(false)}
        footer={null}
        width={600}
      >
        {/* 🧾 Bill Container */}
        <div className="border rounded-lg p-4 bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">EverIndia Path Lab</h3>
              <p className="text-sm text-gray-500">Manual Booking Invoice</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Payment: Cash</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-md border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedTests.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td className="p-2">{t.title}</td>
                    <td className="p-2 text-right">₹{t.price}</td>
                  </tr>
                ))}

                {selectedPackages.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.title}</td>
                    <td className="p-2 text-right">₹{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-md border p-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Total Amount</span>
              <span>₹{preBookingAmount?.totalOriginalAmount}</span>
            </div>

            <div className="flex justify-between text-sm mb-1 text-green-600">
              <span>Coupon Discount</span>
              <span>- ₹{preBookingAmount?.couponAppliedAmount || 0}</span>
            </div>

            <div className="flex justify-between text-sm mb-1">
              <span>Platform Fee</span>
              <span>₹{preBookingAmount?.platformFee || 0}</span>
            </div>

            <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-base">
              <span>Payable Amount</span>
              <span>₹{preBookingAmount?.payableAmount}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-5">
            <Button
              type="primary"
              size="large"
              loading={finalLoading}
              onClick={handleFinalBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddBookingItems;
