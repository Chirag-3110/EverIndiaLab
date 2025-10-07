import { Spin } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Loader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      backgroundColor: "#f9fafc",
    }}
  >
    {/* Icon with pulse effect */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "22px",
        fontWeight: "600",
        color: "#1890ff",
        marginBottom: "20px",
        animation: "pulse 1.5s infinite",
      }}
    >
      <img src="/lo.png" alt="Loading.." />
    </div>

    {/* Loader */}
    {/* <Spin size="large" /> */}

    {/* Tagline */}
    <div style={{ marginTop: 16, fontSize: 15, color: "#555" }}></div>

    <style>
      {`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}
    </style>
  </div>
);

export default Loader;
