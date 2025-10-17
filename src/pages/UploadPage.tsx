import React, { useState } from 'react';
import { Upload, Scan, Settings as SettingsIcon, Printer, Check, X, Info } from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import { UploadModal } from '../components/UploadModal';
import { processScannedImage, dataUrlToFile, getScanSettings, saveScanSettings, type ScanSettings } from '../services/scanService';

export const UploadPage: React.FC = () => {
  const { setUploadModalOpen, isUploadModalOpen } = useDocumentStore();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scanSettings, setScanSettingsState] = useState<ScanSettings>(getScanSettings());
  const [showSettings, setShowSettings] = useState(false);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(async () => {
      const simulatedScanUrl = 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800';

      try {
        const processedImage = await processScannedImage(simulatedScanUrl, scanSettings);
        setScanPreview(processedImage);
        setIsScanning(false);
      } catch (error) {
        console.error('Error processing scanned image:', error);
        setScanPreview(simulatedScanUrl);
        setIsScanning(false);
      }
    }, 3000);
  };

  const handleSaveScan = async () => {
    if (scanPreview) {
      try {
        const fileName = `scanned-document-${Date.now()}.jpg`;
        const file = await dataUrlToFile(scanPreview, fileName);
        setScannedFile(file);
        setScanPreview(null);
        setScanProgress(0);
        setIsScanModalOpen(false);
        setUploadModalOpen(true);
      } catch (error) {
        console.error('Error converting scan to file:', error);
      }
    }
  };

  const handleCancelScan = () => {
    setScanPreview(null);
    setScanProgress(0);
    setIsScanModalOpen(false);
    setScannedFile(null);
    setShowSettings(false);
  };

  const handleSettingsChange = (key: keyof ScanSettings, value: any) => {
    const newSettings = { ...scanSettings, [key]: value };
    setScanSettingsState(newSettings);
    saveScanSettings(newSettings);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-y-auto">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="mb-6 bg-white rounded-2xl px-6 py-4 shadow-sm border border-blue-100/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Scan & Upload</h1>
          <p className="text-sm text-gray-600">
            Upload documents to your archive or scan new documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100/50 overflow-hidden">
            <div className="flex flex-col items-center p-6 pb-5">
              <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Scan className="w-12 h-12 text-blue-600" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2.5 text-center">Scan Documents</h3>
              <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed min-h-[42px]">
                Scan physical documents using a connected scanner or printer
              </p>
            </div>

            <button
              onClick={() => setIsScanModalOpen(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Open document scanner"
            >
              Scan
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100/50 overflow-hidden">
            <div className="flex flex-col items-center p-6 pb-5">
              <div className="w-24 h-24 bg-green-50 rounded-2xl flex items-center justify-center mb-5">
                <Upload className="w-12 h-12 text-green-600" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2.5 text-center">Upload Files</h3>
              <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed min-h-[42px]">
                Upload digital documents from your computer or cloud storage
              </p>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Open file upload modal"
            >
              Upload
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100/50 overflow-hidden">
            <div className="flex flex-col items-center p-6 pb-5">
              <div className="w-24 h-24 flex items-center justify-center mb-5">
                <img
                  src="/Upload Confidential Files.png"
                  alt="Confidential folder icon"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2.5 text-center">Upload Top Secret Files</h3>
              <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed min-h-[42px]">
                Upload any confidential or top secret documents
              </p>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Open confidential file upload modal"
            >
              Upload Confidential Files
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Quick Settings</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all duration-200 group border border-blue-200 hover:shadow-md"
              aria-label="Quick scan"
            >
              <div className="w-11 h-11 bg-blue-500 rounded-lg flex items-center justify-center mb-2.5 shadow-sm group-hover:bg-blue-600 transition-colors">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Quick Scan</span>
              <span className="text-xs text-gray-600 mt-0.5">Start scanning</span>
            </button>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-green-50 rounded-xl transition-all duration-200 group border border-green-200 hover:shadow-md"
              aria-label="Quick upload"
            >
              <div className="w-11 h-11 bg-green-500 rounded-lg flex items-center justify-center mb-2.5 shadow-sm group-hover:bg-green-600 transition-colors">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Quick Upload</span>
              <span className="text-xs text-gray-600 mt-0.5">Browse files</span>
            </button>

            <button
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-xl transition-all duration-200 group border border-gray-200 hover:shadow-md"
              aria-label="Printer settings"
              title="Configure printer settings"
            >
              <div className="w-11 h-11 bg-gray-600 rounded-lg flex items-center justify-center mb-2.5 shadow-sm group-hover:bg-gray-700 transition-colors">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Printers</span>
              <span className="text-xs text-gray-600 mt-0.5">Manage devices</span>
            </button>

            <button
              onClick={() => { setIsScanModalOpen(true); setShowSettings(true); }}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-xl transition-all duration-200 group border border-gray-200 hover:shadow-md"
              aria-label="Scan settings"
              title="Configure scan settings"
            >
              <div className="w-11 h-11 bg-gray-600 rounded-lg flex items-center justify-center mb-2.5 shadow-sm group-hover:bg-gray-700 transition-colors">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Settings</span>
              <span className="text-xs text-gray-600 mt-0.5">Scan options</span>
            </button>
          </div>
        </div>

        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Supported File Types</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                We support PDF, Word (DOC, DOCX), Excel (XLS, XLSX), PowerPoint (PPT, PPTX), images (JPG, PNG, TIFF), and more. Maximum file size: 100MB per file.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isScanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Document Scanner</h2>
                </div>
                <button
                  onClick={handleCancelScan}
                  className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-sm"
                  aria-label="Close scanner modal"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!scanPreview && !isScanning && !showSettings && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Printer className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Scan</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Place your document on the scanner and click Start Scan to begin
                  </p>
                  <div className="space-y-3 mb-8 max-w-md mx-auto">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Scanner</span>
                      <span className="text-sm font-semibold text-gray-900">HP LaserJet Pro</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Color Mode</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">{scanSettings.colorMode}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Resolution</span>
                      <span className="text-sm font-semibold text-gray-900">{scanSettings.resolution} DPI</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleStartScan}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Start Scan
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold flex items-center gap-2 shadow-sm hover:shadow"
                      aria-label="Open scan settings"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>
              )}

              {showSettings && !isScanning && !scanPreview && (
                <div className="py-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Settings</h3>
                    <p className="text-sm text-gray-600">Customize your scanning preferences</p>
                  </div>
                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Color Mode</label>
                      <select
                        value={scanSettings.colorMode}
                        onChange={(e) => handleSettingsChange('colorMode', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-gray-300"
                      >
                        <option value="color">Color</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="blackwhite">Black & White</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Resolution</label>
                      <select
                        value={scanSettings.resolution}
                        onChange={(e) => handleSettingsChange('resolution', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-gray-300"
                      >
                        <option value="150">150 DPI (Fast)</option>
                        <option value="300">300 DPI (Standard)</option>
                        <option value="600">600 DPI (High Quality)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Advanced Options</label>
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={scanSettings.autoDetectEdges}
                            onChange={(e) => handleSettingsChange('autoDetectEdges', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Auto-detect document edges</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={scanSettings.autoCrop}
                            onChange={(e) => handleSettingsChange('autoCrop', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Auto-crop document</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={scanSettings.enhanceImage}
                            onChange={(e) => handleSettingsChange('enhanceImage', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Enhance image quality</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Save Settings
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="text-center py-12">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl animate-pulse shadow-lg" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Scan className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning in Progress</h3>
                  <p className="text-gray-600 mb-8">Please wait while your document is being scanned</p>
                  <div className="max-w-md mx-auto">
                    <div className="relative w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${scanProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">{scanProgress}% Complete</p>
                  </div>
                </div>
              )}

              {scanPreview && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Preview</h3>
                    <p className="text-gray-600">Review your scanned document before saving</p>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden mb-6 shadow-lg">
                    <img
                      src={scanPreview}
                      alt="Scanned document preview"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveScan}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Check className="w-5 h-5" />
                      Save & Upload
                    </button>
                    <button
                      onClick={() => {
                        setScanPreview(null);
                        setScanProgress(0);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Scan className="w-5 h-5" />
                      Scan Again
                    </button>
                    <button
                      onClick={handleCancelScan}
                      className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setScannedFile(null);
        }}
        scannedFile={scannedFile}
      />
    </div>
  );
};
