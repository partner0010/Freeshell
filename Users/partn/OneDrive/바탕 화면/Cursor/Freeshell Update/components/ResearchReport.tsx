'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, BarChart3, Table, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ResearchReportProps {
  topic: string;
  data: {
    summary: string;
    insights: string[];
    charts: Array<{
      type: 'bar' | 'line' | 'pie';
      title: string;
      data: ChartData[];
    }>;
    tables: Array<{
      title: string;
      headers: string[];
      rows: string[][];
    }>;
  };
}

export default function ResearchReport({ topic, data }: ResearchReportProps) {
  const [selectedChart, setSelectedChart] = useState(0);

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    // 실제로는 API 호출하여 내보내기
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">연구 보고서</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{topic}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 요약 */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>요약</span>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
        </div>

        {/* 통찰력 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">주요 통찰력</h3>
          <ul className="space-y-2">
            {data.insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 차트 */}
        {data.charts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>데이터 시각화</span>
              </h3>
              <div className="flex space-x-2">
                {data.charts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedChart(index)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedChart === index
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    차트 {index + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-4">{data.charts[selectedChart]?.title}</h4>
              <ResponsiveContainer width="100%" height={300}>
                {data.charts[selectedChart]?.type === 'bar' ? (
                  <BarChart data={data.charts[selectedChart].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                ) : data.charts[selectedChart]?.type === 'line' ? (
                  <LineChart data={data.charts[selectedChart].data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data.charts[selectedChart].data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {data.charts[selectedChart].data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 테이블 */}
        {data.tables.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Table className="w-5 h-5 text-primary" />
              <span>데이터 테이블</span>
            </h3>
            {data.tables.map((table, tableIndex) => (
              <div key={tableIndex} className="mb-6">
                <h4 className="font-semibold mb-2">{table.title}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-900">
                        {table.headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left border border-gray-200 dark:border-gray-700 font-semibold"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 border border-gray-200 dark:border-gray-700"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

