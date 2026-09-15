import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../auth/AuthContext";
import { bulkCreateFoodEntries } from "./foodEntries.api";

export function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [validEntries, setValidEntries] = useState([]);
  const [invalidEntries, setInvalidEntries] = useState([]);
  const [error, setError] = useState(null);
  
  const { accessToken } = useAuth();
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFile(null);
    setValidEntries([]);
    setInvalidEntries([]);
    setError(null);
    onClose();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "text/csv") {
      setFile(selected);
      parseCSV(selected);
    } else {
      setError("Please select a valid .csv file.");
    }
  };

  const parseCSV = (csvFile) => {
    setIsParsing(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const valid = [];
        const invalid = [];

        rows.forEach((row, index) => {
          try {
            // Flexible header mapping (lowercase and strip spaces for comparison)
            const getCol = (possibleNames) => {
              const rowKeys = Object.keys(row);
              const foundKey = rowKeys.find(k => 
                possibleNames.some(pn => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pn))
              );
              return foundKey ? row[foundKey] : undefined;
            };

            const foodName = getCol(["food", "name", "item"]);
            const mealStr = getCol(["meal", "type"])?.toUpperCase();
            const dateStr = getCol(["date", "time", "eaten"]);
            const quantity = parseFloat(getCol(["qty", "amount", "quantity"]) || "1");
            const unitStr = getCol(["unit", "measure"])?.toUpperCase() || "SERVING";
            
            const calories = parseFloat(getCol(["cal", "kcal"]) || "-1");
            const proteinG = parseFloat(getCol(["pro", "protein"]) || "0");
            const carbsG = parseFloat(getCol(["carb"]) || "0");
            const fatG = parseFloat(getCol(["fat"]) || "0");

            // Validation
            const rowNumber = index + 2; // +1 for 0-index, +1 for header
            let reason = "";

            if (!foodName) reason += "Missing Food Name. ";
            if (!["BREAKFAST", "LUNCH", "DINNER", "SNACK"].includes(mealStr)) {
              reason += `Invalid Meal Type: ${mealStr}. `;
            }
            const parsedDate = new Date(dateStr);
            if (!dateStr || isNaN(parsedDate.getTime())) {
              reason += "Invalid Date format. ";
            }
            if (calories < 0 || isNaN(calories)) {
              reason += "Missing/Invalid Calories. ";
            }
            if (!["GRAM", "MILLILITER", "PIECE", "SERVING"].includes(unitStr)) {
              reason += `Invalid Unit: ${unitStr}. `;
            }

            if (reason) {
              invalid.push({ rowNumber, row, reason: reason.trim() });
            } else {
              valid.push({
                foodName,
                mealType: mealStr,
                eatenAt: parsedDate.toISOString(),
                quantity,
                quantityUnit: unitStr,
                calories,
                proteinG,
                carbsG,
                fatG,
                source: "MANUAL"
              });
            }
          } catch (err) {
            invalid.push({ rowNumber: index + 2, row, reason: "Parsing error" });
          }
        });

        setValidEntries(valid);
        setInvalidEntries(invalid);
        setIsParsing(false);
      },
      error: (err) => {
        setError(err.message);
        setIsParsing(false);
      }
    });
  };

  const handleImport = async () => {
    if (validEntries.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      await bulkCreateFoodEntries(validEntries, accessToken);
      onImportSuccess(validEntries.length);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to import entries.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Bulk CSV Import</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-white">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!file ? (
            // Upload State
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Click to upload CSV</h3>
              <p className="text-sm text-gray-500 mb-6">Must include columns for Food Name, Calories, Meal, and Date.</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" className="pointer-events-none">Select File</Button>
            </div>
          ) : isParsing ? (
            // Parsing State
            <div className="py-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Parsing CSV...</p>
            </div>
          ) : (
            // Review State
            <div className="space-y-6">
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-700 mb-1">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm uppercase tracking-wide">Ready to Import</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{validEntries.length}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center text-red-700 mb-1">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm uppercase tracking-wide">Rejected</span>
                  </div>
                  <p className="text-3xl font-bold text-red-900">{invalidEntries.length}</p>
                </div>
              </div>

              {/* Invalid Entries Warning */}
              {invalidEntries.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">Rejected Rows</h3>
                  <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-red-100 text-red-800">
                        <tr>
                          <th className="px-4 py-3 font-semibold w-20">Row</th>
                          <th className="px-4 py-3 font-semibold">Reason</th>
                          <th className="px-4 py-3 font-semibold text-right">Raw Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 bg-white">
                        {invalidEntries.slice(0, 10).map((err, i) => (
                          <tr key={i} className="hover:bg-red-50/50">
                            <td className="px-4 py-3 text-gray-600 font-medium">#{err.rowNumber}</td>
                            <td className="px-4 py-3 text-red-600 font-medium">{err.reason}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs text-right truncate max-w-[200px]" title={JSON.stringify(err.row)}>
                              {JSON.stringify(err.row)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {invalidEntries.length > 10 && (
                    <p className="text-sm text-gray-500 italic">...and {invalidEntries.length - 10} more rejected rows.</p>
                  )}
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                    The rows above are skipped and will <span className="font-bold text-red-600">not</span> be imported. You can safely proceed with the valid entries.
                  </p>
                </div>
              )}

              {/* Valid Entries Preview */}
              {validEntries.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">Valid Entries (Preview)</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Food</th>
                          <th className="px-4 py-3 font-semibold">Meal</th>
                          <th className="px-4 py-3 font-semibold text-right">Calories</th>
                          <th className="px-4 py-3 font-semibold text-right">Macros (P/C/F)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {validEntries.slice(0, 5).map((entry, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{entry.foodName}</td>
                            <td className="px-4 py-3 text-gray-600">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{entry.mealType}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800 text-right">{entry.calories} kcal</td>
                            <td className="px-4 py-3 text-gray-500 text-right">
                              {entry.proteinG}g / {entry.carbsG}g / {entry.fatG}g
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {validEntries.length > 5 && (
                    <p className="text-sm text-gray-500 italic">...showing 5 of {validEntries.length} valid entries.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {file && !isParsing && (
          <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <button 
              onClick={() => { setFile(null); setError(null); }}
              className="text-gray-500 hover:text-red-600 font-medium text-sm flex items-center transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Start Over
            </button>
            <div className="space-x-3">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleImport} 
                disabled={validEntries.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                {isUploading ? "Importing..." : `Import ${validEntries.length} Entries`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
