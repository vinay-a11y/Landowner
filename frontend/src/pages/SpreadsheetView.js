"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Pencil, Trash2, Plus, Search, Eye, ArrowLeft } from "lucide-react"
import AddAgreementModal from "../components/AddAgreementModal"
import ViewDetails from "../components/View-details" // Fixed import path to use correct lowercase view-details folder
import { toast } from "sonner"
import { getToken, logout } from "@/lib/auth"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export default function SpreadsheetView({ onBack }) {
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingId, setViewingId] = useState(null)

  const [filterSection, setFilterSection] = useState("all")

  useEffect(() => {
    fetchAgreements()
  }, [])

  const fetchAgreements = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await axios.get(`${API}/agreements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAgreements(response.data)
    } catch (error) {
      console.error("Error fetching agreements:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        logout()
      } else {
        toast.error("Failed to load agreements")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agreement?")) {
      try {
        const token = getToken()
        await axios.delete(`${API}/agreements/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success("Agreement deleted successfully")
        fetchAgreements()
      } catch (error) {
        console.error("Error deleting agreement:", error)
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.")
          logout()
        } else {
          toast.error("Failed to delete agreement")
        }
      }
    }
  }

  const handleEdit = (id) => {
    setEditingId(id)
    setIsAddModalOpen(true)
  }

  const handleView = (id) => {
    setViewingId(id)
    setIsViewModalOpen(true)
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedData = useMemo(() => {
    const filtered = agreements.filter((agreement) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        agreement.survey_no?.toLowerCase().includes(searchLower) ||
        agreement.firm_name?.toLowerCase().includes(searchLower) ||
        agreement.land_owner?.toLowerCase().includes(searchLower)
      )
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [agreements, searchTerm, sortConfig])

  const handleModalClose = () => {
    setIsAddModalOpen(false)
    setEditingId(null)
  }

  const handleModalSuccess = () => {
    fetchAgreements()
    handleModalClose()
  }

  const handleViewModalClose = () => {
    setIsViewModalOpen(false)
    setViewingId(null)
  }

  const shouldShowColumn = (columnType) => {
    if (filterSection === "all") return true
    if (filterSection === "agr1_poa") {
      return columnType === "basic" || columnType === "agr1" || columnType === "agr2"
    }
    if (filterSection === "agr1_poa_work") {
      return true
    }
    if (filterSection === "poa_only") {
      return columnType === "basic" || columnType === "agr2"
    }
    if (filterSection === "work_only") {
      return columnType === "basic" || columnType === "agr3"
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="container mx-auto py-8 px-4 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={onBack} variant="outline" className="border-slate-300 hover:bg-slate-50 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            Agreement Management
          </h1>
          <p className="text-slate-600">Manage all your land agreements in one place</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            onClick={() => setFilterSection("all")}
            variant={filterSection === "all" ? "default" : "outline"}
            size="sm"
            className={filterSection === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            All Documents (Default)
          </Button>
          <Button
            onClick={() => setFilterSection("agr1_poa")}
            variant={filterSection === "agr1_poa" ? "default" : "outline"}
            size="sm"
            className={filterSection === "agr1_poa" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Agreement 1 & POA
          </Button>

          <Button
            onClick={() => setFilterSection("poa_only")}
            variant={filterSection === "poa_only" ? "default" : "outline"}
            size="sm"
            className={filterSection === "poa_only" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            POA Only
          </Button>
          <Button
            onClick={() => setFilterSection("work_only")}
            variant={filterSection === "work_only" ? "default" : "outline"}
            size="sm"
            className={filterSection === "work_only" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Work Contract Only
          </Button>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by Survey No, Firm Name, or Land Owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agreement
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredAndSortedData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg">No agreements found</p>
                <p className="text-sm mt-2">Try adjusting your search or add a new agreement</p>
              </div>
            ) : (
              <table className="w-full min-w-[3000px]">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-emerald-600/20">
                  <tr>
                    {/* Basic Columns - Always visible */}
                    {shouldShowColumn("basic") && (
                      <>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider sticky left-0 bg-slate-100 z-10">
                          <button
                            onClick={() => handleSort("survey_no")}
                            className="flex items-center gap-2 hover:text-emerald-700 transition-colors"
                          >
                            Survey No <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Firm Name
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Land Owner
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Area
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("area_in_guntas")}
                            className="flex items-center gap-2 hover:text-emerald-700 transition-colors"
                          >
                            Guntas <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Agreement Date
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Dev Months
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Dev End Date
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Possession
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Rent/Sqft
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Free BU Area
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Free CP Area
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Total Months
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("total_rent")}
                            className="flex items-center gap-2 hover:text-emerald-700 transition-colors"
                          >
                            Total Rent <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Agreement Value
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Deposit DA
                        </th>
                      </>
                    )}

                    {/* Agreement 1 (POA) Columns */}
                    {shouldShowColumn("agr1") && (
                      <>
                        <th
                          colSpan="6"
                          className="px-4 py-3 text-center text-sm font-bold text-emerald-800 uppercase tracking-wider bg-gradient-to-r from-emerald-100 to-emerald-50 border-l-2 border-emerald-300"
                        >
                          Agreement 1 (POA)
                        </th>
                      </>
                    )}

                    {/* Agreement 2 (POA) Columns */}
                    {shouldShowColumn("agr2") && (
                      <>
                        <th
                          colSpan="6"
                          className="px-4 py-3 text-center text-sm font-bold text-blue-800 uppercase tracking-wider bg-gradient-to-r from-blue-100 to-blue-50 border-l-2 border-blue-300"
                        >
                          Agreement 2 (POA)
                        </th>
                      </>
                    )}

                    {/* Agreement 3 (Work Contract) Columns */}
                    {shouldShowColumn("agr3") && (
                      <>
                        <th
                          colSpan="4"
                          className="px-4 py-3 text-center text-sm font-bold text-purple-800 uppercase tracking-wider bg-gradient-to-r from-purple-100 to-purple-50 border-l-2 border-purple-300"
                        >
                          Agreement 3 (Work Contract)
                        </th>
                      </>
                    )}

                    <th className="px-4 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider bg-gradient-to-r from-emerald-100 to-emerald-50 border-l-2 border-emerald-400">
                      Total
                    </th>

                    <th className="px-4 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider sticky right-0 bg-slate-100 z-10">
                      Actions
                    </th>
                  </tr>

                  {/* Sub-headers Row */}
                  <tr className="bg-slate-50/50">
                    {/* Empty cells for basic columns */}
                    {shouldShowColumn("basic") && (
                      <>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                      </>
                    )}

                    {/* Agreement 1 Sub-headers */}
                    {shouldShowColumn("agr1") && (
                      <>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase border-l-2 border-emerald-300 bg-emerald-50/30">
                          Doc No
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30">
                          Stamp Duty
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30">
                          Regi DD
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30">
                          Handling
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30">
                          Adjudication
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30">
                          Legal Exp
                        </th>
                      </>
                    )}

                    {/* Agreement 2 Sub-headers */}
                    {shouldShowColumn("agr2") && (
                      <>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase border-l-2 border-blue-300 bg-blue-50/30">
                          Doc No
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-blue-50/30">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-blue-50/30">
                          Stamp Duty
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-blue-50/30">
                          Regi DD
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-blue-50/30">
                          Handling
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-blue-50/30">
                          Legal Exp
                        </th>
                      </>
                    )}

                    {/* Agreement 3 Sub-headers */}
                    {shouldShowColumn("agr3") && (
                      <>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase border-l-2 border-purple-300 bg-purple-50/30">
                          Doc No
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-purple-50/30">
                          Stamp Duty
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-purple-50/30">
                          Regi DD
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase bg-purple-50/30">
                          Handling
                        </th>
                      </>
                    )}

                    <th className="px-4 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase bg-emerald-50/30 border-l-2 border-emerald-400">
                      All Expenses
                    </th>

                    <th className="px-4 py-2 sticky right-0 bg-slate-50/50"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAndSortedData.map((agreement, index) => (
                    <tr
                      key={agreement.id}
                      className={`hover:bg-emerald-50/40 transition-all duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      {/* Basic Columns */}
                      {shouldShowColumn("basic") && (
                        <>
                          <td className="px-4 py-3 text-xs text-slate-800 font-semibold font-mono sticky left-0 bg-inherit z-10">
                            {agreement.survey_no}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 font-medium whitespace-nowrap">
                            {agreement.firm_name || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {agreement.land_owner || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono">{agreement.area || "-"}</td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums font-medium">
                            {agreement.area_in_guntas?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {agreement.agreement_date || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums text-center">
                            {agreement.development_months || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {agreement.development_end_date || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span
                              className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-full ring-1 ring-inset whitespace-nowrap ${
                                agreement.possession_status?.toLowerCase() === "given"
                                  ? "bg-emerald-100 text-emerald-800 ring-emerald-600/20"
                                  : "bg-amber-100 text-amber-800 ring-amber-600/20"
                              }`}
                            >
                              {agreement.possession_status || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums">
                            ₹{agreement.rent_per_sqft?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums">
                            {agreement.free_area_bu?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums">
                            {agreement.free_area_cp?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums text-center">
                            {agreement.total_months || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-emerald-700 font-mono tabular-nums font-semibold whitespace-nowrap">
                            ₹{agreement.total_rent?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap">
                            ₹{agreement.agreement_value?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap">
                            ₹{agreement.deposit_da?.toLocaleString("en-IN") || "0"}
                          </td>
                        </>
                      )}

                      {/* Agreement 1 Details */}
                      {shouldShowColumn("agr1") && (
                        <>
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono border-l-2 border-emerald-200 bg-emerald-50/20">
                            {agreement.doc_no_1 || "-"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-emerald-50/20">
                            ₹{agreement.stamp_duty_1?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-emerald-50/20">
                            ₹{agreement.regi_dd_1?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-emerald-50/20">
                            ₹{agreement.handling_charges_1?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-emerald-50/20">
                            ₹{agreement.adjudication_1?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-emerald-50/20">
                            ₹{agreement.legal_expenses_1?.toLocaleString("en-IN") || "0"}
                          </td>
                        </>
                      )}

                      {/* Agreement 2 Details */}
                      {shouldShowColumn("agr2") && (
                        <>
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono border-l-2 border-blue-200 bg-blue-50/20">
                            {agreement.doc_no_2 || "-"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap bg-blue-50/20">
                            {agreement.date_2 || "-"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-blue-50/20">
                            ₹{agreement.stamp_duty_2?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-blue-50/20">
                            ₹{agreement.regi_dd_2?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-blue-50/20">
                            ₹{agreement.handling_charges_2?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-blue-50/20">
                            ₹{agreement.legal_expenses_2?.toLocaleString("en-IN") || "0"}
                          </td>
                        </>
                      )}

                      {/* Agreement 3 Details */}
                      {shouldShowColumn("agr3") && (
                        <>
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono border-l-2 border-purple-200 bg-purple-50/20">
                            {agreement.doc_no_3 || "-"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-purple-50/20">
                            ₹{agreement.stamp_duty_3?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-purple-50/20">
                            ₹{agreement.regi_dd_3?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-800 font-mono tabular-nums whitespace-nowrap bg-purple-50/20">
                            ₹{agreement.handling_charges_3?.toLocaleString("en-IN") || "0"}
                          </td>
                        </>
                      )}

                      <td className="px-4 py-3 text-xs font-bold text-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-2 border-emerald-400 text-center whitespace-nowrap">
                        {(() => {
                          const total =
                            (agreement.stamp_duty_1 || 0) +
                            (agreement.regi_dd_1 || 0) +
                            (agreement.handling_charges_1 || 0) +
                            (agreement.adjudication_1 || 0) +
                            (agreement.legal_expenses_1 || 0) +
                            (agreement.stamp_duty_2 || 0) +
                            (agreement.regi_dd_2 || 0) +
                            (agreement.handling_charges_2 || 0) +
                            (agreement.legal_expenses_2 || 0) +
                            (agreement.stamp_duty_3 || 0) +
                            (agreement.regi_dd_3 || 0) +
                            (agreement.handling_charges_3 || 0)
                          return `₹${total.toLocaleString("en-IN")}`
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center sticky right-0 bg-inherit z-10">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleView(agreement.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(agreement.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(agreement.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Total Agreements</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{filteredAndSortedData.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Total Rent</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{filteredAndSortedData.reduce((sum, a) => sum + (a.total_rent || 0), 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Total Agreement Value</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₹{filteredAndSortedData.reduce((sum, a) => sum + (a.agreement_value || 0), 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAgreementModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingId={editingId}
      />

      <ViewDetails isOpen={isViewModalOpen} onClose={handleViewModalClose} agreementId={viewingId} />
    </div>
  )
}
