'use client';

import React, { useState } from 'react';
import { Tags, Plus, Folder, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { customFieldsManager, type CustomField, type FieldType, type MetadataTag, type MetadataCategory } from '@/lib/metadata/custom-fields';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function CustomFieldsPanel() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [tags, setTags] = useState<MetadataTag[]>([]);
  const [categories, setCategories] = useState<MetadataCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'fields' | 'tags' | 'categories'>('fields');
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [tagName, setTagName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setFields(customFieldsManager.getAllFields());
    setTags(customFieldsManager.getAllTags());
    setCategories(customFieldsManager.getAllCategories());
  }, []);

  const fieldTypeOptions = [
    { value: 'text', label: '텍스트' },
    { value: 'number', label: '숫자' },
    { value: 'date', label: '날짜' },
    { value: 'boolean', label: '불린' },
    { value: 'select', label: '선택' },
    { value: 'multi-select', label: '다중 선택' },
    { value: 'url', label: 'URL' },
    { value: 'email', label: '이메일' },
  ];

  const handleCreateField = () => {
    if (!fieldName.trim() || !fieldLabel.trim()) {
      showToast({ type: 'warning', message: '필드 이름과 레이블을 입력해주세요' });
      return;
    }

    customFieldsManager.createField(fieldName, fieldLabel, fieldType);
    setFields(customFieldsManager.getAllFields());
    setFieldName('');
    setFieldLabel('');
    showToast({ type: 'success', message: '필드가 생성되었습니다' });
  };

  const handleCreateTag = () => {
    if (!tagName.trim()) {
      showToast({ type: 'warning', message: '태그 이름을 입력해주세요' });
      return;
    }

    customFieldsManager.createTag(tagName);
    setTags(customFieldsManager.getAllTags());
    setTagName('');
    showToast({ type: 'success', message: '태그가 생성되었습니다' });
  };

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      showToast({ type: 'warning', message: '카테고리 이름을 입력해주세요' });
      return;
    }

    customFieldsManager.createCategory(categoryName);
    setCategories(customFieldsManager.getAllCategories());
    setCategoryName('');
    showToast({ type: 'success', message: '카테고리가 생성되었습니다' });
  };

  const tabs = [
    { id: 'fields', label: '커스텀 필드' },
    { id: 'tags', label: '태그' },
    { id: 'categories', label: '카테고리' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <Tags className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">커스텀 필드 및 메타데이터</h2>
            <p className="text-sm text-gray-500">태그, 카테고리, 커스텀 필드 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'fields' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>커스텀 필드 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="필드 이름 (예: custom_field)"
                  />
                  <Input
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="필드 레이블 (예: 커스텀 필드)"
                  />
                  <Dropdown
                    options={fieldTypeOptions}
                    value={fieldType}
                    onChange={(val) => setFieldType(val as FieldType)}
                    placeholder="필드 유형"
                  />
                  <Button variant="primary" onClick={handleCreateField} className="w-full">
                    <Plus size={18} className="mr-2" />
                    필드 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>커스텀 필드 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    필드가 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div key={field.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{field.type}</Badge>
                          <span className="font-medium">{field.label}</span>
                          <span className="text-xs text-gray-400">({field.name})</span>
                          {field.required && (
                            <Badge variant="error" size="sm">필수</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : activeTab === 'tags' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>태그 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="태그 이름"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleCreateTag}>
                    <Plus size={18} className="mr-2" />
                    생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>태그 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {tags.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    태그가 없습니다
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                      >
                        <Hash size={12} className="mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>카테고리 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="카테고리 이름"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleCreateCategory}>
                    <Plus size={18} className="mr-2" />
                    생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    카테고리가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Folder size={20} className="text-gray-600" />
                          <h4 className="font-semibold text-gray-800">{category.name}</h4>
                          <Badge variant="outline">{category.tags.length}개 태그</Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        )}
                        {category.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {category.tags.map((tag) => (
                              <Badge key={tag.id} variant="outline" size="sm">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

