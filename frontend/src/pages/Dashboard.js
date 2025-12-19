"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { PlusCircle, FileSpreadsheet, TrendingUp, MapPin, Building2, DollarSign, Users } from "lucide-react"
import AddAgreementModal from "@/components/AddAgreementModal"
import SpreadsheetView from "@/pages/SpreadsheetView"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
const API = `${BACKEND_URL}/api`

const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#f97316",
  "#14b8a6",
]

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [agreements, setAgreements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSpreadsheet, setShowSpreadsheet] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [summaryRes, agreementsRes] = await Promise.all([
        axios.get(`${API}/dashboard/summary`),
        axios.get(`${API}/agreements`),
      ])
      setSummary(summaryRes.data)
      setAgreements(agreementsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAgreementAdded = () => {
    setShowModal(false)
    fetchData()
    toast.success("Agreement added successfully!")
  }

  const rentChartData = agreements
    .filter((a) => a.total_rent > 0)
    .map((a) => ({
      name: a.land_owner || a.survey_no,
      rent: a.total_rent,
      survey_no: a.survey_no,
    }))

  const areaChartData = agreements.map((a, index) => ({
    name: a.land_owner || a.survey_no,
    area: a.area_in_guntas,
    survey_no: a.survey_no,
    x: index,
    y: a.area_in_guntas,
  }))

  const expenseChartData = agreements.map((a) => {
    const isPayingRent = a.total_rent > 0
    return {
      name: a.land_owner || a.survey_no,
      total: a.total_agreement_expense,
      rent: a.total_rent,
      survey_no: a.survey_no,
      isPayingRent,
      monthly_rent: a.rent_per_sqft * a.free_area_bu,
      total_months: a.total_months,
      owner: a.land_owner || "N/A",
    }
  })

  const rentPayingDetails = agreements
    .filter((a) => a.total_rent > 0)
    .map((a) => ({
      owner: a.land_owner || "N/A",
      survey_no: a.survey_no,
      rent_amount: a.total_rent,
      monthly_rent: a.rent_per_sqft * a.free_area_bu,
      total_months: a.total_months,
      possession_status: a.possession_status,
    }))
    .sort((a, b) => b.rent_amount - a.rent_amount)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (showSpreadsheet) {
    return <SpreadsheetView onBack={() => setShowSpreadsheet(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight" data-testid="dashboard-title">
                Land Agreement Management
              </h1>
              <p className="text-slate-600 mt-1">Manage and track all land agreements in one place</p>
            </div>
            <div className="flex gap-3">
              <Button
                data-testid="view-spreadsheet-btn"
                variant="outline"
                onClick={() => setShowSpreadsheet(true)}
                className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                View Spreadsheet
              </Button>
              <Button
                data-testid="add-agreement-btn"
                onClick={() => setShowModal(true)}
                className="bg-sky-600 text-white hover:bg-sky-700 shadow-sm font-medium"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Agreement
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-total-land"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-sky-600" />
                Total Land Count
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {summary?.total_land_count || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Active agreements</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-total-area"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                Total Area
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {summary?.total_area_guntas?.toFixed(2) || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Guntas</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-free-bu-area"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-amber-600" />
                Total Free BU Area
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {summary?.total_free_bu_area?.toFixed(2) || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Sqft</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-total-rent"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-pink-600" />
                Total Rent Value
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                ₹{summary?.total_rent_value?.toLocaleString("en-IN") || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Cumulative rent</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-total-expenses"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600">Total Agreement Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                ₹{summary?.total_agreement_expenses?.toLocaleString("en-IN") || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">All agreements</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            data-testid="card-net-cost"
          >
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-sm font-medium text-slate-600">Net Project Cost</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                ₹{summary?.net_project_cost?.toLocaleString("en-IN") || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Rent Paying Details Table */}
        <Card className="bg-white border-slate-200 shadow-sm mb-6" data-testid="rent-paying-details">
          <CardHeader className="border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-pink-600" />
              Rent Paying Details
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Owners currently paying rent (possession not given)</p>
          </CardHeader>
          <CardContent className="p-0">
            {rentPayingDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Owner Name
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Survey No
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Monthly Rent
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Months
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Total Rent
                      </th>
                      <th className="text-center p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rentPayingDetails.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-900">{item.owner}</td>
                        <td className="p-4 text-sm text-slate-600 font-mono">{item.survey_no}</td>
                        <td className="p-4 text-sm text-slate-900 text-right font-mono">
                          ₹{item.monthly_rent.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-sm text-slate-600 text-right font-mono">{item.total_months}</td>
                        <td className="p-4 text-sm font-semibold text-pink-600 text-right font-mono">
                          ₹{item.rent_amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Given
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={4} className="p-4 text-sm font-semibold text-slate-900 text-right">
                        Grand Total:
                      </td>
                      <td className="p-4 text-lg font-bold text-pink-600 text-right font-mono">
                        ₹{rentPayingDetails.reduce((sum, item) => sum + item.rent_amount, 0).toLocaleString("en-IN")}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No rent payments due - All possessions have been given</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent Chart */}
          <Card className="bg-white border-slate-200 shadow-sm" data-testid="rent-chart">
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Rent Distribution by Owner</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Showing owners with outstanding rent</p>
            </CardHeader>
            <CardContent className="p-6">
              {rentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={rentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Rent"]}
                      labelFormatter={(label) => `Owner: ${label}`}
                    />
                    <Bar dataKey="rent" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No rent payments due</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Area Chart */}
          <Card className="bg-white border-slate-200 shadow-sm" data-testid="area-chart">
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Area Distribution by Owner</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Land area in guntas (hover for details)</p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    label={{ value: "Area (Guntas)", angle: -90, position: "insideLeft", style: { fill: "#64748b" } }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px",
                    }}
                    content={(props) => {
                      if (props.active && props.payload && props.payload.length) {
                        const data = props.payload[0].payload
                        return (
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
                            <p className="font-semibold text-slate-900 mb-2">{data.name}</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-600">
                                <span className="font-medium">Survey No:</span> {data.survey_no}
                              </p>
                              <p className="text-slate-900 font-semibold">
                                <span className="font-medium">Area:</span> {data.area.toFixed(2)} Guntas
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter data={areaChartData} fill="#8b5cf6">
                    {areaChartData.map((entry, index) => (
                      <Cell key={`dot-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              {/* Custom Legend Below the Chart */}
              {/* <div className="mt-4 max-h-32 overflow-y-auto border-t pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {areaChartData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-700 truncate">
                        {entry.name} ({entry.survey_no})
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2" data-testid="expense-chart">
            <CardHeader className="border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Total Expenses by Owner</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Dotted chart showing total expenses. Owners paying rent shown in pink, others in purple.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px",
                    }}
                    content={(props) => {
                      if (props.active && props.payload && props.payload.length) {
                        const data = props.payload[0].payload
                        return (
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
                            <p className="font-semibold text-slate-900 mb-2">{data.owner}</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-600">
                                <span className="font-medium">Survey No:</span> {data.survey_no}
                              </p>
                              <p className="text-slate-900 font-semibold">
                                <span className="font-medium">Total Expense:</span> ₹
                                {data.total.toLocaleString("en-IN")}
                              </p>
                              {data.isPayingRent && (
                                <>
                                  <div className="border-t border-slate-200 my-2 pt-2">
                                    <p className="text-pink-600 font-medium mb-1">Rent Details:</p>
                                    <p className="text-slate-600">
                                      <span className="font-medium">Monthly Rent:</span> ₹
                                      {data.monthly_rent.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-slate-600">
                                      <span className="font-medium">Total Months:</span> {data.total_months}
                                    </p>
                                    <p className="text-pink-600 font-semibold">
                                      <span className="font-medium">Total Rent:</span> ₹
                                      {data.rent.toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    content={() => (
                      <div className="flex justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-pink-500" />
                          <span className="text-slate-700">Paying Rent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-purple-500" />
                          <span className="text-slate-700">Possession Given</span>
                        </div>
                      </div>
                    )}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} fillOpacity={0.8} strokeDasharray="4 4" stroke="#64748b">
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPayingRent ? "#ec4899" : "#8b5cf6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Agreement Modal */}
      {showModal && (
        <AddAgreementModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleAgreementAdded} />
      )}
    </div>
  )
}
