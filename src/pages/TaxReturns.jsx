
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePermissions } from "../contexts/PermissionsContext.jsx";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { Filter, FileText, Clock, Eye, Search, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../api/BaseUrl.js";

const statuses = [
  "All",
  "initial request",
  "document verified",
  "in preparation",
  "in review",
  "ready to file",
  "filed return",
];

const statusColors = {
  "initial request": "bg-slate-100 text-slate-700 border-slate-200",
  "document verified": "bg-sky-100 text-sky-700 border-sky-200",
  "in preparation": "bg-amber-100 text-amber-700 border-amber-200",
  "in review": "bg-orange-100 text-orange-700 border-orange-200",
  "ready to file": "bg-violet-100 text-violet-700 border-violet-200",
  "filed return": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusIcons = {
  "initial request": "⏳",
  "document verified": "✅",
  "in preparation": "📝",
  "in review": "🔍",
  "ready to file": "📤",
  "filed return": "✨",
};

export default function TaxReturns() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const queryClient = useQueryClient();

  const loginId = localStorage.getItem("loginId");
  const role = localStorage.getItem("role");
  const userToken = localStorage.getItem("token");

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Parse ?status= query param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get("status");
    if (statusParam && statuses.includes(statusParam)) {
      setSelectedStatus(statusParam);
    }
  }, [location.search]);

  // React Query: fetch returns
  const { data: taxReturns = [], isLoading } = useQuery({
    queryKey: ["taxReturns"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/get-all-returns`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch returns");
      const result = await res.json();
      return result.data || [];
    },
    staleTime: 1000 * 60 * 30,   // 30 min freshness
    gcTime: 1000 * 60 * 120,     // 2 hours in memory
    refetchOnWindowFocus: false, // less noise
    refetchOnReconnect: true,    // protect against offline
    refetchOnMount: true,        // recheck if needed
  });

  // Mutation: optimistic status update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus, roles, customerId }) => {
      const res = await fetch(`${BASE_URL}/api/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          newStatus,
          createdby_type: role,
          createdby_id: loginId,
          customer_type: roles,
          customer_id: customerId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Update failed");
      return result;
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries(["taxReturns"]);
      const previousData = queryClient.getQueryData(["taxReturns"]);
      queryClient.setQueryData(["taxReturns"], (old) =>
        old.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["taxReturns"], context.previousData);
      addNotification({ title: "Update Failed", body: err.message, level: "error" });
    },
    onSuccess: (data) => {
      addNotification({ title: "Status Updated", body: data.message, level: "success" });
      queryClient.invalidateQueries(["taxReturns"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  // Filter + search
  const filteredReturns = taxReturns.filter((r) => {
    const matchesStatus =
      selectedStatus === "All" || r.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      (r.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 font-medium">Loading tax returns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        {/* <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Tax Returns Management
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Streamline your tax return workflow with real-time tracking and status management
          </p>
        </div> */}



        {/* Filters + Search */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                  <Filter className="w-5 h-5 text-slate-600" />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">
                  Showing <span className="font-bold text-slate-900">{filteredReturns.length}</span> of{" "}
                  <span className="font-bold text-slate-900">{taxReturns.length}</span> returns
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700 w-full sm:w-80"
              />
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Return Details
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReturns.map((taxReturn, index) => (
                  <tr 
                    key={taxReturn.id} 
                    className={`hover:bg-slate-50/80 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {taxReturn.name || "Unnamed Return"}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">
                            {taxReturn.return_type || "Standard Return"}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-900">
                        {taxReturn.email || "No email provided"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-700">
                        {taxReturn.assigned_user_name || "Unassigned"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      {can("update") ? (
                        <select
                          value={taxReturn.status ?? "initial request"}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              id: taxReturn.id,
                              newStatus: e.target.value,
                              roles: taxReturn.role,
                              customerId: taxReturn.customer_id,
                            })
                          }
                          className={`text-sm px-3 py-2 rounded-xl font-medium border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            statusColors[taxReturn.status] || "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {statuses.slice(1).map((status) => (
                            <option key={status} value={status}>
                              {statusIcons[status]} {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl border-2 ${
                            statusColors[taxReturn.status] || "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          <span className="mr-2">{statusIcons[taxReturn.status]}</span>
                          {taxReturn.status || "initial request"}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {taxReturn.modified_at 
                            ? new Date(taxReturn.modified_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : "Not updated"
                          }
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <Link
                        to={`/customers/${taxReturn.customer_id}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-200 hover:shadow-md border-2 border-blue-200 hover:border-blue-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReturns.length === 0 && (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">No returns found</h3>
                    <p className="text-slate-600">
                      {selectedStatus !== "All" 
                        ? `No returns match the selected status: ${selectedStatus}`
                        : "No tax returns available at the moment"
                      }
                    </p>
                  </div>
                  {selectedStatus !== "All" && (
                    <button
                      onClick={() => setSelectedStatus("All")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
                    >
                      View All Returns
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}