'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Square,
  Image as ImageIcon,
  Save,
  Printer,
  Download,
  X,
  Maximize2,
  Minimize2,
  Move,
  Eraser,
  Upload,
  CheckCircle,
  FileText,
  Map,
} from 'lucide-react';

interface SignatureData {
  id: string;
  type: 'signature' | 'stamp' | 'drawing';
  x: number;
  y: number;
  width: number;
  height: number;
  data: string; // base64 or path data
  timestamp: number;
}

interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElectronicSignatureProps {
  document?: {
    type: 'document' | 'map';
    content?: string | File;
    url?: string;
  };
  onSave?: (data: { signatures: SignatureData[]; printArea?: PrintArea; image?: string }) => void;
  onComplete?: (data: { signatures: SignatureData[]; printArea?: PrintArea; image?: string }) => void;
}

export function ElectronicSignature({ document: initialDocument, onSave, onComplete }: ElectronicSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle'>('pen');
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [printArea, setPrintArea] = useState<PrintArea | null>(null);
  const [isDraggingPrintArea, setIsDraggingPrintArea] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadedStamp, setUploadedStamp] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentLineWidth, setCurrentLineWidth] = useState(2);
  const [showToolbar, setShowToolbar] = useState(true);
  const [loadedDocument, setLoadedDocument] = useState<{
    type: 'document' | 'map';
    content: string | File;
    url?: string;
  } | null>(initialDocument && initialDocument.content ? {
    type: initialDocument.type,
    content: initialDocument.content,
    url: initialDocument.url,
  } : null);

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // 배경 그리기
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 문서 로드
      if (loadedDocument?.type === 'document' && loadedDocument.content) {
        loadDocument(ctx);
      } else if (loadedDocument?.type === 'map') {
        loadMap(ctx);
      }

      // 기존 서명 및 그림 다시 그리기
      redrawAll(ctx);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [loadedDocument, signatures, printArea]);

  // 문서 로드
  const loadDocument = async (ctx: CanvasRenderingContext2D) => {
    if (!loadedDocument?.content) return;

    try {
      let imageUrl = '';
      if (typeof loadedDocument.content === 'string') {
        imageUrl = loadedDocument.content;
      } else if (loadedDocument.content instanceof File) {
        imageUrl = URL.createObjectURL(loadedDocument.content);
      } else if (loadedDocument.url) {
        imageUrl = loadedDocument.url;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = ctx.canvas;
        // 배경 다시 그리기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // 기존 서명 다시 그리기
        redrawAll(ctx);
      };
      img.onerror = () => {
        console.error('Failed to load image');
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  // 지도 로드
  const loadMap = async (ctx: CanvasRenderingContext2D) => {
    // 실제로는 Google Maps, Kakao Map 등 지도 API 사용
    // 여기서는 캔버스에 지도 배경 그리기
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 격자 패턴 (지도 느낌)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
    
    // 중앙에 안내 텍스트
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('지도 영역', ctx.canvas.width / 2, ctx.canvas.height / 2 - 10);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('지도 위에 그림을 그려 설명하세요', ctx.canvas.width / 2, ctx.canvas.height / 2 + 15);
    
    // 실제 지도 API 통합 예시 (주석)
    // const map = new google.maps.Map(canvas, {
    //   center: { lat: 37.5665, lng: 126.9780 },
    //   zoom: 13
    // });
    // const drawingManager = new google.maps.drawing.DrawingManager({
    //   drawingMode: google.maps.drawing.OverlayType.MARKER,
    //   drawingControl: true,
    // });
    // drawingManager.setMap(map);
  };

  // 모든 요소 다시 그리기
  const redrawAll = (ctx: CanvasRenderingContext2D) => {
    signatures.forEach((sig) => {
      if (sig.type === 'signature' || sig.type === 'drawing') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, sig.x, sig.y, sig.width, sig.height);
        };
        img.src = sig.data;
      } else if (sig.type === 'stamp') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, sig.x, sig.y, sig.width, sig.height);
        };
        img.src = sig.data;
      }
    });

    // 출력 영역 표시
    if (printArea) {
      drawPrintArea(ctx, printArea);
    }
  };

  // 출력 영역 그리기
  const drawPrintArea = (ctx: CanvasRenderingContext2D, area: PrintArea) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.setLineDash([]);

    // 핸들 그리기
    const handles = [
      { x: area.x, y: area.y },
      { x: area.x + area.width, y: area.y },
      { x: area.x + area.width, y: area.y + area.height },
      { x: area.x, y: area.y + area.height },
    ];

    handles.forEach((handle) => {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(handle.x - 5, handle.y - 5, 10, 10);
    });
  };

  // 마우스/터치 이벤트 처리
  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // 그림 그리기 시작
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      // 출력 영역 드래그 확인
      if (printArea && isPointInPrintArea(point, printArea)) {
        setIsDraggingPrintArea(true);
        return;
      }

      if (currentTool === 'rectangle') {
        // 출력 영역 그리기
        setPrintArea({ x: point.x, y: point.y, width: 0, height: 0 });
        return;
      }

      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentTool === 'eraser' ? currentLineWidth * 3 : currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    },
    [currentTool, currentColor, currentLineWidth, printArea]
  );

  // 그림 그리기 중
  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;

      if (isDraggingPrintArea && printArea) {
        const dx = point.x - printArea.x;
        const dy = point.y - printArea.y;
        setPrintArea({
          ...printArea,
          width: Math.max(0, dx),
          height: Math.max(0, dy),
        });
        return;
      }

      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    },
    [isDrawing, isDraggingPrintArea, printArea]
  );

  // 그림 그리기 종료
  const handleEnd = useCallback(() => {
    if (isDraggingPrintArea) {
      setIsDraggingPrintArea(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 현재 그림을 서명으로 저장
    const dataUrl = canvas.toDataURL('image/png');
    const newSignature: SignatureData = {
      id: `sig-${Date.now()}`,
      type: currentTool === 'eraser' ? 'drawing' : 'signature',
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      data: dataUrl,
      timestamp: Date.now(),
    };

    setSignatures((prev) => [...prev, newSignature]);
  }, [isDrawing, isDraggingPrintArea, currentTool]);

  // 출력 영역 내부 확인
  const isPointInPrintArea = (point: { x: number; y: number }, area: PrintArea): boolean => {
    return (
      point.x >= area.x &&
      point.x <= area.x + area.width &&
      point.y >= area.y &&
      point.y <= area.y + area.height
    );
  };

  // 서명 영역 추가
  const addSignatureZone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureCanvas = signatureCanvasRef.current;
    if (!signatureCanvas) return;

    const sigCtx = signatureCanvas.getContext('2d');
    if (!sigCtx) return;

    // 서명 캔버스 초기화
    signatureCanvas.width = 400;
    signatureCanvas.height = 200;
    sigCtx.fillStyle = '#ffffff';
    sigCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);

    setCurrentTool('pen');
    // 서명 모드 활성화
  };

  // 도장 업로드
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedStamp(result);

      // 도장을 서명으로 추가
      const newStamp: SignatureData = {
        id: `stamp-${Date.now()}`,
        type: 'stamp',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        data: result,
        timestamp: Date.now(),
      };
      setSignatures((prev) => [...prev, newStamp]);
      redrawAll(canvasRef.current?.getContext('2d')!);
    };
    reader.readAsDataURL(file);
  };

  // 저장
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalData = canvas.toDataURL('image/png');
    if (onSave) {
      onSave({ 
        signatures, 
        printArea: printArea || undefined,
        image: finalData,
      });
    }
  };

  // 완료
  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalData = canvas.toDataURL('image/png');
    if (onComplete) {
      onComplete({ 
        signatures, 
        printArea: printArea || undefined,
        image: finalData,
      });
    }
  };

  // 인쇄
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const img = canvas.toDataURL('image/png');
    printWindow.document.write(`
      <html>
        <head>
          <title>인쇄</title>
          <style>
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${img}" alt="서명 문서" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  // 다운로드
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 전체화면 토글
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-white ${isFullscreen ? 'fixed inset-0 z-[200]' : 'rounded-xl border'}`}
    >
      {/* 툴바 */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* 도구 */}
              <div className="flex items-center gap-1 border-r pr-2">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentTool === 'pen' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
                  }`}
                  title="펜"
                >
                  <PenTool size={18} />
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentTool === 'eraser' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
                  }`}
                  title="지우개"
                >
                  <Eraser size={18} />
                </button>
                <button
                  onClick={() => setCurrentTool('rectangle')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentTool === 'rectangle' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
                  }`}
                  title="출력 영역 지정"
                >
                  <Square size={18} />
                </button>
              </div>

              {/* 색상 선택 */}
              <div className="flex items-center gap-2 border-r pr-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="색상"
                />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentLineWidth}
                  onChange={(e) => setCurrentLineWidth(Number(e.target.value))}
                  className="w-20"
                  title="선 두께"
                />
              </div>

              {/* 도장 업로드 */}
              <div className="border-r pr-2">
                <label className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer inline-block">
                  <Upload size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 액션 */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="저장"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="인쇄"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="다운로드"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="전체화면"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                {onComplete && (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    완료
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* 서명 캔버스 (숨김) */}
      <canvas ref={signatureCanvasRef} className="hidden" />
    </div>
  );
}

