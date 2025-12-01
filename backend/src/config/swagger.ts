/**
 * Swagger/OpenAPI 설정
 */

import swaggerJsdoc from 'swagger-jsdoc'
import { SwaggerDefinition } from 'swagger-jsdoc'

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '올인원 콘텐츠 AI API',
    version: '1.0.0',
    description: `
      올인원 콘텐츠 AI 백엔드 API 문서
      
      ## 인증
      대부분의 API는 JWT 토큰 인증이 필요합니다.
      \`Authorization: Bearer <token>\` 헤더를 포함하여 요청하세요.
      
      ## 에러 응답
      모든 에러는 다음 형식으로 반환됩니다:
      \`\`\`json
      {
        "success": false,
        "error": "에러 메시지"
      }
      \`\`\`
      
      ## 성공 응답
      성공 응답은 다음 형식으로 반환됩니다:
      \`\`\`json
      {
        "success": true,
        "data": { ... }
      }
      \`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3001',
      description: '개발 서버'
    },
    {
      url: 'https://api.example.com',
      description: '프로덕션 서버'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰 인증'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API 키 인증 (선택적)'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: '에러 메시지'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'uuid'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          username: {
            type: 'string',
            example: 'username'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Content: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'uuid'
          },
          topic: {
            type: 'string',
            example: '오늘의 이슈'
          },
          contentType: {
            type: 'string',
            example: 'today-issue'
          },
          contentTime: {
            type: 'number',
            example: 60
          },
          contentFormat: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          text: {
            type: 'string',
            example: '콘텐츠 내용...'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },
  tags: [
    {
      name: '인증',
      description: '사용자 인증 및 회원가입'
    },
    {
      name: '콘텐츠',
      description: '콘텐츠 생성 및 관리'
    },
    {
      name: '플랫폼',
      description: '플랫폼 연동 및 관리'
    },
    {
      name: '업로드',
      description: '콘텐츠 업로드'
    },
    {
      name: '자동화',
      description: '자동화 작업 실행'
    },
    {
      name: '스케줄',
      description: '스케줄 관리'
    },
    {
      name: '템플릿',
      description: '템플릿 관리'
    },
    {
      name: '분석',
      description: '콘텐츠 분석 및 통계'
    },
    {
      name: '채널',
      description: '채널 분석 및 설정'
    },
    {
      name: '사용자',
      description: '사용자 정보 관리'
    },
    {
      name: '건강',
      description: '서버 상태 확인'
    }
  ]
}

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts'
  ]
}

export const swaggerSpec = swaggerJsdoc(options)

