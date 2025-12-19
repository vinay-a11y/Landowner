"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MapPin, Coins, File } from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export default function ViewDetails({ isOpen, onClose, agreementId }) {
  const [loading, setLoading] = useState(true)
  const [agreement, setAgreement] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && agreementId) {
      fetchAgreementDetails()
    }
  }, [isOpen, agreementId])

  const fetchAgreementDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API}/agreements/${agreementId}`)
      setAgreement(response.data)
    } catch (err) {
      console.error("Error fetching agreement details:", err)
      setError("Failed to load agreement details")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return value ? `₹${value.toLocaleString("en-IN")}` : "₹0"
  }

  const formatDate = (date) => {
    return date || "-"
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Agreement Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {!loading && !error && agreement && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Survey No</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.survey_no || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Firm Name</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.firm_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Land Owner</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.land_owner || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Area</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.area || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Area in Guntas</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {agreement.area_in_guntas ? agreement.area_in_guntas.toFixed(2) : "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Possession Status</p>
                  <p className="text-sm font-semibold mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        agreement.possession_status?.toLowerCase() === "given"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {agreement.possession_status || "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Timeline */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Agreement Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(agreement.agreement_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Development Months</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.development_months || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Development End Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatDate(agreement.development_end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total Months</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.total_months || 0}</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Financial Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Rent per Sqft</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {agreement.rent_per_sqft ? `₹${agreement.rent_per_sqft.toFixed(2)}` : "₹0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Free BU Area</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {agreement.free_area_bu ? agreement.free_area_bu.toLocaleString("en-IN") : "0"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Free CP Area</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {agreement.free_area_cp ? agreement.free_area_cp.toLocaleString("en-IN") : "0"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total Rent</p>
                  <p className="text-sm font-semibold text-emerald-700 mt-1">{formatCurrency(agreement.total_rent)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Agreement Value</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.agreement_value)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Deposit DA</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.deposit_da)}</p>
                </div>
              </div>
            </div>

            {/* Agreement 1 (POA) */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-6 border border-emerald-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-emerald-600" />
                Agreement 1 (POA)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Doc No</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.doc_no_1 || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Stamp Duty</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.stamp_duty_1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Regi DD</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.regi_dd_1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Handling Charges</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.handling_charges_1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Adjudication</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.adjudication_1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Legal Expenses</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.legal_expenses_1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement 2 (POA) */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-blue-600" />
                Agreement 2 (POA)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Doc No</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.doc_no_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(agreement.date_2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Stamp Duty</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.stamp_duty_2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Regi DD</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.regi_dd_2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Handling Charges</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.handling_charges_2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Legal Expenses</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.legal_expenses_2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement 3 (Work Contract) */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-6 border border-purple-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-purple-600" />
                Agreement 3 (Work Contract)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Doc No</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{agreement.doc_no_3 || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Stamp Duty</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.stamp_duty_3)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Regi DD</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatCurrency(agreement.regi_dd_3)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Handling Charges</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatCurrency(agreement.handling_charges_3)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Expenses Summary */}
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg p-6 border-2 border-emerald-400">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Coins className="w-6 h-6 text-emerald-700" />
                Total Expenses Summary
              </h3>
              <div className="bg-white rounded-lg p-6 border border-emerald-300">
                <div className="text-center">
                  <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">Total of All Agreement Expenses</p>
                  <p className="text-4xl font-bold text-emerald-700">
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
                      return formatCurrency(total)
                    })()}
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-200 grid grid-cols-3 gap-4 text-left">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Agreement 1 Total</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {(() => {
                          const agr1Total =
                            (agreement.stamp_duty_1 || 0) +
                            (agreement.regi_dd_1 || 0) +
                            (agreement.handling_charges_1 || 0) +
                            (agreement.adjudication_1 || 0) +
                            (agreement.legal_expenses_1 || 0)
                          return formatCurrency(agr1Total)
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Agreement 2 Total</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {(() => {
                          const agr2Total =
                            (agreement.stamp_duty_2 || 0) +
                            (agreement.regi_dd_2 || 0) +
                            (agreement.handling_charges_2 || 0) +
                            (agreement.legal_expenses_2 || 0)
                          return formatCurrency(agr2Total)
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Agreement 3 Total</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {(() => {
                          const agr3Total =
                            (agreement.stamp_duty_3 || 0) +
                            (agreement.regi_dd_3 || 0) +
                            (agreement.handling_charges_3 || 0)
                          return formatCurrency(agr3Total)
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
