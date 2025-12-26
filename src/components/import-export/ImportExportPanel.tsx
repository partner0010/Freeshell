'use client';

import React, { useState } from 'react';
import { Upload, Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { dataImporter, type ImportFormat, type ImportResult } from '@/lib/import-export/data-importer';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function ImportExportPanel() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState<ImportFormat>('csv');
  const [sampleData] = useState([
    { id: 1, name: '사용자 1', email: 'user1@example.com', role: 'admin' },
    { id: 2, name: '사용자 2', email: 'user2@example.com', role: 'user' },
    { id: 3, name: '사용자 3', email: 'user3@example.com', role: 'viewer' },
  ]);
  const { showToast } = useToast();

  const formatOptions = [
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'json', label: 'JSON' },
  ];

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let result: ImportResult;
      
      if (file.name.endsWith('.csv')) {
        result = await dataImporter.importCSV(file);
      } else if (file.name.endsWith('.json')) {
        result = await dataImporter.importJSON(file);
      } else {
        showToast({ type: 'error', message: '지원하지 않는 파일 형식입니다' });
        return;
      }

      setImportResult(result);
      
      if (result.success) {
        showToast({ type: 'success', message: `${result.imported}개 항목이 가져와졌습니다` });
      } else {
        showToast({ type: 'warning', message: `${result.failed}개 항목 가져오기 실패` });
      }
    } catch (error) {
      showToast({ type: 'error', message: '가져오기 중 오류가 발생했습니다' });
    }
  };

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'csv':
      case 'excel':
        content = dataImporter.exportCSV(sampleData);
        filename = `export.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = dataImporter.exportJSON(sampleData);
        filename = 'export.json';
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: '내보내기가 완료되었습니다' });
  };

  const tabs = [
    { id: 'import', label: '가져오기' },
    { id: 'export', label: '내보내기' },
  ];

  const [activeTab, setActiveTab] = useState('import');

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Upload className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">데이터 가져오기/내보내기</h2>
            <p className="text-sm text-gray-500">CSV, Excel, JSON 형식 지원</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'import' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>파일 가져오기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-sm text-gray-600 mb-4">
                      CSV 또는 JSON 파일을 선택하세요
                    </p>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleImport}
                      className="hidden"
                      id="file-import"
                    />
                    <label htmlFor="file-import" className="cursor-pointer">
                      <span className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-base">
                        파일 선택
                      </span>
                    </label>
                  </div>

                  {importResult && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">가져오기 결과</h4>
                        <Badge variant={importResult.success ? 'success' : 'error'}>
                          {importResult.success ? '성공' : '실패'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">가져옴:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            {importResult.imported}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">실패:</span>
                          <span className="ml-2 font-semibold text-red-600">
                            {importResult.failed}
                          </span>
                        </div>
                        {importResult.data && (
                          <div>
                            <span className="text-gray-500">총 항목:</span>
                            <span className="ml-2 font-semibold">
                              {importResult.data.length}
                            </span>
                          </div>
                        )}
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-semibold text-red-600 mb-1">오류:</h5>
                          <ul className="text-xs text-red-600 list-disc list-inside">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>데이터 내보내기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    형식 선택
                  </label>
                  <Dropdown
                    options={formatOptions}
                    value={exportFormat}
                    onChange={(val) => setExportFormat(val as ImportFormat)}
                    placeholder="형식 선택"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">샘플 데이터:</p>
                  <div className="text-xs text-gray-500">
                    {sampleData.length}개 항목
                  </div>
                </div>
                <Button variant="primary" onClick={handleExport} className="w-full">
                  <Download size={18} className="mr-2" />
                  {exportFormat === 'csv' && <FileText size={18} className="mr-2" />}
                  {exportFormat === 'excel' && <FileSpreadsheet size={18} className="mr-2" />}
                  {exportFormat === 'json' && <FileJson size={18} className="mr-2" />}
                  {exportFormat.toUpperCase()}로 내보내기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

