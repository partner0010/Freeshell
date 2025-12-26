'use client';

import React, { useState } from 'react';
import { Webhook, Plus, Play, Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { webhookBuilder, type Webhook as WebhookType, type WebhookEvent, type HttpMethod } from '@/lib/webhooks/webhook-builder';
import { useToast } from '@/components/ui/Toast';

export function WebhookBuilderPanel() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null);
  const [webhookName, setWebhookName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setWebhooks(webhookBuilder.getAllWebhooks());
  }, []);

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const methodOptions = methods.map(m => ({ value: m, label: m }));

  const eventTypes = [
    { value: 'form.submit', label: '폼 제출' },
    { value: 'user.signup', label: '사용자 가입' },
    { value: 'payment.complete', label: '결제 완료' },
    { value: 'content.publish', label: '콘텐츠 게시' },
    { value: 'custom', label: '커스텀' },
  ];

  const handleCreateWebhook = () => {
    if (!webhookName.trim()) {
      showToast({ type: 'warning', message: '웹훅 이름을 입력해주세요' });
      return;
    }

    const webhook = webhookBuilder.createWebhook(webhookName);
    setWebhooks([...webhooks, webhook]);
    setSelectedWebhook(webhook);
    setWebhookName('');
    showToast({ type: 'success', message: '웹훅이 생성되었습니다' });
  };

  const handleAddEvent = () => {
    if (!selectedWebhook) return;

    webhookBuilder.addEvent(selectedWebhook.id, {
      name: 'New Event',
      event: 'custom',
      url: 'https://example.com/webhook',
      method: 'POST',
      active: true,
    });

    setWebhooks(webhookBuilder.getAllWebhooks());
    setSelectedWebhook(webhookBuilder.getWebhook(selectedWebhook.id) || null);
    showToast({ type: 'success', message: '이벤트가 추가되었습니다' });
  };

  const handleToggleEvent = (eventId: string) => {
    if (!selectedWebhook) return;

    const event = selectedWebhook.events.find(e => e.id === eventId);
    if (!event) return;

    event.active = !event.active;
    setWebhooks(webhookBuilder.getAllWebhooks());
    setSelectedWebhook(webhookBuilder.getWebhook(selectedWebhook.id) || null);
    showToast({ type: 'success', message: `이벤트가 ${event.active ? '활성화' : '비활성화'}되었습니다` });
  };

  const handleTestEvent = async (event: WebhookEvent) => {
    try {
      const result = await webhookBuilder.triggerEvent(event, { test: true });
      showToast({ type: 'success', message: `테스트 성공: ${result.message}` });
    } catch (error) {
      showToast({ type: 'error', message: '테스트 중 오류가 발생했습니다' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Webhook className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">웹훅 빌더</h2>
            <p className="text-sm text-gray-500">이벤트 기반 자동화 및 통합</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 웹훅 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 웹훅 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                placeholder="웹훅 이름"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreateWebhook}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 웹훅 목록 */}
        {webhooks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>웹훅 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWebhook?.id === webhook.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedWebhook(webhook)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{webhook.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          이벤트: {webhook.events.length}개
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 웹훅 상세 */}
        {selectedWebhook && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedWebhook.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEvent}
                >
                  <Plus size={14} className="mr-1" />
                  이벤트 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWebhook.events.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    이벤트가 없습니다. 이벤트 추가 버튼을 클릭하세요.
                  </div>
                ) : (
                  selectedWebhook.events.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">{event.name}</h4>
                            <Badge variant="outline">{event.method}</Badge>
                            {event.active ? (
                              <Badge variant="success" size="sm">활성</Badge>
                            ) : (
                              <Badge variant="outline" size="sm">비활성</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">이벤트: {event.event}</p>
                          <p className="text-sm text-gray-500">URL: {event.url}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleEvent(event.id)}
                          >
                            <Power size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestEvent(event)}
                          >
                            <Play size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

