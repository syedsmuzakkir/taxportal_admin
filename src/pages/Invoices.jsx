import { useState, useEffect } from "react"; 
import { Plus, X, Search, FileText, Download, Eye, Calendar, DollarSign, Users, CreditCard } from "lucide-react";
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
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Return Type</Text>
            <Text style={styles.tableCellRight}>Amount (USD)</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, {textAlign: 'right', fontSize: 9}]}>Subtotal</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, {textAlign: 'right', fontSize: 9}]}>Payment Platform Fee</Text>
            <Text style={[styles.tableCellRight, {fontSize: 9}]}>$19.00</Text>
          </View>
          
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.bold]}></Text>
            <Text style={[styles.tableCell, styles.bold, {textAlign: 'right', fontSize: 9}]}>Total</Text>
          </View>
          
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !showCreateModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Loading Invoices</h3>
            <p className="text-slate-600">Fetching your invoice data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Create, manage, and track all your invoices in one place
            </p>
          </div>
          
          <button
            onClick={() => {
              loadCustomers();
              setShowCreateModal(true);
            }}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={apiLoading.customers}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              {apiLoading.customers ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>Create Invoice</span>
            </div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-lg font-semibold text-slate-900">
                {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search invoices by customer, ID, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700 w-full md:w-96"
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          {apiLoading.invoices ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                </div>
                <p className="text-slate-600 font-medium">Loading invoices...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Return ID
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv, idx) => (
                      <tr 
                        key={inv.id}
                        className={`hover:bg-slate-50/80 transition-all duration-200 ${
                          idx % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">#{inv.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-slate-900">
                            {inv.customer_name}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-slate-700">
                            {inv.return_id}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(inv.invoice_amount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl border-2 ${getStatusColor(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {new Date(inv.due_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-700">
                            <div className="font-medium">{inv.createdby_type}</div>
                            <div className="text-xs text-slate-500">#{inv.createdby_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setViewInvoice(inv)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-200 hover:shadow-md border-2 border-blue-200 hover:border-blue-300"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(inv)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl transition-all duration-200 hover:shadow-md border-2 border-emerald-200 hover:border-emerald-300"
                              disabled={isDownloading}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {isDownloading ? 'Loading...' : 'Download'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                            <FileText className="w-12 h-12 text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900">No invoices found</h3>
                            <p className="text-slate-600">
                              {searchQuery ? `No invoices match your search: "${searchQuery}"` : "No invoices available at the moment"}
                            </p>
                          </div>
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Invoice Modal */}
        {viewInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/30">
              <button 
                onClick={() => setViewInvoice(null)}
                className="absolute top-6 right-6 p-3 hover:bg-slate-100 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm shadow-lg"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8 border-b border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img src={invertio} alt="company-logo" className="w-20 h-20 rounded-xl shadow-lg" />
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Invertio Solutions</h3>
                        <p className="text-sm text-slate-600 mt-1">5 Penn Plaza, 14th Floor, New York, NY 10001, US</p>
                        <p className="text-sm text-slate-600">GSTIN: 36AAHCJ2304M1ZK</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      TAX INVOICE
                    </h1>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30">
                      <div className="space-y-1 text-sm">
                        <p><span className="font-semibold text-slate-700">Invoice #:</span> <span className="font-bold text-slate-900">#{viewInvoice.id}</span></p>
                        <p><span className="font-semibold text-slate-700">Invoice Date:</span> {formatDate(viewInvoice.created_at)}</p>
                        <p><span className="font-semibold text-slate-700">Due Date:</span> {formatDate(viewInvoice.due_date)}</p>
                        <p><span className="font-semibold text-slate-700">Payment terms:</span> Immediate</p>
                        <p><span className="font-semibold text-slate-700">Accepted Methods:</span> ACH & Fedwire</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-8 space-y-8">
                {/* Bill To Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-700">Bill to:</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-900">{viewInvoice.customer_name}</p>
                    <p className="text-sm text-slate-600">Customer ID: {viewInvoice.customer_id}</p>
                  </div>
                </div>
                
                {/* Items Table */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Description</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Return Type</th>
                        <th className="py-4 px-6 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{viewInvoice.return_name || 'Tax Preparation Service'}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">{viewInvoice.return_type || 'N/A'}</td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right">
                          ${typeof viewInvoice.invoice_amount === 'number' ? viewInvoice.invoice_amount.toFixed(2) : 'N/A'}
                        </td>
                      </tr>
                      
                      {/* Total row */}
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                        <td className="py-6 px-6 text-lg font-bold text-slate-900" colSpan={2}>Total (USD)</td>
                        <td className="py-6 px-6 text-xl font-bold text-slate-900 text-right">
                          ${typeof viewInvoice.invoice_amount === 'number' ? viewInvoice.invoice_amount.toFixed(2) : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Bank Details */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-700">Bank details:</h3>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-slate-100 flex justify-center items-center border-2 border-slate-200 shadow-lg">
                        <p className="font-bold"> 
                          <span className="text-red-600">CF</span>
                          <span className="text-slate-600">SB</span>
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 text-sm flex-1">
                      <div className="space-y-2">
                        <p><span className="font-semibold text-slate-700">Payment method:</span> <span className="text-slate-900">ACH or Fedwire</span></p>
                        <p><span className="font-semibold text-slate-700">Account number:</span> <span className="text-slate-900 font-mono">8331054346</span></p>
                        <p><span className="font-semibold text-slate-700">ACH routing number:</span> <span className="text-slate-900 font-mono">026073150</span></p>
                        <p><span className="font-semibold text-slate-700">Fedwire routing number:</span> <span className="text-slate-900 font-mono">026073008</span></p>
                      </div>
                      <div className="space-y-2">
                        <p><span className="font-semibold text-slate-700">Account type:</span> <span className="text-slate-900">Business checking account</span></p>
                        <p><span className="font-semibold text-slate-700">Bank name:</span> <span className="text-slate-900">Community Federal Savings Bank</span></p>
                        <p><span className="font-semibold text-slate-700">Beneficiary address:</span> <span className="text-slate-900">5 Penn Plaza, 14th Floor, New York, NY 10001, US</span></p>
                        <p><span className="font-semibold text-slate-700">Account holder name:</span> <span className="text-slate-900">INVERTIO SOLUTIONS PRIVATE LIMITED</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-slate-700 mb-2">Notes</h4>
                  <p className="text-slate-600">Thank you for your continued trust in our services.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => handleDownloadInvoice(viewInvoice)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => setViewInvoice(null)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
              
              {/* Fixed Header */}
              <div className="flex-shrink-0 p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Create New Invoice</h2>
                    <p className="text-slate-600 mt-1">Generate an invoice for your customer</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                    disabled={apiLoading.createInvoice}
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Step 1: Customer Selection - Compact */}
                <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">1</div>
                      Select Customer
                    </h3>
                    {selectedCustomer && (
                      <div className="text-sm text-emerald-600 font-medium">✓ Selected</div>
                    )}
                  </div>
                  
                  {!selectedCustomer ? (
                    <>
                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search customers..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      {/* Customer List */}
                      {apiLoading.customers ? (
                        <div className="flex items-center justify-center h-20">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                          {filteredCustomers.map((c) => (
                            <div
                              key={c.customerId}
                              className="p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
                              onClick={() => handleCustomerSelect(c)}
                            >
                              <div className="font-medium text-slate-900">{c.customerName}</div>
                              <div className="text-sm text-slate-600">{c.customerEmail}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <div className="font-medium text-slate-900">{selectedCustomer.customerName}</div>
                        <div className="text-sm text-slate-600">{selectedCustomer.customerEmail}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCustomer(null);
                          setSelectedReturn(null);
                          setInvoiceType(null);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Return Selection */}
                {selectedCustomer && (
                  <div className="bg-white border-2 border-emerald-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">2</div>
                        Select Return
                      </h3>
                      {selectedReturn && (
                        <div className="text-sm text-emerald-600 font-medium">✓ Selected</div>
                      )}
                    </div>
                    
                    {apiLoading.taxReturns ? (
                      <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
                      </div>
                    ) : taxReturns.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {taxReturns.map((r) => (
                          <div
                            key={r.id}
                            className={`p-4 border rounded-xl transition-all cursor-pointer ${
                              selectedReturn?.id === r.id
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                            }`}
                            onClick={() => handleReturnSelect(r)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{r.return_type}</div>
                                <div className="text-sm text-slate-600 mt-1">
                                  Status: {r.status} | Pricing: {r.pricing_type || "Not set"}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                {r.price ? (
                                  <div className="font-bold text-slate-900">${r.price}</div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="text-sm text-red-600 font-medium">No price set</div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Add navigation logic here to redirect to return pricing page
                                        window.location.href = `/customers/${r.id}`;
                                      }}
                                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      Set Price
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No returns found for this customer.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Invoice Details */}
                {selectedReturn && selectedReturn.price && (
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
                    <form onSubmit={handleCreateInvoice} className="space-y-5">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">3</div>
                        Invoice Details
                        <span className="text-sm font-normal text-slate-500 ml-2">
                          ({invoiceType === "hourly" ? "Hourly" : invoiceType === "lumpsum" ? "Lump Sum" : "Standard"})
                        </span>
                      </h3>

                      {/* Basic Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {invoiceType === "hourly" && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                            <input
                              type="number"
                              className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                              value={invoiceData.no_of_hours || ""}
                              onChange={(e) =>
                                setInvoiceData((prev) => ({
                                  ...prev,
                                  no_of_hours: Number(e.target.value) || 0,
                                }))
                              }
                              placeholder="Hours worked"
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <select
                            className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                            required
                            value={invoiceData.status}
                            onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value })}
                          >
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                          <input
                            required
                            type="date"
                            className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                            value={invoiceData.due_date}
                            onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      {/* Line Items */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-slate-700">Line Items</label>
                          <button
                            type="button"
                            onClick={addLineItem}
                            className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {invoiceData.line_items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center p-2 bg-slate-50 rounded-lg">
                              <input
                                type="text"
                                className="flex-1 border border-slate-300 p-2 rounded text-sm focus:ring-1 focus:ring-purple-400"
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                              />

                              {invoiceType === "hourly" && (
                                <>
                                  <input
                                    type="number"
                                    className="w-20 border border-slate-300 p-2 rounded text-sm focus:ring-1 focus:ring-purple-400"
                                    placeholder="Hrs"
                                    value={item.hours || ""}
                                    onChange={(e) => handleLineItemChange(index, "hours", e.target.value)}
                                  />
                                  <input
                                    type="number"
                                    className="w-24 border border-slate-300 p-2 rounded text-sm focus:ring-1 focus:ring-purple-400"
                                    placeholder="Rate"
                                    value={item.rate || ""}
                                    onChange={(e) => handleLineItemChange(index, "rate", e.target.value)}
                                  />
                                </>
                              )}

                              <input
                                type="number"
                                className="w-28 border border-slate-300 p-2 rounded text-sm focus:ring-1 focus:ring-purple-400"
                                placeholder="Amount"
                                value={item.amount || ""}
                                onChange={(e) => handleLineItemChange(index, "amount", e.target.value)}
                              />

                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                onClick={() => removeLineItem(index)}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 p-3 bg-slate-100 rounded-lg border">
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">
                              Total: {formatCurrency(
                                invoiceData.line_items.reduce(
                                  (sum, item) => sum + (Number(item.amount) || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              {selectedReturn && selectedReturn.price && (
                <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                      disabled={apiLoading.createInvoice}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateInvoice}
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={apiLoading.createInvoice}
                    >
                      {apiLoading.createInvoice && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      )}
                      Create Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}