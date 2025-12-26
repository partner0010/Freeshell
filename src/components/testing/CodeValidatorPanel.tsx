'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { codeValidator, type ValidationResult } from '@/lib/testing/code-validator';
import { useToast } from '@/components/ui/Toast';

export function CodeValidatorPanel() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [codeToValidate, setCodeToValidate] = useState('');
  const { showToast } = useToast();

  const handleValidateCode = async () => {
    if (!codeToValidate.trim()) {
      showToast({ type: 'warning', message: '검증할 코드를 입력해주세요' });
      return;
    }

    setIsValidating(true);
    try {
      const result = await codeValidator.validateReactComponent(codeToValidate, 'test.tsx');
      setResults([result]);
      showToast({
        type: result.passed ? 'success' : 'error',
        message: result.passed ? '검증 통과' : `${result.errors.length}개의 오류 발견`
      });
    } catch (error) {
      showToast({ type: 'error', message: '검증 중 오류가 발생했습니다' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidateProject = async () => {
    setIsValidating(true);
    try {
      // 시뮬레이션: 프로젝트 전체 검증
      const mockFiles = ['components/editor/Sidebar.tsx', 'components/ui/Button.tsx'];
      const validationResults = await codeValidator.validateProject(mockFiles);
      setResults(validationResults);
      const totalErrors = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
      showToast({
        type: totalErrors === 0 ? 'success' : 'warning',
        message: `${validationResults.length}개 파일 검증 완료 - ${totalErrors}개 오류 발견`
      });
    } catch (error) {
      showToast({ type: 'error', message: '프로젝트 검증 중 오류가 발생했습니다' });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">코드 검증 및 테스트</h2>
            <p className="text-sm text-gray-500">TypeScript, React 컴포넌트 검증</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>코드 검증</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <textarea
                value={codeToValidate}
                onChange={(e) => setCodeToValidate(e.target.value)}
                placeholder="검증할 코드를 입력하세요..."
                className="w-full p-3 border rounded-lg min-h-[200px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleValidateCode} disabled={isValidating}>
                  <Play size={18} className="mr-2" />
                  {isValidating ? '검증 중...' : '코드 검증'}
                </Button>
                <Button variant="outline" onClick={handleValidateProject} disabled={isValidating}>
                  <FileCode size={18} className="mr-2" />
                  프로젝트 전체 검증
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>검증 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCode size={18} className="text-gray-600" />
                        <span className="font-semibold">{result.file}</span>
                      </div>
                      {result.passed ? (
                        <Badge variant="success">
                          <CheckCircle size={14} className="mr-1" />
                          통과
                        </Badge>
                      ) : (
                        <Badge variant="error">
                          <XCircle size={14} className="mr-1" />
                          실패
                        </Badge>
                      )}
                    </div>

                    {result.errors.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-red-700 mb-2">
                          오류 ({result.errors.length}개)
                        </h4>
                        <div className="space-y-2">
                          {result.errors.map((error, errIndex) => (
                            <div key={errIndex} className="bg-red-50 border border-red-200 rounded p-2">
                              <div className="flex items-center gap-2 text-sm">
                                <XCircle size={14} className="text-red-500" />
                                <span className="font-medium">라인 {error.line}:{error.column}</span>
                                {error.rule && (
                                  <Badge variant="outline" size="sm">{error.rule}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-red-700 mt-1">{error.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-yellow-700 mb-2">
                          경고 ({result.warnings.length}개)
                        </h4>
                        <div className="space-y-2">
                          {result.warnings.map((warning, warnIndex) => (
                            <div key={warnIndex} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                              <div className="flex items-center gap-2 text-sm">
                                <AlertTriangle size={14} className="text-yellow-500" />
                                <span className="font-medium">라인 {warning.line}:{warning.column}</span>
                              </div>
                              <p className="text-sm text-yellow-700 mt-1">{warning.message}</p>
                              {warning.suggestion && (
                                <p className="text-xs text-yellow-600 mt-1 italic">
                                  제안: {warning.suggestion}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.errors.length === 0 && result.warnings.length === 0 && (
                      <div className="text-center py-4 text-green-600">
                        <CheckCircle size={32} className="mx-auto mb-2" />
                        <p>검증 통과 - 오류 없음</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

