'use client';

import React, { useState } from 'react';
import { FileBarChart, Plus, Download, Play, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { reportBuilder, type Report, type ReportType, type ReportColumn } from '@/lib/reporting/report-builder';
import { useToast } from '@/components/ui/Toast';

export function ReportBuilderPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<ReportType>('table');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setReports(reportBuilder.getAllReports());
  }, []);

  const reportTypeOptions = [
    { value: 'table', label: '테이블' },
    { value: 'chart', label: '차트' },
    { value: 'summary', label: '요약' },
    { value: 'custom', label: '커스텀' },
  ];

  const handleCreateReport = () => {
    if (!reportName.trim()) {
      showToast({ type: 'warning', message: '보고서 이름을 입력해주세요' });
      return;
    }

    const report = reportBuilder.createReport(reportName, reportType, 'default-data');
    setReports([...reports, report]);
    setSelectedReport(report);
    setReportName('');
    showToast({ type: 'success', message: '보고서가 생성되었습니다' });
  };

  const handleAddColumn = () => {
    if (!selectedReport) return;

    reportBuilder.addColumn(selectedReport.id, {
      field: `field_${Date.now()}`,
      label: '새 컬럼',
      type: 'string',
    });

    setReports(reportBuilder.getAllReports());
    setSelectedReport(reportBuilder.getReport(selectedReport.id) || null);
    showToast({ type: 'success', message: '컬럼이 추가되었습니다' });
  };

  const handleGenerate = async () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    try {
      const result = await reportBuilder.generateReport(selectedReport.id);
      showToast({ type: 'success', message: '보고서가 생성되었습니다' });
      // 결과 표시 로직 추가 가능
    } catch (error) {
      showToast({ type: 'error', message: '보고서 생성 중 오류가 발생했습니다' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedReport) return;

    const filename = format === 'pdf'
      ? reportBuilder.exportToPDF(selectedReport.id)
      : reportBuilder.exportToExcel(selectedReport.id);
    
    showToast({ type: 'success', message: `${filename} 다운로드 준비됨` });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileBarChart className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">보고서 빌더</h2>
            <p className="text-sm text-gray-500">커스텀 보고서 생성 및 내보내기</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 보고서 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 보고서 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="보고서 이름"
              />
              <Dropdown
                options={reportTypeOptions}
                value={reportType}
                onChange={(val) => setReportType(val as ReportType)}
                placeholder="보고서 유형"
              />
              <Button variant="primary" onClick={handleCreateReport} className="w-full">
                <Plus size={18} className="mr-2" />
                보고서 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 보고서 목록 */}
        {reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>보고서 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{report.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {report.type} · 컬럼 {report.columns.length}개
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 보고서 상세 */}
        {selectedReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedReport.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Play size={14} className="mr-1" />
                    {isGenerating ? '생성 중...' : '생성'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileText size={14} className="mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                  >
                    <FileSpreadsheet size={14} className="mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={handleAddColumn}>
                  <Plus size={14} className="mr-1" />
                  컬럼 추가
                </Button>
                {selectedReport.columns.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    컬럼이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedReport.columns.map((column, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{column.type}</Badge>
                          <span className="font-medium">{column.label}</span>
                          <span className="text-xs text-gray-400">({column.field})</span>
                          {column.aggregation && (
                            <Badge variant="outline" size="sm">
                              {column.aggregation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

