import { useState, useEffect } from "react"; 
import { Plus, X, Search } from "lucide-react";
import { BASE_URL } from "../api/BaseUrl";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as numberToWords from 'number-to-words';
import invertio from '../images/invertio.jpeg'
// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottom: '2 solid #e5e7eb',
    paddingBottom: 8
  },
  companyInfo: {
    flex: 1
  },
  invoiceInfo: {
    textAlign: 'right'
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5
  },
  text: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3
  },
  bold: {
    fontWeight: 400
  },
  section: {
    marginBottom: 8
  },
  table: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 350
  },
  tableCell: {
    padding: 8,
    flex: 1,
    fontSize: 9
  },
  tableCellRight: {
    padding: 8,
    flex: 1,
    textAlign: 'right',
    fontSize: 9
  },
  totalRow: {
    backgroundColor: '#e3f2fd',
    fontWeight: 200
  },
  bankDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 8
  },
  notes: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderLeft: '4 solid #3b82f6'
  },
  circleContainer: {
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  redText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold'
  },
  greyText: {
    color: 'grey',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

// Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Create Invoice Document component
const InvoiceDocument = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Image 
            src={invertio} 
            style={{ width: 80, height: 80, marginBottom: 10 }}
          />
          <Text style={styles.title}>Invertio Solutions</Text>
          <Text style={styles.text}>5 Penn Plaza, 14th Floor, New York, NY 10001, US</Text>
          <Text style={styles.text}>GSTIN: 36AAHCJ2304M1ZK</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={styles.text}><Text style={styles.bold}>Invoice #:</Text> {invoice.id}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Invoice Date:</Text> {formatDate(invoice.createdAt)}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Due Date:</Text> {formatDate(invoice.due_date)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Bill to:</Text>
        <Text style={[styles.text, styles.bold]}>{invoice.customerName}</Text>
        <Text style={styles.text}>Customer ID: {invoice.customerId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Service Details:</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Return Type</Text>
            <Text style={styles.tableCellRight}>Amount (USD)</Text>
          </View>
          
          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
            {/* <Text style={styles.tableCellRight}>${invoice.invoiceAmount.toFixed(2)}</Text> */}
          </View>
          
          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
            {/* <Text style={styles.tableCellRight}>${invoice.invoiceAmount.toFixed(2)}</Text> */}
          </View>
          
          {/* Subtotal Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, {textAlign: 'right', fontSize: 9}]}>Subtotal</Text>
            {/* <Text style={[styles.tableCellRight, {fontSize: 9}]}>${invoice.invoiceAmount.toFixed(2)}</Text> */}
          </View>
          
          {/* Payment Platform Fee Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, {textAlign: 'right', fontSize: 9}]}>Payment Platform Fee</Text>
            <Text style={[styles.tableCellRight, {fontSize: 9}]}>$19.00</Text>
          </View>
          
          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.bold]}></Text>
            <Text style={[styles.tableCell, styles.bold, {textAlign: 'right', fontSize: 9}]}>Total</Text>
            {/* <Text style={[styles.tableCellRight, styles.bold, {fontSize: 9}]}>${(invoice.invoiceAmount + 19).toFixed(2)}</Text> */}
          </View>
          
          {/* Total in Words Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.bold, {textAlign: 'center', fontSize: 9}]} colSpan={3}>
              Total in words: {numberToWords.toWords(invoice.invoiceAmount + 19).replace(/\b\w/g, l => l.toUpperCase())} Dollars Only
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bankDetails}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
          <View style={styles.circleContainer}>
            <Text>
              <Text style={styles.redText}>CF</Text>
              <Text style={styles.greyText}>SB</Text>
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={[styles.subtitle, styles.bold]}>Bank Details:</Text>
            <Text style={styles.text}><Text style={styles.bold}>Bank Name:</Text> Community Federal Savings Bank</Text>
            <Text style={styles.text}><Text style={styles.bold}>Account Holder:</Text> INVERTIO SOLUTIONS PRIVATE LIMITED</Text>
            <Text style={styles.text}><Text style={styles.bold}>Account Number:</Text> 8331054346</Text>
            <Text style={styles.text}><Text style={styles.bold}>ACH Routing Number:</Text> 026073150</Text>
            <Text style={styles.text}><Text style={styles.bold}>Fedwire Routing Number:</Text> 026073008</Text>
            <Text style={styles.text}><Text style={styles.bold}>Address:</Text> 5 Penn Plaza, 14th Floor, New York, NY 10001, US</Text>
          </View>
        </View>
      </View>

      <View style={styles.notes}>
        <Text style={[styles.text, styles.bold]}>Notes:</Text>
        <Text style={styles.text}>Thank you for your continued trust in our services.</Text>
      </View>
    </Page>
  </Document>
);

export default function Invoices() {
  const { addNotification } = useNotifications();
  
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [taxReturns, setTaxReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLineItem, setShowLineItem] = useState(false);
  const [apiLoading, setApiLoading] = useState({
    invoices: false,
    customers: false,
    taxReturns: false,
    createInvoice: false,
  });
  const [viewInvoice, setViewInvoice] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredInvoices = invoices?.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.id.toString().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.return_id.toString().includes(q) ||
      inv.invoice_amount.toString().includes(q) ||
      inv.status.toLowerCase().includes(q) ||
      new Date(inv.due_date).toLocaleDateString().toLowerCase().includes(q) ||
      inv.createdby_type.toLowerCase().includes(q) ||
      inv.createdby_id.toString().includes(q)
    );
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [invoiceType, setInvoiceType] = useState(null);
  const userToken = localStorage.getItem("token");
  const loginId = localStorage.getItem("loginId");
  const role = localStorage.getItem("role");
  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [invoiceData, setInvoiceData] = useState({
    customer_id: "",
    return_id: "",
    line_items: [{ description: "", hours: 0, rate: 0, amount: 0 }],
    no_of_hours: 0,
    status: "pending",
    due_date: "",
    createdby_type: role || "",
    createdby_id: loginId || "",
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const setLoadingState = (key, value) => {
    setApiLoading((prev) => ({ ...prev, [key]: value }));
  };

  const loadCustomers = async () => {
    try {
      setLoadingState("customers", true);
      const response = await fetch(`${BASE_URL}/api/allCustomers`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setCustomers(data.users);
    } catch (error) {
      addNotification({
        title: "Status",
        body: `${error}`,
        level: "error",
      });
    } finally {
      setLoadingState("customers", false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoadingState("invoices", true);
      const response = await fetch(`${BASE_URL}/api/getAllInvoices`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setInvoices(data || []);
    } catch (error) {
      // console.error("Error loading invoices:", error);
    } finally {
      setLoadingState("invoices", false);
      setIsLoading(false);
    }
  };

  // Fetch returns for selected customer
  useEffect(() => {
    const fetchCustomerReturns = async () => {
      if (!selectedCustomer) return;

      try {
        setLoadingState("taxReturns", true);
        const response = await fetch(
          `${BASE_URL}/api/tax-returns/${selectedCustomer.customerId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const data = await response.json();
        setTaxReturns(data);
      } catch (error) {
        // console.error("Error fetching returns:", error);
      } finally {
        setLoadingState("taxReturns", false);
      }
    };
    fetchCustomerReturns();
  }, [selectedCustomer]);

  const addLineItem = () => {
    setShowLineItem(true);
    setInvoiceData((prev) => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        invoiceType === "hourly"
          ? { description: "", hours: 1, rate: 0, amount: 0 }
          : { description: "", amount: 0 },
      ],
    }));
  };

  const removeLineItem = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...invoiceData.line_items];
    updatedLineItems[index][field] = value;

    if (field === "hours" || field === "rate") {
      updatedLineItems[index].amount =
        (Number(updatedLineItems[index].hours) || 0) *
        (Number(updatedLineItems[index].rate) || 0);
    }

    setInvoiceData((prev) => ({
      ...prev,
      line_items: updatedLineItems,
    }));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setTaxReturns([]);
    setSelectedReturn(null);
    setInvoiceType(null);
    setInvoiceData((prev) => ({ ...prev, customer_id: customer.customerId }));
  };

  const handleReturnSelect = (returnItem) => {
    setSelectedReturn(returnItem);
    setInvoiceType(
      returnItem.pricing_type === "hourly"
        ? "hourly"
        : returnItem.pricing_type === "lumpsum"
        ? "lumpsum"
        : ""
    );
    setInvoiceData((prev) => ({
      ...prev,
      return_id: returnItem.id,
      line_items: [],
    }));
  };

  // const handleCreateInvoice = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setLoadingState("createInvoice", true);

  //     let payload;
  //     if (invoiceType === "hourly") {
  //       payload = {
  //         customer_id: invoiceData.customer_id,
  //         return_id: invoiceData.return_id,
  //         line_items: invoiceData.line_items.map((item) => ({
  //           description: item.description,
  //           hours: Number(item.hours) || 0,
  //           rate: Number(item.rate) || 0,
  //           amount: Number(item.amount) || 0,
  //         })),
  //         no_of_hours: invoiceData.no_of_hours,
  //         updated_by_id: loginId,
  //         status: invoiceData.status,
  //         due_date: invoiceData.due_date,
  //         createdby_type: role,
  //         createdby_id: loginId,
  //       };
  //     } else if (invoiceType === "lumpsum") {
  //       payload = {
  //         customer_id: invoiceData.customer_id,
  //         return_id: invoiceData.return_id,
  //         line_items: invoiceData.line_items.map((item) => ({
  //           description: item.description,
  //           amount: Number(item.amount) || 0,
  //         })),
  //         updated_by_id: loginId,
  //         status: invoiceData.status,
  //         due_date: invoiceData.due_date,
  //         createdby_type: role,
  //         createdby_id: loginId,
  //       };
  //     }

  //     const response = await fetch(`${BASE_URL}/api/create-invoice`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await response.json()
  //     if (response.ok) {
  //       addNotification({
  //         title: "Status",
  //         body: `${response?.message || 'Invoice created successfully'}`,
  //         level: "success",
  //       });
  //       setShowCreateModal(false);
  //       setSelectedCustomer(null);
  //       setSelectedReturn(null);
  //       setInvoiceData({
  //         customer_id: "",
  //         return_id: "",
  //         line_items: [],
  //         no_of_hours: 0,
  //         status: "pending",
  //         due_date: "",
  //         createdby_type: role || "",
  //         createdby_id: loginId || "",
  //       });
  //       loadInvoices();
  //     } else {
  //       addNotification({
  //         title: "Status",
  //         body: `${data?.error || 'Price not set, please set the price first'}`,
  //         level: "error",
  //       });
  //     }
  //   } catch (error) {
  //     addNotification({
  //       title: "Status",
  //       body: "Error creating invoice",
  //       level: "error",
  //     });
  //   } finally {
  //     setLoadingState("createInvoice", false);
  //   }
  // };


  const handleCreateInvoice = async (e) => {
  e.preventDefault();
  try {
    setLoadingState("createInvoice", true);

    let payload = {
      customer_id: invoiceData.customer_id,
      return_id: invoiceData.return_id,
      line_items: [],
      updated_by_id: loginId,
      status: invoiceData.status,
      due_date: invoiceData.due_date,
      createdby_type: role,
      createdby_id: loginId,
    };

    if (invoiceType === "hourly") {
      payload.line_items = invoiceData.line_items.map((item) => ({
        description: item.description,
        hours: Number(item.hours) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0,
      }));
      payload.no_of_hours = invoiceData.no_of_hours;
    } else if (invoiceType === "lumpsum") {
      payload.line_items = invoiceData.line_items.map((item) => ({
        description: item.description,
        amount: Number(item.amount) || 0,
      }));
    } else {
      // ✅ Fallback: send all fields generically
      payload.line_items = invoiceData.line_items.map((item) => ({
        description: item.description,
        hours: Number(item.hours) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0,
      }));
      if (invoiceData.no_of_hours) {
        payload.no_of_hours = invoiceData.no_of_hours;
      }
    }

    const response = await fetch(`${BASE_URL}/api/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      addNotification({
        title: "Status",
        body: `${data?.message || "Invoice created successfully"}`,
        level: "success",
      });
      setShowCreateModal(false);
      setSelectedCustomer(null);
      setSelectedReturn(null);
      setInvoiceData({
        customer_id: "",
        return_id: "",
        line_items: [],
        no_of_hours: 0,
        status: "pending",
        due_date: "",
        createdby_type: role || "",
        createdby_id: loginId || "",
      });
      loadInvoices();
    } else {
      addNotification({
        title: "Status",
        body: `${data?.error || "Price not set, please set the price first"}`,
        level: "error",
      });
    }
  } catch (error) {
    addNotification({
      title: "Status",
      body: "Error creating invoice",
      level: "error",
    });
  } finally {
    setLoadingState("createInvoice", false);
  }
};

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const handleDownloadInvoice = async (invoice) => {
    setIsDownloading(true);
    try {
      // Prepare invoice data for PDF
      const pdfInvoice = {
        id: invoice.id,
        createdAt: invoice.created_at,
        dueDate: invoice.due_date,
        customerName: invoice.customer_name,
        customerId: invoice.customer_id,
        returnType: invoice.return_type,
        returnName: invoice.return_name,
        invoiceAmount: invoice.invoice_amount
      };
      
      const blob = await pdf(<InvoiceDocument invoice={pdfInvoice} />).toBlob();
      saveAs(blob, `invoice-${invoice.id}.pdf`);
    } catch (error) {
      addNotification({
        title: "Error",
        body: "Failed to generate PDF",
        level: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && !showCreateModal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 ml-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => {
            loadCustomers();
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          disabled={apiLoading.customers}
        >
          {apiLoading.customers ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4 p-4">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {apiLoading.invoices ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  SN
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Return ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Created By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-gray-50 transition-colors  ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {inv.customer_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.return_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(inv.invoice_amount)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        inv.status === "paid"
                          ? "text-green-600"
                          : inv.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {inv.status}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {inv.createdby_type} #{inv.createdby_id}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <button
                        onClick={() => setViewInvoice(inv)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto relative">
            <button 
              onClick={() => setViewInvoice(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <img src={invertio} alt="full-logo" className="w-20 h-20" />
                <h3 className="font-bold text-gray-900 mb-2">Invertio Solutions</h3>
                <p className="text-sm text-gray-700">5 Penn Plaza, 14th Floor, New York, NY 10001, US</p>
                <p className="text-sm text-gray-700 mt-1">GSTIN: 36AAHCJ2304M1ZK</p>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">TAX INVOICE</h1>
                <div className="mt-2 text-sm text-black">
                  <p><span className="font-medium">Invoice #:</span> {viewInvoice.id}</p>
                  <p><span className="font-medium">Invoice Date:</span> {formatDate(viewInvoice.created_at)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(viewInvoice.due_date)}</p>
                  <p><span className="font-medium">Payment terms:</span> Immediate</p>
                  <p><span className="font-medium">Accepted Methods:</span> ACH & Fedwire</p>
                </div>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              {/* Company and Bill To Section */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-gray-400 mb-2">Bill to:</h3>
                  <p className="text-sm text-black font-bold">{viewInvoice.customer_name}</p>
                  <p className="text-sm text-gray-700">Customer ID: {viewInvoice.customer_id}</p>
                </div>
              </div>
              
              {/* Items Table */}
              <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-md">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-bold text-black border-b border-gray-200">Description</th>
                      <th className="py-3 px-4 text-left text-sm font-bold text-black border-b border-gray-200">Return Type</th>
                      <th className="py-3 px-4 text-right text-sm font-bold text-black border-b border-gray-200">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-700 border-b border-gray-200">{viewInvoice.return_name || 'Tax Preparation Service'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 border-b border-gray-200">{viewInvoice.return_type || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 text-right border-b border-gray-200">${typeof viewInvoice.invoice_amount === 'number' ? viewInvoice.invoice_amount.toFixed(2) : 'N/A'}</td>
                    </tr>
                    
                    {/* Total row */}
                    <tr className="bg-blue-100">
                      <td className="py-4 px-4 text-lg font-bold text-gray-900" colSpan={2}>Total (USD)</td>
                      <td className="py-4 px-4 text-lg font-bold text-gray-900 text-right">$${typeof viewInvoice.invoice_amount === 'number' ? viewInvoice.invoice_amount.toFixed(2) : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Bank Details */}
              <h3 className="font-bold text-gray-400 mb-3">Bank details:</h3>
              
              <div className="bg-gray-100 border border-gray-200 text-black rounded-lg p-4 mb-6 flex gap-3">
                <div className="rounded-full w-20 h-16 flex justify-center items-center border border-gray-200 bg-white">
                  <p className="text-gray-700 font-bold"> <span className="text-red-700 font-bold">CF</span>SB</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><span className="font-medium text-black">Payment method:</span> ACH or Fedwire</p>
                    <p><span className="font-medium text-black">Account number:</span> 8331054346</p>
                    <p><span className="font-medium text-black">ACH routing number:</span> 026073150</p>
                    <p><span className="font-medium text-black">Fedwire routing number:</span> 026073008</p>
                    <p><span className="font-medium text-black">Account type:</span> Business checking account</p>
                    <p><span className="font-medium text-black">Bank name:</span> Community Federal Savings Bank</p>
                    <p><span className="font-medium text-black">Beneficiary address:</span> 5 Penn Plaza, 14th Floor, New York, NY 10001, US</p>
                    <p><span className="font-medium text-black">Account holder name:</span> INVERTIO SOLUTIONS PRIVATE LIMITED</p>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div className="text-sm text-gray-700">
                <p className="font-medium">Notes</p>
                <p>Thank you for your continued trust in our services.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleDownloadInvoice(viewInvoice)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Close button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Create Invoice
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={apiLoading.createInvoice}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Customer Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  1. Select Customer
                </h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="pl-10 pr-4 py-2 border rounded w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {apiLoading.customers ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.customerId}
                        className={`p-4 border rounded cursor-pointer ${
                          selectedCustomer?.customerId === c.customerId
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleCustomerSelect(c)}
                      >
                        <h4 className="font-medium">{c.customerName}</h4>
                        <p className="text-sm text-gray-600">
                          {c.customerEmail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Returns Section */}
              {selectedCustomer && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    2. Select Return
                  </h3>
                  {apiLoading.taxReturns ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : taxReturns.length > 0 ? (
                    <div className="overflow-x-auto max-h-60 border rounded">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2">Pricing</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Price</th>
                            <th className="px-3 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxReturns.map((r) => (
                            <tr
                              key={r.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                selectedReturn?.id === r.id ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="px-3 py-2">{r.return_type}</td>
                              <td className="px-3 py-2 font-medium">
                                {r.pricing_type === "hourly"
                                  ? "Hourly"
                                  : r.pricing_type === "lumpsum"
                                  ? "Lumpsum"
                                  : " "}
                              </td>
                              <td className="px-3 py-2">{r.status}</td>
                              <td className="px-3 py-2">${r.price || "N/A"}</td>
                              <td className="px-3 py-2">
                                <button
                                  className="text-blue-600"
                                  onClick={() => handleReturnSelect(r)}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No returns found for this customer.
                    </p>
                  )}
                </div>
              )}

              {/* Invoice Details Section */}
              {selectedReturn && (
                <form onSubmit={handleCreateInvoice} className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    3. Invoice Details (
                    {invoiceType === "hourly"
                      ? "Hourly"
                      : invoiceType === "lumpsum"
                      ? "Lumpsum"
                      : ""}
                    )
                  </h3>

                  {invoiceType === "hourly" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Number of Hours
                      </label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={invoiceData.no_of_hours || ""}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            no_of_hours: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="border p-2 rounded"
                      required
                      value={invoiceData.status}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option required value="pending">Pending</option>
                    </select>
                    <input
                    required
                      type="date"
                      className="border p-2 rounded"
                      value={invoiceData.due_date}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  
                  {/* Line Items */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Line Items</span>
                      <button
                        type="button"
                        onClick={addLineItem}
                        className="text-sm text-blue-600"
                      >
                        + Add Item
                      </button>
                    </div>

                    {invoiceData.line_items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                        <input
                          type="text"
                          className="col-span-5 border p-2 rounded"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />

                        {invoiceType === "hourly" && (
                          <>
                            <input
                              type="number"
                              className="col-span-2 border p-2 rounded"
                              placeholder="Hours"
                              value={item.hours || ""}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "hours",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              className="col-span-2 border p-2 rounded"
                              placeholder="Rate"
                              value={item.rate || ""}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "rate",
                                  e.target.value
                                )
                              }
                            />
                          </>
                        )}

                        <input
                          type="number"
                          className={
                            invoiceType === "hourly"
                              ? "col-span-2 border p-2 rounded"
                              : "col-span-5 border p-2 rounded"
                          }
                          placeholder="Amount"
                          value={item.amount || ""}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "amount",
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="col-span-1 text-red-600"
                          onClick={() => removeLineItem(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="text-right font-semibold">
                    Total:{" "}
                    {formatCurrency(
                      invoiceData.line_items.reduce(
                        (sum, item) => sum + (Number(item.amount) || 0),
                        0
                      )
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border rounded"
                      disabled={apiLoading.createInvoice}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
                      disabled={apiLoading.createInvoice}
                    >
                      {apiLoading.createInvoice && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      Create Invoice
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}