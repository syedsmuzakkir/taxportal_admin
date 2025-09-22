
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
} from "lucide-react"
import { BASE_URL } from "../api/BaseUrl"
import { useNotifications } from "../contexts/NotificationsContext.jsx";


function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString()
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
  const tone =
    status === "Filed" || status === "Document verified"
      ? "bg-green-100 text-green-800"
      : status === "In Progress" || status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800"

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
  const [saved , setSaved] = useState(false)

  const loginId = localStorage.getItem("loginId")
  const role = localStorage.getItem("role")
  const userToken = localStorage.getItem('token')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchTaxReturns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${BASE_URL}/api/tax-returns/${id}`, {

          headers:{
            "Authorization": `Bearer ${userToken}`
          }
        })
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.ok) {
          // Always show "No documents found" for non-200
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

          headers:{
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
        // console.error("Failed to fetch documents:", error)
        setDocuments([])
      }
    }

    const getTimeline = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/comments/${openReturnId}`, {
          headers:{
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()
        setTimeline(result)
      } catch (error) {
        // console.error("Failed to fetch timeline:", error)
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
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${userToken}` },
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
      // console.log("Pricing added:", data)
      setPrice("")

      // alert('Pricing added')
        addNotification({
  title: "Status",
  body: `${data?.message || 'Price added'}`,
  level: "success",
});
    } catch (err) {
      // console.error("Error adding pricing:", err)
      // alert(err)
        addNotification({
  title: "Status",
  body: `${data?.error || 'failed to add'}`,
  level: "error",
});
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
      // console.error("Error uploading documents:", error)
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
      // console.error("Error posting comment:", error)
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
        // Has attachments - use document upload API
        const filesToUpload = composerAttachments.map((attachment) => attachment.file).filter(Boolean)

        if (filesToUpload.length > 0) {
          uploadedDocuments = await uploadDocuments(filesToUpload)
        }
      } else if (newComment.trim()) {
        // Comment only - use comment API
        await postCommentOnly()
      }

      setNewComment("")
      setComposerAttachments([])

      // ✅ Refresh documents
      if (openReturnId) {
        const response = await fetch(`${BASE_URL}/api/documents/${openReturnId}`, {

          headers:{
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (response.ok) {
          const updatedDocuments = await response.json()
          setDocuments(updatedDocuments)
        }

        // ✅ Refresh timeline as well
        const timelineRes = await fetch(`${BASE_URL}/api/comments/${openReturnId}`,{
          headers:{
            "Authorization": `Bearer ${userToken}`
          }
        })
        if (timelineRes.ok) {
          const updatedTimeline = await timelineRes.json()
          setTimeline(updatedTimeline)
        }
      }

      // alert(`Successfully ${uploadedDocuments.length > 0 ? "uploaded documents and " : ""}added comment!`)
       addNotification({
  title: "Status",
  body: `${response?.message || 'Document uploaded successfully'}`,
  level: "success",
});
    } catch (error) {
      // console.error("Error adding comment/uploading documents:", error)
      // alert(`Error: ${error.message}`)

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
    tax_name:returnItem.tax_name
  }))

  const downloadDocument = useCallback(async (doc) => {
    try {
      if (!doc.document_link) {
        // alert("Document link not available")

         addNotification({
  title: "Status",
  body: `${response?.message || 'Document link not available'}`,
  level: "error",
});
        return
      }

      // Clean up the document link path - handle both forward and backward slashes
      const cleanPath = doc.document_link.replace(/\\/g, "/")
      const fileName = doc.doc_name || cleanPath.split("/").pop() || "document"

      // Use the backend download endpoint
      const downloadUrl = `${BASE_URL}/api/download?documentLink=${encodeURIComponent(doc.document_link)}`

      // Create a fetch request to get the file
      const response = await fetch(downloadUrl, {
        headers:{

          "Authorization": `Bearer ${userToken}`
        }
      })

      
      if (!response.ok) {
        
        throw new Error(`Download failed: ${response.status}`)
        
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a") // ✅ use global document
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      // console.error("Error downloading document:", error)
      // alert("Failed to download document. Please try again.")
       addNotification({
  title: "Status",
  body: `${response?.message || 'Failed to download document. Please try again.'}`,
  level: "error",
});
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600"> {error}</div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div>
          <h2>{returns[0]?.tax_name}</h2>
        </div>
       
      </header>

      <section className="space-y-3">
        {returns.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tax returns found</h3>
            <p className="mt-1 text-sm text-gray-500">This customer doesn't have any tax returns yet.</p>
          </div>
        ) : (
          returns.map((r) => {
            const isOpen = openReturnId === r.id
            return (
              <div key={r.id} className="rounded-md border border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded p-1 hover:bg-gray-100"
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
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <div className="text-gray-900">{r.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">status:</span>
                    <StatusPill status={r.status} />
                    <button
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setOpenReturnId(isOpen ? null : r.id)
                        setCategory(r.name)
                        if (!isOpen) {
                          setPrice(r.price || "")
                          setPricingType(r.pricing_type || "hourly")
                        }
                      }}
                    >
                      show details
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t">
                    <div className="grid items-start gap-4 p-4 md:grid-cols-4 md:p-6">
                      <div className="md:col-span-3 rounded-md border border-gray-200 bg-white">
                        <div className="p-4 md:p-6">
                          <h2 className="mb-2 text-lg font-semibold text-gray-900">Return details</h2>
                          <p className="text-pretty text-sm leading-6 text-gray-700">{r.details}</p>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="text-gray-500">Return</div>
                              <div className="font-medium text-gray-900">{r.name}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Type</div>
                              <div className="font-medium text-gray-900">{r.type}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Last updated</div>
                              <div className="font-medium text-gray-900">{formatDate(r.updatedAt)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Status</div>
                              <StatusPill status={r.status} />
                            </div>
                            <div>
                              <div className="text-gray-500">Price</div>
                              <div className="font-medium text-gray-900">${r.price}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Pricing Type</div>
                              <div className="font-medium text-gray-900">{r.pricing_type}</div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 p-4 md:p-5">
                          <div className="mb-2 text-sm font-medium text-gray-900">Documents ({documents.length})</div>
                          <div className="flex items-stretch gap-4 overflow-x-auto">
                            {documents.map((d, index) => (
                              <div
                                key={index}
                                className="group relative flex h-16 w-24 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
                                title={d.doc_name}
                                onClick={() => downloadDocument(d)}
                              >
                                <DocIcon type={d.doc_type} className="text-gray-600 h-5 w-5" />
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {d.doc_name.length > 14 ? d.doc_name.slice(0, 14) + "…" : d.doc_name}
                                </div>
                                <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    className="rounded bg-white/90 p-1 hover:bg-white"
                                    aria-label="View"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert(`Viewing ${d.doc_name}`)
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5 text-gray-700" />
                                  </button>
                                  <button
                                    className="rounded bg-white/90 p-1 hover:bg-white"
                                    aria-label="Download"
                                    onClick={(e) => {
                                      downloadDocument(d)
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5 text-gray-700" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {documents.length === 0 && (
                              <div className="text-sm text-gray-500 py-4">No documents found for this return</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <aside className="self-start rounded-md border border-gray-200 bg-white p-4 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">Pricing Type</label>
                        <select
                          value={pricingType}
                          onChange={(e) => setPricingType(e.target.value)}
                          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="lumpsum">Lump Sum</option>
                        </select>

                        <label className="mb-1 block text-sm font-medium text-gray-700">Price ($)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="Enter price amount"
                          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          onClick={handleAddPricing}
                        >
                          {!saved ? 'save pricings' : 'Saving..'}
                        </button>
                      </aside>

                      <div className="md:col-span-4 rounded-md border border-gray-200 bg-white p-4 md:p-6">
                        <div className="grid gap-6">
                          <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">Add Comment & Upload Documents</span>
                            </div>
                            <div className="mb-3">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment or attach documents..."
                                rows={4}
                                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="mt-2 flex items-center justify-between">
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
                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    disabled={isUploading}
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    Attach Files
                                  </button>
                                  {composerAttachments.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                                    >
                                      <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                      {a.name}
                                      <button
                                        type="button"
                                        aria-label="Remove attachment"
                                        className="rounded p-0.5 hover:bg-gray-200"
                                        onClick={() =>
                                          setComposerAttachments((prev) => prev.filter((d) => d.id !== a.id))
                                        }
                                      >
                                        <X className="h-3 w-3 text-gray-500" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={addComment}
                                  disabled={isUploading || (!newComment.trim() && composerAttachments.length === 0)}
                                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUploading ? (
                                    <>
                                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    "Post Comment"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">Documents Timeline</span>
                            </div>

                            <ol className="relative mt-3 max-h-96 overflow-y-auto">
                              {timeline.map((t, index) => (
                                <li key={t.id} className="flex">
                                  <div className="flex flex-col items-center flex-shrink-0 mr-4">
                                    {index !== 0 && <div className="w-0.5 h-4 bg-blue-100 mb-1"></div>}

                                    <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 z-10"></div>

                                    {index !== timeline.length - 1 && (
                                      <div className="w-0.5 h-4 bg-blue-100 mt-1 flex-grow"></div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="p-3 rounded-md border border-gray-100 bg-gray-50">
                                      <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            {t.created_by_name} ({t.createdby_type})
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">{formatDateTime(t.created_at)}</span>
                                      </div>

                                      {t.comment && <p className="text-sm text-gray-700">{t.comment}</p>}

                                      <div className="mt-2 text-xs text-gray-500">
                                        Return ID: {t.return_id} | Document IDs: {t.document_ids}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                              {timeline.length === 0 && (
                                <li className="text-sm text-gray-500 py-4 text-center">No activity yet</li>
                              )}
                            </ol>
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
  )
}
