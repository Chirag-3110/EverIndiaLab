import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Tag, Button, Tabs, Card, Descriptions } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetpackageDetailsQuery } from "../../redux/api/packageApi";

const { TabPane } = Tabs;

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: packageData,
    isLoading,
    isError,
  } = useGetpackageDetailsQuery(id);
  const [activeTab, setActiveTab] = useState("assignTest");

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );
  if (isError || !packageData?.response)
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        Failed to load package details
      </p>
    );

  const Package = packageData.response?.package;

  // Aggregate sampleType from all included tests (unique values)
  const sampleTypes =
    Package?.includedTests
      ?.flatMap((test:any) => test.sampleType || [])
      .filter((value, index, self) => self.indexOf(value) === index) || [];

  // Aggregate testCriteria from all included tests (unique)
  const testCriterias =
    Package?.includedTests
      ?.flatMap((test:any) => test.testCriteria || [])
      .filter((value, index, self) => self.indexOf(value) === index) || [];

  return (
    <div
      style={{
        margin: 20,
        maxWidth: 1200,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <PageBreadcrumb pageTitle={Package.title} />
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </Button>

      <Card hoverable style={{ borderRadius: 12, marginBottom: 24 }}>
        <Descriptions column={1} bordered size="middle" layout="vertical">
          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Name: {Package.title || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Description: {Package.description || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Included Tests">
            {Package.includedTests && Package.includedTests.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {Package.includedTests.map(({ _id, category, title }) => (
                  <li key={_id}>
                    <strong>{category}:</strong> {title}
                  </li>
                ))}
              </ul>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Sample Type: {sampleTypes.join(", ") || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Report Time: {Package.reportTime || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Test Criteria: {testCriterias.join(", ") || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Age: {Package.age || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Recommended Gender: {Package.recommendedGender || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Specifications">
            {Package.specifications && Package.specifications.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {Package.specifications.map((spec, idx) =>
                  Object.entries(spec).map(([key, value]: [string, any]) => (
                    <li key={`${idx}-${key}`}>
                      {key}: {value}
                    </li>
                  ))
                )}
              </ul>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Prescription Required: {Package.prescriptionRequired ? "Yes" : "No"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Collection Type: {Package.collectionType || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Price: ₹{Package.price?.toLocaleString() || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item
            label=""
            contentStyle={{ display: "flex", gap: "8px" }}
          >
            Discount Price: ₹{Package.discountPrice?.toLocaleString() || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card hoverable style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane tab="Assign Test" key="assignTest">
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "#888",
                fontStyle: "italic",
                fontSize: 16,
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
                fontSize: 16,
              }}
            >
              Coming soon...
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PackageDetails;
