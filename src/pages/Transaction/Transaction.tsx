import React from "react";
import { Tabs, Table, Button } from "antd";
import jsPDF from "jspdf";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import autoTable from "jspdf-autotable";

const { TabPane } = Tabs;

const dummyDebitData = [
  {
    key: 1,
    date: "2025-08-01",
    description: "Payment to Supplier",
    amount: 150,
    transactionId: "D1001",
  },
  {
    key: 2,
    date: "2025-08-05",
    description: "Refund Issued",
    amount: 50,
    transactionId: "D1002",
  },
];

const dummyCreditData = [
  {
    key: 1,
    date: "2025-08-02",
    description: "Sale Income",
    amount: 200,
    transactionId: "C1001",
  },
  {
    key: 2,
    date: "2025-08-06",
    description: "Bank Interest",
    amount: 20,
    transactionId: "C1002",
  },
];

const columns = [
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Description", dataIndex: "description", key: "description" },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (val) => `$${val.toFixed(2)}`,
  },
  { title: "Transaction ID", dataIndex: "transactionId", key: "transactionId" },
];

const Transaction = () => {
  // Function to generate PDF invoice for transactions
const downloadInvoice = (type: string, data: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Transaction History - ${type}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  const tableColumn = ["Date", "Description", "Amount", "Transaction ID"];
  const tableRows = data.map((txn) => [
    txn.date,
    txn.description,
    `$${txn.amount.toFixed(2)}`,
    txn.transactionId,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save(`Transaction_History_${type}.pdf`);
};


  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb pageTitle="Transaction History" />
      <Tabs defaultActiveKey="debit" animated type="line">
        <TabPane tab="Debit" key="debit">
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={() => downloadInvoice("Debit", dummyDebitData)}
          >
            Download Debit Invoice
          </Button>
          <Table
            dataSource={dummyDebitData}
            columns={columns}
            pagination={false}
          />
        </TabPane>

        <TabPane tab="Credit" key="credit">
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={() => downloadInvoice("Credit", dummyCreditData)}
          >
            Download Credit Invoice
          </Button>
          <Table
            dataSource={dummyCreditData}
            columns={columns}
            pagination={false}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Transaction;
