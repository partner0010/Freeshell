'use client';

import React, { useState } from 'react';
import { Globe, Download, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { webScraper, type ScrapingResult } from '@/lib/web-scraping/scraper';
import { useToast } from '@/components/ui/Toast';

export function WebScrapingPanel() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const { showToast } = useToast();

  const handleScrape = async () => {
    if (!url.trim()) {
      showToast({ type: 'warning', message: 'URL을 입력해주세요' });
      return;
    }

    setIsScraping(true);
    try {
      const data = await webScraper.scrape({ url });
      setResult(data);
      if (data.error) {
        showToast({ type: 'error', message: data.error });
      } else {
        showToast({ type: 'success', message: '스크래핑이 완료되었습니다' });
      }
    } catch (error) {
      showToast({ type: 'error', message: '스크래핑 중 오류가 발생했습니다' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleExtractSEO = async () => {
    if (!url.trim()) {
      showToast({ type: 'warning', message: 'URL을 입력해주세요' });
      return;
    }

    setIsScraping(true);
    try {
      const seo = await webScraper.extractSEO(url);
      setResult({
        url,
        title: seo.title,
        content: seo.description || '',
        metadata: {
          description: seo.description || '',
          keywords: seo.keywords || '',
          'og:image': seo.ogImage || '',
        },
      });
      showToast({ type: 'success', message: 'SEO 데이터를 추출했습니다' });
    } catch (error) {
      showToast({ type: 'error', message: 'SEO 추출 중 오류가 발생했습니다' });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Globe className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">웹 스크래핑</h2>
            <p className="text-sm text-gray-500">웹사이트에서 데이터 추출</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* URL 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>URL 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleScrape}
                disabled={isScraping}
              >
                <Search size={18} />
                스크래핑
              </Button>
              <Button
                variant="outline"
                onClick={handleExtractSEO}
                disabled={isScraping}
              >
                SEO 추출
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 결과 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>결과</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                  <XCircle size={20} />
                  <span>{result.error}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* URL */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">URL</div>
                    <div className="text-sm text-gray-600 break-all">{result.url}</div>
                  </div>

                  {/* 제목 */}
                  {result.title && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">제목</div>
                      <div className="text-sm text-gray-800">{result.title}</div>
                    </div>
                  )}

                  {/* 콘텐츠 */}
                  {result.content && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">콘텐츠</div>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-auto">
                        {result.content}
                      </div>
                    </div>
                  )}

                  {/* 이미지 */}
                  {result.images && result.images.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        이미지 ({result.images.length})
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {result.images.slice(0, 6).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Image ${i + 1}`}
                            className="w-full h-24 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 메타데이터 */}
                  {result.metadata && Object.keys(result.metadata).length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">메타데이터</div>
                      <div className="space-y-1">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-semibold text-gray-600">{key}:</span>{' '}
                            <span className="text-gray-500">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 다운로드 */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(result, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `scraping-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast({ type: 'success', message: '다운로드되었습니다' });
                      }}
                    >
                      <Download size={18} />
                      JSON 다운로드
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

