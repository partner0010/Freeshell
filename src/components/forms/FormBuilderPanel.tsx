'use client';

import React, { useState } from 'react';
import { FileText, Plus, Save, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { formBuilder, type Form, type FormField, type FieldType } from '@/lib/forms/form-builder';
import { useToast } from '@/components/ui/Toast';
import { createSafeHTML } from '@/lib/security/sanitize-html';

export function FormBuilderPanel() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formName, setFormName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    setForms(formBuilder.getAllForms());
  }, []);

  const fieldTypes: FieldType[] = ['text', 'email', 'number', 'date', 'select', 'checkbox', 'radio', 'textarea', 'file'];
  const fieldTypeOptions = fieldTypes.map(t => ({ value: t, label: t }));

  const handleCreateForm = () => {
    if (!formName.trim()) {
      showToast({ type: 'warning', message: '폼 이름을 입력해주세요' });
      return;
    }

    const form = formBuilder.createForm(formName);
    setForms([...forms, form]);
    setSelectedForm(form);
    setFormName('');
    showToast({ type: 'success', message: '폼이 생성되었습니다' });
  };

  const handleAddField = () => {
    if (!selectedForm) return;

    formBuilder.addField(selectedForm.id, {
      type: 'text',
      label: '새 필드',
      name: `field_${Date.now()}`,
      required: false,
    });

    setForms(formBuilder.getAllForms());
    setSelectedForm(formBuilder.getForm(selectedForm.id) || null);
    showToast({ type: 'success', message: '필드가 추가되었습니다' });
  };

  const handleCopyHTML = () => {
    if (!selectedForm) return;

    const html = formBuilder.generateHTML(selectedForm);
    navigator.clipboard.writeText(html);
    showToast({ type: 'success', message: 'HTML 코드가 복사되었습니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">폼 빌더</h2>
            <p className="text-sm text-gray-500">드래그 앤 드롭으로 폼 생성</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 폼 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 폼 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="폼 이름"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreateForm}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 폼 목록 */}
        {forms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>폼 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedForm?.id === form.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{form.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          필드: {form.fields.length}개
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 폼 편집 */}
        {selectedForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedForm.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye size={14} className="mr-1" />
                    미리보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyHTML}
                  >
                    <Code size={14} className="mr-1" />
                    HTML 복사
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddField}
                  >
                    <Plus size={14} className="mr-1" />
                    필드 추가
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {/* Note: HTML is generated by FormBuilder and sanitized */}
                  <div 
                    dangerouslySetInnerHTML={createSafeHTML(formBuilder.generateHTML(selectedForm))}
                    suppressHydrationWarning
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedForm.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      필드가 없습니다. 필드 추가 버튼을 클릭하세요.
                    </div>
                  ) : (
                    selectedForm.fields.map((field) => (
                      <div key={field.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{field.type}</Badge>
                            <span className="font-medium">{field.label}</span>
                            {field.required && (
                              <Badge variant="error" size="sm">필수</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

