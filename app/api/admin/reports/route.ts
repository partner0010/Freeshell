/**
 * 리포트 관리 API
 * 리포트 저장, 조회, 다운로드
 */
import { NextRequest, NextResponse } from 'next/server';

// 실제로는 데이터베이스 사용
let reports: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const format = searchParams.get('format'); // 'json' | 'csv' | 'pdf'

    if (reportId) {
      const report = reports.find(r => r.timestamp === reportId);
      if (!report) {
        return NextResponse.json(
          { error: '리포트를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (format === 'csv') {
        return generateCSV(report);
      } else if (format === 'pdf') {
        return generatePDF(report);
      }

      return NextResponse.json({ success: true, report });
    }

    // 리포트 목록
    const sortedReports = reports
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(r => ({
        timestamp: r.timestamp,
        overall: r.overall,
        summary: {
          servicesCount: Object.keys(r.services).length,
          vulnerabilitiesCount: r.security.vulnerabilities.critical + r.security.vulnerabilities.high,
        },
      }));

    return NextResponse.json({
      success: true,
      reports: sortedReports,
      total: reports.length,
    });
  } catch (error: any) {
    console.error('[Reports API] GET 오류:', error);
    return NextResponse.json(
      { error: '리포트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report } = body;

    if (!report) {
      return NextResponse.json(
        { error: '리포트 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 리포트 저장
    reports.unshift(report);
    if (reports.length > 1000) {
      reports = reports.slice(0, 1000); // 최대 1000개
    }

    return NextResponse.json({
      success: true,
      message: '리포트가 저장되었습니다.',
      reportId: report.timestamp,
    });
  } catch (error: any) {
    console.error('[Reports API] POST 오류:', error);
    return NextResponse.json(
      { error: '리포트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateCSV(report: any): NextResponse {
  const lines: string[] = [];
  
  // 헤더
  lines.push('항목,상태,점수,메시지');
  
  // 전체 상태
  lines.push(`전체 상태,${report.overall.status},${report.overall.score},"${report.overall.message}"`);
  
  // 서비스 상태
  lines.push('');
  lines.push('서비스,상태,응답시간,메시지');
  Object.entries(report.services).forEach(([key, service]: [string, any]) => {
    lines.push(`"${service.name}",${service.status},${service.responseTime || 'N/A'},"${service.message}"`);
  });
  
  // 보안 취약점
  lines.push('');
  lines.push('취약점 유형,심각도,개수');
  lines.push(`Critical,${report.security.vulnerabilities.critical},${report.security.vulnerabilities.critical}`);
  lines.push(`High,${report.security.vulnerabilities.high},${report.security.vulnerabilities.high}`);
  lines.push(`Medium,${report.security.vulnerabilities.medium},${report.security.vulnerabilities.medium}`);
  lines.push(`Low,${report.security.vulnerabilities.low},${report.security.vulnerabilities.low}`);

  const csv = lines.join('\n');
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="health-check-${report.timestamp}.csv"`,
    },
  });
}

function generatePDF(report: any): NextResponse {
  // PDF 생성은 서버 사이드 라이브러리 필요 (예: pdfkit, puppeteer)
  // 현재는 JSON 반환
  return NextResponse.json({
    error: 'PDF 생성 기능은 준비 중입니다.',
    report,
  });
}
