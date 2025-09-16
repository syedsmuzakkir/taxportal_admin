import { useState, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { BASE_URL } from "../api/BaseUrl";
import { useNotifications } from "../contexts/NotificationsContext.jsx";

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

  const filteredInvoices = invoices.filter((inv) => {
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

    // updated_by_id: localStorage.getItem("createdby_id") || "",
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
      console.error("Error loading customers:", error);
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
      console.error("Error loading invoices:", error);
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
        console.error("Error fetching returns:", error);
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
    if (invoiceData.line_items.length <= 1) return;
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
      // no_of_hours:
      //   invoiceType === "hourly"
      //     ? updatedLineItems.reduce(
      //         (sum, item) => sum + (Number(item.hours) || 0),
      //         0
      //       )
      //     : 0,
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
      // returnItem.pricing_type === "hourly"
      //   ? [
      //       {
      //         description: `Tax preparation for ${returnItem.return_type}`,
      //         hours: 1,
      //         rate: returnItem.price || 0,
      //         amount: returnItem.price || 0,
      //       },
      //     ]
      //   : [
      //       {
      //         description: `Tax preparation for ${returnItem.return_type}`,
      //         amount: returnItem.price || 0,
      //       },
      //     ],
    }));
  };

  // const handleCreateInvoice = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setLoadingState('createInvoice', true);
  //     const response = await fetch(
  //       `${BASE_URL}/api/create-invoice`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${userToken}`},
  //         body: JSON.stringify(invoiceData),

  //       }
  //     );

  //     if (response.ok) {
  //       alert("Invoice created successfully!");
  //       setShowCreateModal(false);
  //       setSelectedCustomer(null);
  //       setSelectedReturn(null);
  //       setInvoiceData({
  //         customer_id: "",
  //         return_id: "",
  //         line_items: [{ description: "", hours: 1, rate: 0, amount: 0 }],
  //         no_of_hours: 0,
  //         updated_by_id: localStorage.getItem("createdby_id") || "",
  //         status: "pending",
  //         due_date: "",
  //         createdby_type: role || "",
  //         createdby_id: loginId || "",
  //       });
  //       loadInvoices();
  //     } else {
  //       alert("Failed to create invoice");
  //     }
  //   } catch (error) {
  //     console.error("Error creating invoice:", error);
  //     alert("Error creating invoice");
  //   } finally {
  //     setLoadingState('createInvoice', false);
  //   }
  // };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setLoadingState("createInvoice", true);

      let payload;
      if (invoiceType === "hourly") {
        payload = {
          customer_id: invoiceData.customer_id,
          return_id: invoiceData.return_id,
          line_items: invoiceData.line_items.map((item) => ({
            description: item.description,
            hours: Number(item.hours) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
          })),
          no_of_hours: invoiceData.no_of_hours,
          updated_by_id: loginId,
          status: invoiceData.status,
          due_date: invoiceData.due_date,
          createdby_type: role,
          createdby_id: loginId,
        };
      } else if (invoiceType === "lumpsum") {
        payload = {
          customer_id: invoiceData.customer_id,
          return_id: invoiceData.return_id,
          line_items: invoiceData.line_items.map((item) => ({
            description: item.description,
            amount: Number(item.amount) || 0,
          })),
          updated_by_id: loginId,
          status: invoiceData.status,
          due_date: invoiceData.due_date,
          createdby_type: role,
          createdby_id: loginId,
        };
      }

      const response = await fetch(`${BASE_URL}/api/create-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // alert("Invoice created successfully!");
         addNotification({
  title: "Status",
  body: `${response?.message|| 'invoice created successfully'}`,
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
        // alert("Failed to create invoice");
          addNotification({
  title: "Status",
  body: `${response?.error|| 'error failed to create  '}`,
  level: "error",
});
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      // alert("Error creating invoice");
      addNotification({
  title: "Status",
  body: `${response.error}`,
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-gray-50 transition-colors ${
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
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

                  {/* Status + Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="border p-2 rounded"
                      value={invoiceData.status}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      {/* <option value="paid">Paid</option> */}
                      {/* <option value="overdue">Overdue</option> */}
                    </select>
                    <input
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
