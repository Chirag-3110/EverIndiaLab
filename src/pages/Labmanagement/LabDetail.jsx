import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Tag, Button, Tabs } from "antd";
import { useGetlabsDetailsQuery } from "../../redux/api/labsApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import moment from "moment";

const { TabPane } = Tabs;

const LabDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: labData, isLoading, isError } = useGetlabsDetailsQuery(id);
  const [activeTab, setActiveTab] = useState("assignTest");

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );

  if (isError || !labData?.response)
    return (
      <p style={{ color: "red", textAlign: "center" }}>Failed to load lab</p>
    );

  const lab = labData.response?.lab;

  return (
    <div style={{ margin: 20 }}>
      <PageBreadcrumb pageTitle={lab.name} />
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back to Labs
      </Button>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Info Card */}
        <div
          style={{
            flex: 1,
            minWidth: 300,
            padding: 24,
            borderRadius: 12,
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>{lab.name}</h2>
          <p>
            <strong>Address:</strong> {lab.address}
          </p>
          <p>
            <strong>Contact:</strong> {lab.contactNumber}
          </p>
          <p>
            <strong>Email:</strong> {lab.email}
          </p>
          <p>
            <strong>Sample Collection:</strong>{" "}
            <Tag color="blue">{lab.sampleCollectionType}</Tag>
          </p>
          <div>
            <strong>Operating Hours:</strong>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {lab.operatingHours.map((op) => (
                <Tag
                  key={op.day}
                  color={op.isClosed ? "red" : "green"}
                  style={{ marginBottom: 4 }}
                >
                  {op.day}:{" "}
                  {op.isClosed
                    ? "Closed"
                    : `${moment(op.openTime).format("hh:mm A")} - ${moment(
                        op.closeTime
                      ).format("hh:mm A")}`}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* Map Card */}
        <div
          style={{
            flex: 1,
            minWidth: 300,
            borderRadius: 12,
            overflow: "hidden",
            height: 400,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <iframe
            title="Lab Location"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${lab.latitude},${lab.longitude}&hl=es;z=15&output=embed`}
            allowFullScreen
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Assign Test" key="assignTest">
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Coming soon...
          </div>
        </TabPane>
        <TabPane tab="Assign Package" key="assignPackage">
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Coming soon...
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default LabDetail;
