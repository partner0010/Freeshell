'use client';

import React, { useState } from 'react';
import { Mail, Plus, Send, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { emailBuilder, type EmailTemplate, type EmailCampaign } from '@/lib/email/email-builder';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function EmailBuilderPanel() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('templates');
  const { showToast } = useToast();

  React.useEffect(() => {
    setTemplates(emailBuilder.getAllTemplates());
    setCampaigns(emailBuilder.getAllCampaigns());
  }, []);

  const handleCreateTemplate = () => {
    const template = emailBuilder.createTemplate('New Template', 'Email Subject');
    setTemplates([...templates, template]);
    setSelectedTemplate(template);
    showToast({ type: 'success', message: '템플릿이 생성되었습니다' });
  };

  const handleAddBlock = (type: 'text' | 'image' | 'button' | 'divider' | 'spacer') => {
    if (!selectedTemplate) return;

    emailBuilder.addBlock(selectedTemplate.id, {
      type,
      content: type === 'button' ? '#' : type === 'spacer' ? '20' : 'Content here',
    });

    setTemplates(emailBuilder.getAllTemplates());
    setSelectedTemplate(emailBuilder.getTemplate(selectedTemplate.id) || null);
    showToast({ type: 'success', message: '블록이 추가되었습니다' });
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;

    const html = emailBuilder.generateHTML(selectedTemplate);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
    }
  };

  const tabs = [
    { id: 'templates', label: '템플릿' },
    { id: 'campaigns', label: '캠페인' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">이메일 빌더</h2>
            <p className="text-sm text-gray-500">뉴스레터 및 이메일 캠페인 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'templates' ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>이메일 템플릿</CardTitle>
                  <Button variant="primary" onClick={handleCreateTemplate}>
                    <Plus size={18} className="mr-2" />
                    템플릿 생성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    템플릿이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-primary-50 border-primary-300'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h4 className="font-semibold text-gray-800">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreview}>
                        <Eye size={14} className="mr-1" />
                        미리보기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      value={selectedTemplate.subject}
                      placeholder="이메일 제목"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleAddBlock('text')}>
                        텍스트
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddBlock('image')}>
                        이미지
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddBlock('button')}>
                        버튼
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddBlock('divider')}>
                        구분선
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddBlock('spacer')}>
                        간격
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedTemplate.blocks.map((block) => (
                        <div key={block.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.type}</Badge>
                            <span className="text-sm text-gray-600">{block.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>이메일 캠페인</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  캠페인이 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{campaign.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            수신자: {campaign.recipients.length}명
                          </p>
                        </div>
                        <Badge variant="outline">{campaign.status}</Badge>
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span>발송: {campaign.sentCount}</span>
                        <span>열람: {campaign.openCount}</span>
                        <span>클릭: {campaign.clickCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

