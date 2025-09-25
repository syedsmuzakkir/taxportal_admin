
import { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  Download,
  Eye,
  DollarSign,
  MessageSquare,
  Paperclip,
  Clock,
  X,
  User,
  Calendar,
  Tag,
} from "lucide-react"
import { BASE_URL } from "../api/BaseUrl"
import { useNotifications } from "../contexts/NotificationsContext.jsx"

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString()
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
  const tone =
    status === "Filed" || status === "Document verified"
      ? "bg-green-100 text-green-800 border border-green-200"
      : status === "In Progress" || status === "pending"
        ? "bg-amber-100 text-amber-800 border border-amber-200"
        : "bg-blue-100 text-blue-800 border border-blue-200"

  return <span className={`${base} ${tone}`}>{status}</span>
}

function DocIcon({ type, className }) {
  const c = `h-5 w-5 ${className || ""}`
  if (type === "pdf") return <FileText className={c} />
  if (type === "csv") return <FileSpreadsheet className={c} />
  if (type === "zip") return <FileArchive className={c} />
  if (["image", "jpg", "jpeg", "png"].includes(type)) return <FileImage className={c} />
  return <FileText className={c} />
}

export default function CustomerDetail() {
  const { addNotification } = useNotifications();
  
  const { id } = useParams()
  const [taxReturns, setTaxReturns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openReturnId, setOpenReturnId] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [returnId, setReturnId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [category, setCategory] = useState("")
  const [pricingType, setPricingType] = useState("hourly")
  const [price, setPrice] = useState("")
  const [newComment, setNewComment] = useState("")
  const [composerAttachments, setComposerAttachments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [saved, setSaved] = useState(false)

  const loginId = localStorage.getItem("loginId")
  const role = localStorage.getItem("role")
  const userToken = localStorage.getItem('token')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchTaxReturns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${BASE_URL}/api/tax-returns/${id}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        })
        
        if (!response.ok) {
          setError("No documents found")
          setTaxReturns([])
          return
        }
        const data = await response.json()
        setTaxReturns(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchTaxReturns()
  }, [id])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/documents/${openReturnId}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()

        if (result.length > 0) {
          setCustomerName(result[0].document_link.split("_")[0])
          setReturnId(result[0].return_id)
          setCustomerId(result[0].customer_id)
        }

        setDocuments(result)
      } catch (error) {
        setDocuments([])
      }
    }

    const getTimeline = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/comments/${openReturnId}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()
        setTimeline(result)
      } catch (error) {
        setTimeline([])
      }
    }

    if (openReturnId) {
      fetchDocuments()
      getTimeline()
    }
  }, [openReturnId])

  const handleAddPricing = async () => {
    setSaved(true)
    try {
      const res = await fetch(`${BASE_URL}/api/add-pricing`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_id: returnId,
          pricing_type: pricingType,
          price: price,
          created_by_type: role,
          created_by_id: loginId,
        }),
      })
      setSaved(false)

      const data = await res.json()

      if (!res.ok) {
        addNotification({
          title: "Status",
          body: data?.error || "Failed to add pricing",
          level: "error",
        })
        return
      }

      setPrice("")
      addNotification({
        title: "Status",
        body: data?.message || "Price added",
        level: "success",
      })

    } catch (err) {
      setSaved(false)
      addNotification({
        title: "Status",
        body: err.message || "Network error",
        level: "error",
      })
    }
  }

  const uploadDocuments = async (files) => {
    if (!files || files.length === 0) return []

    const formData = new FormData()

    formData.append("customerId", customerId)
    formData.append("taxReturnId", returnId)
    formData.append("createdby_id", loginId)
    formData.append("createdby_type", role)
    formData.append("customerName", customerName)
    formData.append("comment", newComment)
    formData.append("category", category)
    files.forEach((file) => {
      formData.append("documents", file)
    })
    try {
      const response = await fetch(`${BASE_URL}/api/upload-documents`, {
        method: "POST",
        body: formData,
        "Authorization": `Bearer ${userToken}`
      })
      addNotification({
        title: "Status",
        body: `${response?.message || 'Document uploaded successfully'}`,
        level: "success",
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
      return await response.json()
      
    } catch (error) {
      addNotification({
        title: "Status",
        body: `${response?.error || 'Upload failed'}`,
        level: "error",
      });
      throw error
    }
  }

  const postCommentOnly = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/add-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken}` },
        body: JSON.stringify({
          customerId: customerId,
          taxReturnId: returnId,
          createdby_id: loginId,
          createdby_type: role,
          customerName: customerName,
          comment: newComment,
          category: category,
        }),
      })

      addNotification({
        title: "Status",
        body: `${response?.message || 'Comments added successfully'}`,
        level: "success",
      });
      if (!response.ok) throw new Error(`Comment post failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      addNotification({
        title: "Status",
        body: `${response?.message || 'Failed to add comments'}`,
        level: "error",
      });
      throw error
    }
  }

  const addComment = async () => {
    if (!newComment.trim() && composerAttachments.length === 0) {
      alert("Please add a comment or attach files")
      return
    }

    try {
      setIsUploading(true)
      let uploadedDocuments = []

      if (composerAttachments.length > 0) {
        const filesToUpload = composerAttachments.map((attachment) => attachment.file).filter(Boolean)

        if (filesToUpload.length > 0) {
          uploadedDocuments = await uploadDocuments(filesToUpload)
        }
      } else if (newComment.trim()) {
        await postCommentOnly()
      }

      setNewComment("")
      setComposerAttachments([])

      if (openReturnId) {
        const response = await fetch(`${BASE_URL}/api/documents/${openReturnId}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (response.ok) {
          const updatedDocuments = await response.json()
          setDocuments(updatedDocuments)
        }

        const timelineRes = await fetch(`${BASE_URL}/api/comments/${openReturnId}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (timelineRes.ok) {
          const updatedTimeline = await timelineRes.json()
          setTimeline(updatedTimeline)
        }
      }

      addNotification({
        title: "Status",
        body: `${response?.message || 'Document uploaded successfully'}`,
        level: "success",
      });
    } catch (error) {
      addNotification({
        title: "Status",
        body: `${response?.message || 'Error'}`,
        level: "error",
      });
    } finally {
      setIsUploading(false)
    }
  }

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const created = files.map((f, i) => ({
      id: `att_${Date.now()}_${i}`,
      name: f.name,
      type: f.type.includes("image") ? "image" : f.name.split(".").pop() || "other",
      uploadedAt: new Date().toISOString(),
      file: f,
    }))

    setComposerAttachments((prev) => [...prev, ...created])
    e.currentTarget.value = ""
  }

  const returns = taxReturns.map((returnItem) => ({
    id: returnItem.id.toString(),
    name: `${returnItem.return_type}`,
    price: returnItem.price || "",
    pricing_type: returnItem.pricing_type || "hourly",
    type: returnItem.createdby_type || " ",
    status: returnItem.status || "In Progress",
    updatedAt: returnItem.modified_at || new Date().toISOString(),
    details: `Return type: ${returnItem.return_type}. Status: ${returnItem.status}`,
    tax_name: returnItem.tax_name
  }))

  const downloadDocument = useCallback(async (doc) => {
    try {
      if (!doc.document_link) {
        addNotification({
          title: "Status",
          body: `${response?.message || 'Document link not available'}`,
          level: "error",
        });
        return
      }

      const cleanPath = doc.document_link.replace(/\\/g, "/")
      const fileName = doc.doc_name || cleanPath.split("/").pop() || "document"

      const downloadUrl = `${BASE_URL}/api/download?documentLink=${encodeURIComponent(doc.document_link)}`

      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()

      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      addNotification({
        title: "Status",
        body: `${response?.message || 'Failed to download document. Please try again.'}`,
        level: "error",
      });
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

 if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header with back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-600 hover:text-gray-900"
                onClick={() => window.history.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
                <p className="text-gray-600 mt-1">Manage tax returns and documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error content centered */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">We couldn't find any tax returns for this customer.</p>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-600 hover:text-gray-900"
                onClick={() => window.history.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
                <p className="text-gray-600 mt-1">Manage tax returns and documents</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{returns[0]?.tax_name || "Tax Return"}</h2>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          {returns.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tax returns found</h3>
              <p className="text-gray-600 max-w-md mx-auto">This customer doesn't have any tax returns yet. Start by adding a new return.</p>
            </div>
          ) : (
            returns.map((r) => {
              const isOpen = openReturnId === r.id
              return (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <button
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => {
                          setOpenReturnId(isOpen ? null : r.id)
                          if (!isOpen) {
                            setPrice(r.price || "")
                            setPricingType(r.pricing_type || "hourly")
                          }
                        }}
                        aria-label={isOpen ? "Hide details" : "Show details"}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{r.name}</h3>
                          <p className="text-sm text-gray-500">Last updated: {formatDate(r.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusPill status={r.status} />
                      </div>
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                        onClick={() => {
                          setOpenReturnId(isOpen ? null : r.id)
                          setCategory(r.name)
                          if (!isOpen) {
                            setPrice(r.price || "")
                            setPricingType(r.pricing_type || "hourly")
                          }
                        }}
                      >
                        {isOpen ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                              <FileText className="h-5 w-5 text-blue-600 mr-2" />
                              Return Details
                            </h2>
                            <p className="text-gray-700 mb-6">{r.details}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  <User className="h-4 w-4 mr-2" />
                                  Return
                                </div>
                                <div className="font-medium text-gray-900">{r.name}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  <Tag className="h-4 w-4 mr-2" />
                                  Type
                                </div>
                                <div className="font-medium text-gray-900">{r.type}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Last Updated
                                </div>
                                <div className="font-medium text-gray-900">{formatDate(r.updatedAt)}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  Status
                                </div>
                                <StatusPill status={r.status} />
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Price
                                </div>
                                <div className="font-medium text-gray-900">${r.price || "0.00"}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  Pricing Type
                                </div>
                                <div className="font-medium text-gray-900 capitalize">{r.pricing_type}</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                Documents ({documents.length})
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {documents.map((d, index) => (
                                <div
                                  key={index}
                                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                                  title={d.doc_name}
                                  onClick={() => downloadDocument(d)}
                                >
                                  <div className="mb-3 p-2 bg-white rounded-lg shadow-sm">
                                    <DocIcon type={d.doc_type} className="text-blue-600 h-8 w-8" />
                                  </div>
                                  <div className="text-xs font-medium text-gray-900 text-center truncate w-full">
                                    {d.doc_name.length > 14 ? d.doc_name.slice(0, 14) + "…" : d.doc_name}
                                  </div>
                                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                      className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                      aria-label="View"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        alert(`Viewing ${d.doc_name}`)
                                      }}
                                    >
                                      <Eye className="h-3 w-3 text-gray-700" />
                                    </button>
                                    <button
                                      className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                      aria-label="Download"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        downloadDocument(d)
                                      }}
                                    >
                                      <Download className="h-3 w-3 text-gray-700" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {documents.length === 0 && (
                                <div className="col-span-full text-center py-8">
                                  
                                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500">No documents found for this return</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                Pricing
                              </h3>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                                <select
                                  value={pricingType}
                                  onChange={(e) => setPricingType(e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="lumpsum">Lump Sum</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                  placeholder="Enter price amount"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200"
                                />
                              </div>

                              <button
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium py-2.5 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm flex items-center justify-center"
                                onClick={handleAddPricing}
                              >
                                {!saved ? (
                                  <>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Save Pricing
                                  </>
                                ) : (
                                  'Saving...'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                              <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-900">Add Comment & Upload Documents</h3>
                            </div>
                            <div className="space-y-4">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment or attach documents..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200 resize-none"
                              />
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.csv,.zip"
                                    className="sr-only"
                                    onChange={onFilesSelected}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    disabled={isUploading}
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    Attach Files
                                  </button>
                                  {composerAttachments.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs text-blue-700"
                                    >
                                      <Paperclip className="h-3.5 w-3.5" />
                                      {a.name}
                                      <button
                                        type="button"
                                        aria-label="Remove attachment"
                                        className="rounded-full p-0.5 hover:bg-blue-100 transition-colors duration-200"
                                        onClick={() =>
                                          setComposerAttachments((prev) => prev.filter((d) => d.id !== a.id))
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={addComment}
                                  disabled={isUploading || (!newComment.trim() && composerAttachments.length === 0)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                  {isUploading ? (
                                    <>
                                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="h-4 w-4" />
                                      Post Comment
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                              <Clock className="h-5 w-5 text-blue-600 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-900">Documents Timeline</h3>
                            </div>

                            <div className="relative">
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-100"></div>
                              <div className="space-y-6 pl-8">
                                {timeline.map((t, index) => (
                                  <div key={t.id} className="relative">
                                    <div className="absolute -left-9 top-1.5 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-900">
                                            {t.created_by_name} ({t.createdby_type})
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 sm:mt-0">{formatDateTime(t.created_at)}</span>
                                      </div>

                                      {t.comment && <p className="text-sm text-gray-700 mb-2">{t.comment}</p>}

                                      <div className="text-xs text-gray-500">
                                        Return ID: {t.return_id} | Document IDs: {t.document_ids}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {timeline.length === 0 && (
                                  <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No activity yet</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>
      </main>
    </div>
  )
}