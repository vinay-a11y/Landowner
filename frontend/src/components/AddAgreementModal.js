import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `http://127.0.0.1:8000/api`;

export default function AddAgreementModal({ isOpen, onClose, onSuccess, editingId }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    survey_no: "",
    firm_name: "",
    land_owner: "",
    area: "",
    doc_no_1: "",
    agreement_date: "",
    development_months: 0,
    possession_status: "Not Given",
    rent_per_sqft: 0,
    free_area_bu: 0,
    free_area_cp: 0,
    agreement_value: 0,
    deposit_da: 0,
    stamp_duty_1: 0,
    regi_dd_1: 0,
    handling_charges_1: 0,
    adjudication_1: 0,
    legal_expenses_1: 0,
    doc_no_2: "",
    date_2: "",
    stamp_duty_2: 0,
    regi_dd_2: 0,
    handling_charges_2: 0,
    legal_expenses_2: 0,
    doc_no_3: "",
    stamp_duty_3: 0,
    regi_dd_3: 0,
    handling_charges_3: 0,
  });

  useEffect(() => {
    if (editingId) {
      fetchAgreement();
    }
  }, [editingId]);

  const fetchAgreement = async () => {
    try {
      const response = await axios.get(`${API}/agreements/${editingId}`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching agreement:", error);
      toast.error("Failed to load agreement");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.survey_no || !formData.area || !formData.doc_no_1 || !formData.agreement_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API}/agreements/${editingId}`, formData);
      } else {
        await axios.post(`${API}/agreements`, formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving agreement:", error);
      toast.error("Failed to save agreement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white" data-testid="add-agreement-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {editingId ? 'Edit Agreement' : 'Add New Agreement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Section 1: Basic Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="survey_no" className="text-sm font-medium text-slate-700">Survey No *</Label>
                <Input
                  id="survey_no"
                  data-testid="input-survey-no"
                  value={formData.survey_no}
                  onChange={(e) => handleChange('survey_no', e.target.value)}
                  required
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="firm_name" className="text-sm font-medium text-slate-700">Firm Name</Label>
                <Input
                  id="firm_name"
                  data-testid="input-firm-name"
                  value={formData.firm_name}
                  onChange={(e) => handleChange('firm_name', e.target.value)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="land_owner" className="text-sm font-medium text-slate-700">Land Owner</Label>
                <Input
                  id="land_owner"
                  data-testid="input-land-owner"
                  value={formData.land_owner}
                  onChange={(e) => handleChange('land_owner', e.target.value)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 2: Land & Agreement-1 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Land & Agreement-1</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area" className="text-sm font-medium text-slate-700">Area (A.G.C) *</Label>
                <Input
                  id="area"
                  data-testid="input-area"
                  placeholder="e.g., 0.20.00"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  required
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="doc_no_1" className="text-sm font-medium text-slate-700">Doc No (Agmt-1) *</Label>
                <Input
                  id="doc_no_1"
                  data-testid="input-doc-no-1"
                  value={formData.doc_no_1}
                  onChange={(e) => handleChange('doc_no_1', e.target.value)}
                  required
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="agreement_date" className="text-sm font-medium text-slate-700">Agreement Date (DD-MM-YYYY) *</Label>
                <Input
                  id="agreement_date"
                  data-testid="input-agreement-date"
                  placeholder="25-12-2024"
                  value={formData.agreement_date}
                  onChange={(e) => handleChange('agreement_date', e.target.value)}
                  required
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="development_months" className="text-sm font-medium text-slate-700">Development Months</Label>
                <Input
                  id="development_months"
                  data-testid="input-development-months"
                  type="number"
                  value={formData.development_months}
                  onChange={(e) => handleChange('development_months', parseInt(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="possession_status" className="text-sm font-medium text-slate-700">Possession Status</Label>
                <Select value={formData.possession_status} onValueChange={(value) => handleChange('possession_status', value)}>
                  <SelectTrigger data-testid="select-possession-status" className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Given">Given</SelectItem>
                    <SelectItem value="Not Given">Not Given</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rent_per_sqft" className="text-sm font-medium text-slate-700">Rent Rs/Sqft</Label>
                <Input
                  id="rent_per_sqft"
                  data-testid="input-rent-per-sqft"
                  type="number"
                  step="0.01"
                  value={formData.rent_per_sqft}
                  onChange={(e) => handleChange('rent_per_sqft', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="free_area_bu" className="text-sm font-medium text-slate-700">Free Area BU (Sqft)</Label>
                <Input
                  id="free_area_bu"
                  data-testid="input-free-area-bu"
                  type="number"
                  step="0.01"
                  value={formData.free_area_bu}
                  onChange={(e) => handleChange('free_area_bu', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="free_area_cp" className="text-sm font-medium text-slate-700">Free Area CP (Sqft)</Label>
                <Input
                  id="free_area_cp"
                  data-testid="input-free-area-cp"
                  type="number"
                  step="0.01"
                  value={formData.free_area_cp}
                  onChange={(e) => handleChange('free_area_cp', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="agreement_value" className="text-sm font-medium text-slate-700">Agreement Value</Label>
                <Input
                  id="agreement_value"
                  data-testid="input-agreement-value"
                  type="number"
                  step="0.01"
                  value={formData.agreement_value}
                  onChange={(e) => handleChange('agreement_value', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="deposit_da" className="text-sm font-medium text-slate-700">Deposit (DA)</Label>
                <Input
                  id="deposit_da"
                  data-testid="input-deposit-da"
                  type="number"
                  step="0.01"
                  value={formData.deposit_da}
                  onChange={(e) => handleChange('deposit_da', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="stamp_duty_1" className="text-sm font-medium text-slate-700">Stamp Duty</Label>
                <Input
                  id="stamp_duty_1"
                  data-testid="input-stamp-duty-1"
                  type="number"
                  step="0.01"
                  value={formData.stamp_duty_1}
                  onChange={(e) => handleChange('stamp_duty_1', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="regi_dd_1" className="text-sm font-medium text-slate-700">Regi DD</Label>
                <Input
                  id="regi_dd_1"
                  data-testid="input-regi-dd-1"
                  type="number"
                  step="0.01"
                  value={formData.regi_dd_1}
                  onChange={(e) => handleChange('regi_dd_1', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="handling_charges_1" className="text-sm font-medium text-slate-700">Handling Charges</Label>
                <Input
                  id="handling_charges_1"
                  data-testid="input-handling-charges-1"
                  type="number"
                  step="0.01"
                  value={formData.handling_charges_1}
                  onChange={(e) => handleChange('handling_charges_1', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="adjudication_1" className="text-sm font-medium text-slate-700">Adjudication</Label>
                <Input
                  id="adjudication_1"
                  data-testid="input-adjudication-1"
                  type="number"
                  step="0.01"
                  value={formData.adjudication_1}
                  onChange={(e) => handleChange('adjudication_1', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="legal_expenses_1" className="text-sm font-medium text-slate-700">Legal & Other Expenses</Label>
                <Input
                  id="legal_expenses_1"
                  data-testid="input-legal-expenses-1"
                  type="number"
                  step="0.01"
                  value={formData.legal_expenses_1}
                  onChange={(e) => handleChange('legal_expenses_1', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 3: Agreement-2 (POA) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Agreement-2 (Power of Attorney)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doc_no_2" className="text-sm font-medium text-slate-700">Doc No</Label>
                <Input
                  id="doc_no_2"
                  data-testid="input-doc-no-2"
                  value={formData.doc_no_2}
                  onChange={(e) => handleChange('doc_no_2', e.target.value)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="date_2" className="text-sm font-medium text-slate-700">Date</Label>
                <Input
                  id="date_2"
                  data-testid="input-date-2"
                  placeholder="25-12-2024"
                  value={formData.date_2}
                  onChange={(e) => handleChange('date_2', e.target.value)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="stamp_duty_2" className="text-sm font-medium text-slate-700">Stamp Duty</Label>
                <Input
                  id="stamp_duty_2"
                  data-testid="input-stamp-duty-2"
                  type="number"
                  step="0.01"
                  value={formData.stamp_duty_2}
                  onChange={(e) => handleChange('stamp_duty_2', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="regi_dd_2" className="text-sm font-medium text-slate-700">Regi DD</Label>
                <Input
                  id="regi_dd_2"
                  data-testid="input-regi-dd-2"
                  type="number"
                  step="0.01"
                  value={formData.regi_dd_2}
                  onChange={(e) => handleChange('regi_dd_2', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="handling_charges_2" className="text-sm font-medium text-slate-700">Handling Charges</Label>
                <Input
                  id="handling_charges_2"
                  data-testid="input-handling-charges-2"
                  type="number"
                  step="0.01"
                  value={formData.handling_charges_2}
                  onChange={(e) => handleChange('handling_charges_2', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="legal_expenses_2" className="text-sm font-medium text-slate-700">Legal & Other Expenses</Label>
                <Input
                  id="legal_expenses_2"
                  data-testid="input-legal-expenses-2"
                  type="number"
                  step="0.01"
                  value={formData.legal_expenses_2}
                  onChange={(e) => handleChange('legal_expenses_2', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 4: Agreement-3 (Work Contract) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Agreement-3 (Work Contract)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="doc_no_3" className="text-sm font-medium text-slate-700">Doc No</Label>
                <Input
                  id="doc_no_3"
                  data-testid="input-doc-no-3"
                  value={formData.doc_no_3}
                  onChange={(e) => handleChange('doc_no_3', e.target.value)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="stamp_duty_3" className="text-sm font-medium text-slate-700">Stamp Duty</Label>
                <Input
                  id="stamp_duty_3"
                  data-testid="input-stamp-duty-3"
                  type="number"
                  step="0.01"
                  value={formData.stamp_duty_3}
                  onChange={(e) => handleChange('stamp_duty_3', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="regi_dd_3" className="text-sm font-medium text-slate-700">Regi DD</Label>
                <Input
                  id="regi_dd_3"
                  data-testid="input-regi-dd-3"
                  type="number"
                  step="0.01"
                  value={formData.regi_dd_3}
                  onChange={(e) => handleChange('regi_dd_3', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <Label htmlFor="handling_charges_3" className="text-sm font-medium text-slate-700">Handling Charges</Label>
                <Input
                  id="handling_charges_3"
                  data-testid="input-handling-charges-3"
                  type="number"
                  step="0.01"
                  value={formData.handling_charges_3}
                  onChange={(e) => handleChange('handling_charges_3', parseFloat(e.target.value) || 0)}
                  className="mt-1.5 h-11 bg-white border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              type="button"
              data-testid="cancel-btn"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="submit-btn"
              disabled={loading}
              className="bg-emerald-900 text-white hover:bg-emerald-800 shadow-sm font-medium"
            >
              {loading ? 'Saving...' : editingId ? 'Update Agreement' : 'Add Agreement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}