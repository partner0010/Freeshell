'use client';

import React, { useState } from 'react';
import { Database, Plus, Code, Table, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { databaseBuilder, type DatabaseSchema, type DatabaseTable, type DatabaseField, type FieldType } from '@/lib/database/database-builder';
import { useToast } from '@/components/ui/Toast';

export function DatabaseBuilderPanel() {
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<DatabaseSchema | null>(null);
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [schemaName, setSchemaName] = useState('');
  const [showSQL, setShowSQL] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setSchemas(databaseBuilder.getAllSchemas());
  }, []);

  const fieldTypes: FieldType[] = ['string', 'number', 'boolean', 'date', 'email', 'url', 'json', 'relation'];
  const fieldTypeOptions = fieldTypes.map(t => ({ value: t, label: t }));

  const handleCreateSchema = () => {
    if (!schemaName.trim()) {
      showToast({ type: 'warning', message: '스키마 이름을 입력해주세요' });
      return;
    }

    const schema = databaseBuilder.createSchema(schemaName);
    setSchemas([...schemas, schema]);
    setSelectedSchema(schema);
    setSchemaName('');
    showToast({ type: 'success', message: '스키마가 생성되었습니다' });
  };

  const handleAddTable = () => {
    if (!selectedSchema) return;

    databaseBuilder.addTable(selectedSchema.id, {
      name: `table_${Date.now()}`,
      fields: [],
    });

    setSchemas(databaseBuilder.getAllSchemas());
    setSelectedSchema(databaseBuilder.getSchema(selectedSchema.id) || null);
    showToast({ type: 'success', message: '테이블이 추가되었습니다' });
  };

  const handleCopySQL = () => {
    if (!selectedSchema) return;

    const sql = databaseBuilder.generateSQL(selectedSchema);
    navigator.clipboard.writeText(sql);
    showToast({ type: 'success', message: 'SQL 코드가 복사되었습니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Database className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">데이터베이스 빌더</h2>
            <p className="text-sm text-gray-500">시각적 데이터베이스 설계 및 SQL 생성</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 스키마 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 스키마 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="스키마 이름"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreateSchema}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 스키마 목록 */}
        {schemas.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>스키마 목록</CardTitle>
                {selectedSchema && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSQL(!showSQL)}
                  >
                    <Code size={14} className="mr-1" />
                    {showSQL ? '스키마 보기' : 'SQL 보기'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schemas.map((schema) => (
                  <div
                    key={schema.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSchema?.id === schema.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{schema.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          테이블: {schema.tables.length}개
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 스키마 상세 */}
        {selectedSchema && (
          <>
            {showSQL ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>SQL 코드</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopySQL}>
                      <Code size={14} className="mr-1" />
                      복사
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    <code>{databaseBuilder.generateSQL(selectedSchema)}</code>
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedSchema.name} 스키마</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleAddTable}>
                      <Plus size={14} className="mr-1" />
                      테이블 추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSchema.tables.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        테이블이 없습니다. 테이블 추가 버튼을 클릭하세요.
                      </div>
                    ) : (
                      selectedSchema.tables.map((table) => (
                        <div key={table.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Table size={20} className="text-gray-600" />
                            <h4 className="font-semibold text-gray-800">{table.name}</h4>
                            <Badge variant="outline" size="sm">{table.fields.length} 필드</Badge>
                          </div>
                          <div className="space-y-2">
                            {table.fields.map((field) => (
                              <div key={field.id} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{field.type}</Badge>
                                <span className="font-medium">{field.name}</span>
                                {field.required && (
                                  <Badge variant="error" size="sm">필수</Badge>
                                )}
                                {field.unique && (
                                  <Badge variant="outline" size="sm">고유</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

