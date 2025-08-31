"use client"

import { useState, useEffect, useMemo } from "react"
import { useData } from "../contexts/DataContext.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"
import { usePermissions } from "../contexts/PermissionsContext.jsx"
import { useNotifications } from "../contexts/NotificationsContext.jsx"
import { invoicesAPI } from "../api/invoices.js"
import { Plus, Receipt, Download, Eye, Edit, X } from "lucide-react"
import { formatDate } from "../utils/dateUtils.js"
import Modal from "../components/Modal.jsx"

export default function Invoices() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const { invoices: contextInvoices, updateInvoices, customers, taxReturns, addActivity } = useData()
  const { addNotification } = useNotifications()

  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    customerId: "",
    returnName: "",
    returnType: "",
    documentsCount: 0,
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    discount: 0,
    taxRate: 0,
    status: "Pending",
  })

  // View Details (Eye) modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsFor, setDetailsFor] = useState(null) // stores the invoice row clicked

  useEffect(() => {
    loadInvoices()
  }, [contextInvoices])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const invoiceList = await invoicesAPI.getAll()
      setInvoices(invoiceList)
    } catch (error) {
      console.error("Error loading invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addLineItem = () => {
    setNewInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }))
  }

  const removeLineItem = (index) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateLineItem = (index, field, value) => {
    const items = [...newInvoice.items]
    items[index] = { ...items[index], [field]: value }
    if (field === "quantity" || field === "rate") {
      items[index].amount = (Number(items[index].quantity) || 0) * (Number(items[index].rate) || 0)
    }
    setNewInvoice({ ...newInvoice, items })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open("", "_blank")
    const content = `
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TaxPortal Demo</h1>
            <h2>Invoice #${invoice.id}</h2>
          </div>
          <div class="invoice-details">
            <p><strong>Customer:</strong> ${invoice.customerName || ""}</p>
            <p><strong>Return:</strong> ${invoice.returnName || ""} (${invoice.returnType || ""})</p>
            <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
            <p><strong>Status:</strong> ${invoice.status || ""}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${(invoice.items || [])
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${Number(item.rate || 0).toFixed(2)}</td>
                  <td>$${Number(item.amount || 0).toFixed(2)}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <div class="totals">
            <p><strong>Subtotal:</strong> $${Number(invoice.subtotal || 0).toFixed(2)}</p>
            <p><strong>Tax:</strong> $${Number(invoice.tax || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> $${Number(invoice.total || 0).toFixed(2)}</p>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  // Derived: returns for selected customer in Create modal
  const customerReturnsForCreate = useMemo(() => {
    if (!newInvoice.customerId) return []
    return (taxReturns || []).filter((r) => r.customerId === newInvoice.customerId)
  }, [taxReturns, newInvoice.customerId])

  const selectedReturnForCreate = useMemo(() => {
    if (!newInvoice.customerId) return null
    return customerReturnsForCreate.find((r) => r.name === newInvoice.returnName && r.type === newInvoice.returnType)
  }, [customerReturnsForCreate, newInvoice.returnName, newInvoice.returnType])

  // Add quick "Price Adjustment" helpers
  const addLumpSumAdjustment = () => {
    setNewInvoice((prev) => {
      const items = [...prev.items, { description: "Lump sum adjustment", quantity: 1, rate: 0, amount: 0 }]
      return { ...prev, items }
    })
  }
  const addHourlyAdjustment = () => {
    setNewInvoice((prev) => {
      const items = [
        ...prev.items,
        { description: "Hourly adjustment", quantity: 1, rate: 0, amount: 0 }, // quantity = hours
      ]
      return { ...prev, items }
    })
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    try {
      const customer = customers.find((c) => c.id === newInvoice.customerId)
      const amount = (newInvoice.items || []).reduce((sum, item) => sum + (item.amount || 0), 0)
      const invoiceData = {
        ...newInvoice,
        customerName: customer?.name || "",
        amount,
      }

      const createdInvoice = await invoicesAPI.create(invoiceData)
      const updatedInvoices = [...invoices, createdInvoice]
      setInvoices(updatedInvoices)
      updateInvoices(updatedInvoices)

      addActivity({
        user: user.name,
        action: `Created invoice for ${customer?.name}`,
        entityType: "invoice",
        entityId: createdInvoice.id,
      })

      await addNotification({
        title: "New Invoice Created",
        body: `Invoice #${createdInvoice.id} created for ${customer?.name} - $${Number(
          createdInvoice.total || amount || 0,
        ).toFixed(2)}`,
        level: "success",
        relatedEntity: { type: "invoice", id: createdInvoice.id },
      })

      setShowCreateModal(false)
      setNewInvoice({
        customerId: "",
        returnName: "",
        returnType: "",
        documentsCount: 0,
        items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
        discount: 0,
        taxRate: 0,
        status: "Pending",
      })
    } catch (error) {
      console.error("Error creating invoice:", error)
    }
  }

  // Helpers for View Details modal
  const returnsForDetails = useMemo(() => {
    if (!detailsFor) return []
    // Prefer matching by customerId, fallback to customerName if missing
    const customerId = detailsFor.customerId || customers.find((c) => c.name === detailsFor.customerName)?.id
    return (taxReturns || []).filter((r) => r.customerId === customerId)
  }, [detailsFor, taxReturns, customers])

  const findInvoiceForReturn = (ret) => {
    if (!detailsFor) return null
    const customerId = detailsFor.customerId || customers.find((c) => c.name === detailsFor.customerName)?.id
    return (invoices || []).find(
      (inv) =>
        inv.customerId === customerId &&
        ((inv.returnId && inv.returnId === ret.id) || (inv.returnName === ret.name && inv.returnType === ret.type)),
    )
  }

  const raiseInvoiceForReturn = (ret) => {
    if (!detailsFor) return
    const customerId = detailsFor.customerId || customers.find((c) => c.name === detailsFor.customerName)?.id || ""
    setNewInvoice({
      customerId,
      returnName: ret.name || "",
      returnType: ret.type || "",
      documentsCount: ret.documentsCount || 0,
      items: [
        {
          description: `${ret.name || "Return"}${ret.type ? ` (${ret.type})` : ""}`,
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
      discount: 0,
      taxRate: 0,
      status: "Pending",
    })
    setShowDetailsModal(false)
    setShowCreateModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        {can("component:invoice.create") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">#{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{invoice.returnName}</div>
                      <div className="text-sm text-gray-500">{invoice.returnType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${Number(invoice.total || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        onClick={() => {
                          setDetailsFor(invoice)
                          setShowDetailsModal(true)
                        }}
                        aria-label="View customer returns and invoice options"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {can("component:invoice.export") && (
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          aria-label="Download / print invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-700 transition-colors" aria-label="Edit invoice">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
          </div>
        )}
      </div>

      {/* View Details Modal (Eye) */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Customer Returns" size="lg">
        {!detailsFor ? (
          <div className="text-sm text-gray-500">No selection.</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{detailsFor.customerName || "Customer"}</div>
              <div className="text-gray-600">
                {returnsForDetails.length} return{returnsForDetails.length === 1 ? "" : "s"} found
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-5 bg-gray-50 text-xs font-medium text-gray-600 px-3 py-2">
                <div className="col-span-2">Return</div>
                <div>Filing Status</div>
                <div>Invoice</div>
                <div>Action</div>
              </div>
              <div className="divide-y">
                {returnsForDetails.map((ret) => {
                  const inv = findInvoiceForReturn(ret)
                  return (
                    <div key={ret.id || ret.name} className="grid grid-cols-5 items-center px-3 py-2 text-sm">
                      <div className="col-span-2">
                        <div className="text-gray-900">{ret.name}</div>
                        <div className="text-gray-500">{ret.type}</div>
                      </div>
                      <div className="text-gray-700">{ret.filingStatus || ret.status || "—"}</div>
                      <div>
                        {inv ? (
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(inv.status)}`}>
                            {inv.status}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">No invoice</span>
                        )}
                      </div>
                      <div>
                        {inv ? (
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            onClick={() => {
                              setShowDetailsModal(false)
                              // Optional: open print for existing inv
                              handlePrintInvoice(inv)
                            }}
                          >
                            View Invoice
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            onClick={() => raiseInvoiceForReturn(ret)}
                          >
                            Raise Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {returnsForDetails.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500">No returns available.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Invoice" size="lg">
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              required
              value={newInvoice.customerId}
              onChange={(e) => {
                const value = e.target.value
                const customer = customers.find((c) => c.id === value)
                const customerReturns = taxReturns.filter((r) => r.customerId === value)
                const firstReturn = customerReturns[0]
                setNewInvoice((prev) => ({
                  ...prev,
                  customerId: value,
                  returnName: firstReturn?.name || "",
                  returnType: firstReturn?.type || "",
                  documentsCount: customer?.documentsCount || 0,
                }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Return selection + statuses (as in annotated image) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
              <select
                disabled={!newInvoice.customerId}
                value={`${newInvoice.returnName}|${newInvoice.returnType}`}
                onChange={(e) => {
                  const [name, type] = e.target.value.split("|")
                  setNewInvoice((prev) => ({ ...prev, returnName: name || "", returnType: type || "" }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              >
                {customerReturnsForCreate.length === 0 && <option value="">No returns</option>}
                {customerReturnsForCreate.map((r) => (
                  <option key={r.id || r.name} value={`${r.name}|${r.type}`}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">
                {selectedReturnForCreate?.filingStatus || selectedReturnForCreate?.status || "—"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Status</label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(newInvoice.status)}`}
              >
                {newInvoice.status}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>

            {/* Quick add price adjustments (matches new-return.jpg intent) */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Price adjustment:</span>
              <button
                type="button"
                onClick={addLumpSumAdjustment}
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Lump sum
              </button>
              <button
                type="button"
                onClick={addHourlyAdjustment}
                className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Hourly
              </button>
            </div>

            <div className="space-y-3">
              {newInvoice.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty (hours if hourly)"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateLineItem(index, "rate", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      readOnly
                      value={Number(item.amount || 0).toFixed(2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        aria-label="Remove line item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="mt-3 text-blue-600 hover:text-blue-700 transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Line Item
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Invoice
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
