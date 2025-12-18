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

/* ================= COMPONENT ================= */

const AddBookingItems = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const USER_ID = state?.userId;
  const familyMemberId = state?.familyMemberId;

  /* ---------------- STATES ---------------- */
  const [activeTab, setActiveTab] = useState("test");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [bookingItems, setBookingItems] = useState<any[]>([]);

  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [preBookingAmount, setPreBookingAmount] = useState<any>(null);

  /* ---------------- API ---------------- */

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

  /* ---------------- TABLE COLUMNS ---------------- */

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

  /* ================= HANDLERS ================= */

  /* ---- Step 1: Pre Booking WITHOUT coupon ---- */
  const handleContinue = async () => {
    try {
      const items = [
        ...selectedTests.map((t) => ({ type: "test", testId: t._id })),
        ...selectedPackages.map((p) => ({
          type: "package",
          packageId: p._id,
        })),
      ];

      setBookingItems(items);
      setSelectedCoupon(null);

      const res = await fetchPreBooking({
        userId: USER_ID,
        items,
      }).unwrap();

      const { message, ...amount } = res.response;
      setPreBookingAmount(amount);
      setSummaryModalOpen(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Pre booking failed");
    }
  };

  /* ---- Step 2: Apply Coupon (Re-call Pre Booking) ---- */
  const handleApplyCoupon = async () => {
    try {
      const res = await fetchPreBooking({
        userId: USER_ID,
        items: bookingItems,
        couponId: selectedCoupon!,
      }).unwrap();

      const { message, ...amount } = res.response;
      setPreBookingAmount(amount);
      toast.success("Coupon applied successfully");
      setCouponModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Coupon apply failed");
    }
  };

  /* ---- Step 3: Final Booking ---- */
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

  /* ---------------- COUPON FILTER ---------------- */

  const filteredCoupons =
    couponRes?.message?.coupons?.filter((c: any) =>
      c.code.toLowerCase().includes(couponSearch.toLowerCase())
    ) || [];

  /* ================= UI ================= */

  return (
    <div className="bg-white p-4 rounded-xl">
      <PageBreadcrumb pageTitle="Add Booking Items" />

      {/* ================= TABS ================= */}
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

      {/* ================= COUPON MODAL ================= */}
      <Modal
        title="Select Coupon"
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Search coupon code"
          value={couponSearch}
          onChange={(e) => setCouponSearch(e.target.value)}
          className="mb-3"
          allowClear
        />

        <Table
          rowKey="_id"
          loading={couponLoading}
          columns={couponColumns}
          dataSource={filteredCoupons}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedCoupon ? [selectedCoupon] : [],
            onSelect: (record) => {
              if (selectedCoupon === record._id) {
                // 🔁 deselect if clicked again
                setSelectedCoupon(null);
              } else {
                setSelectedCoupon(record._id);
              }
            },
          }}
          pagination={false}
        />

        <div className="flex justify-end items-center mt-4 gap-2">
          <Button
            type="primary"
            loading={preLoading}
            disabled={!selectedCoupon}
            onClick={handleApplyCoupon}
          >
            Apply Coupon
          </Button>
          {selectedCoupon && (
            <p
              className="text-sm text-center bg-red-50 w-[200px] px-4 py-2 rounded-md text-red-500 cursor-pointer"
              onClick={() => setSelectedCoupon(null)}
            >
              Remove applied coupon
            </p>
          )}
        </div>
      </Modal>

      {/* ================= SUMMARY MODAL ================= */}
      <Modal
        title="Booking Summary"
        open={summaryModalOpen}
        onCancel={() => setSummaryModalOpen(false)}
        footer={null}
        width={600}
      >
        {/* Header */}{" "}
        <div className="flex justify-between items-center mb-4">
          {" "}
          <div>
            {" "}
            <h3 className="text-lg font-semibold">EverIndia Path Lab</h3>{" "}
            <p className="text-sm text-gray-500">Manual Booking Invoice</p>{" "}
          </div>{" "}
          <div className="text-right text-sm text-gray-500">
            {" "}
            <p>Date: {new Date().toLocaleDateString()}</p> <p>Payment: Cash</p>{" "}
          </div>{" "}
        </div>
        {/* Items Table */}{" "}
        <div className="bg-white rounded-md border mb-4">
          {" "}
          <table className="w-full text-sm">
            {" "}
            <thead className="bg-gray-100">
              {" "}
              <tr>
                {" "}
                <th className="text-left p-2">Item</th>{" "}
                <th className="text-right p-2">Price</th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody>
              {" "}
              {selectedTests.map((t) => (
                <tr key={t._id} className="border-t">
                  {" "}
                  <td className="p-2">{t.title}</td>{" "}
                  <td className="p-2 text-right">₹{t.price}</td>{" "}
                </tr>
              ))}{" "}
              {selectedPackages.map((p) => (
                <tr key={p._id} className="border-t">
                  {" "}
                  <td className="p-2">{p.title}</td>{" "}
                  <td className="p-2 text-right">₹{p.price}</td>{" "}
                </tr>
              ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>
        <div className="flex justify-start mb-3">
          <button
            className="bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded-md text-white text-xs"
            onClick={() => setCouponModalOpen(true)}
          >
            Apply Coupon
          </button>
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="bg-white rounded-md border p-3">
            <div className="flex justify-between mb-2">
              <span>Total Amount</span>
              <span>₹{preBookingAmount?.totalOriginalAmount}</span>
            </div>

            <div className="flex justify-between mb-2 text-green-600">
              <span>Coupon Discount</span>
              <span>- ₹{preBookingAmount?.couponAppliedAmount || 0}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Platform Fee</span>
              <span>₹{preBookingAmount?.platformFee || 0}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Payable Amount</span>
              <span>₹{preBookingAmount?.payableAmount}</span>
            </div>
          </div>

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
