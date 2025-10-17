import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { AlertCircle, Download } from 'lucide-react';

interface ExcelViewerProps {
  fileUrl: string;
  fileName: string;
  zoom: number;
}

export const ExcelViewer = ({ fileUrl, fileName, zoom }: ExcelViewerProps) => {
  const [sheets, setSheets] = useState<any[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadWorkbook = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl, {
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (!mounted) return;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        if (!mounted) return;

        const sheetsData = workbook.worksheets.map(worksheet => ({
          name: worksheet.name,
          rows: worksheet.getSheetValues(),
        }));

        setSheets(sheetsData);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('ExcelViewer error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load spreadsheet');
        setLoading(false);
      }
    };

    loadWorkbook();

    return () => {
      mounted = false;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500 max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Unable to Load Spreadsheet</p>
          <p className="text-sm mb-4">{error}</p>
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Spreadsheet
          </a>
        </div>
      </div>
    );
  }

  const currentSheet = sheets[activeSheet];
  const zoomScale = zoom / 100;

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex gap-2 p-2 bg-white border-b overflow-x-auto flex-shrink-0">
        {sheets.map((sheet, index) => (
          <button
            key={index}
            onClick={() => setActiveSheet(index)}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
              activeSheet === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div 
          style={{ 
            transform: `scale(${zoomScale})`, 
            transformOrigin: 'top left',
            marginBottom: zoomScale !== 1 ? `${(zoomScale - 1) * 100}%` : '0'
          }}
        >
          <table className="border-collapse bg-white shadow-lg">
            <tbody>
              {currentSheet?.rows?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  {Array.isArray(row) &&
                    row.map((cell: any, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-3 py-2 text-sm"
                      >
                        {cell?.toString() || ''}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
