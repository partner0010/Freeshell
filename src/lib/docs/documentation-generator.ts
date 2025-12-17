/**
 * 문서화 자동 생성기
 * Documentation Generator
 */

export interface APIDocumentation {
  title: string;
  description: string;
  version: string;
  endpoints: APIEndpoint[];
}

export interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: APIParameter[];
  requestBody?: any;
  responses?: APIResponse[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: any;
}

// 문서화 생성기
export class DocumentationGenerator {
  // API 문서 생성
  generateAPIDocs(docs: APIDocumentation): string {
    let markdown = `# ${docs.title}\n\n`;
    markdown += `${docs.description}\n\n`;
    markdown += `**Version:** ${docs.version}\n\n`;
    markdown += `---\n\n`;

    docs.endpoints.forEach(endpoint => {
      markdown += `## ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `${endpoint.description}\n\n`;

      if (endpoint.parameters && endpoint.parameters.length > 0) {
        markdown += `### Parameters\n\n`;
        markdown += `| Name | Type | Required | Description |\n`;
        markdown += `|------|------|----------|-------------|\n`;
        endpoint.parameters.forEach(param => {
          markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
        });
        markdown += `\n`;
      }

      if (endpoint.requestBody) {
        markdown += `### Request Body\n\n`;
        markdown += `\`\`\`json\n`;
        markdown += `${JSON.stringify(endpoint.requestBody, null, 2)}\n`;
        markdown += `\`\`\`\n\n`;
      }

      if (endpoint.responses && endpoint.responses.length > 0) {
        markdown += `### Responses\n\n`;
        endpoint.responses.forEach(response => {
          markdown += `**${response.status}** - ${response.description}\n\n`;
          if (response.schema) {
            markdown += `\`\`\`json\n`;
            markdown += `${JSON.stringify(response.schema, null, 2)}\n`;
            markdown += `\`\`\`\n\n`;
          }
        });
      }

      markdown += `---\n\n`;
    });

    return markdown;
  }

  // OpenAPI (Swagger) 형식으로 생성
  generateOpenAPI(docs: APIDocumentation): string {
    const openAPI: {
      openapi: string;
      info: {
        title: string;
        description: string;
        version: string;
      };
      paths: Record<string, Record<string, any>>;
    } = {
      openapi: '3.0.0',
      info: {
        title: docs.title,
        description: docs.description,
        version: docs.version,
      },
      paths: {},
    };

    docs.endpoints.forEach(endpoint => {
      const path = endpoint.path;
      const method = endpoint.method.toLowerCase();

      if (!openAPI.paths[path]) {
        openAPI.paths[path] = {};
      }

      openAPI.paths[path][method] = {
        summary: endpoint.description,
        parameters: endpoint.parameters?.map(param => ({
          name: param.name,
          in: 'query',
          required: param.required,
          schema: { type: param.type },
          description: param.description,
        })),
        requestBody: endpoint.requestBody ? {
          content: {
            'application/json': {
              schema: endpoint.requestBody,
            },
          },
        } : undefined,
        responses: endpoint.responses?.reduce((acc, res) => {
          acc[res.status.toString()] = {
            description: res.description,
            content: res.schema ? {
              'application/json': {
                schema: res.schema,
              },
            } : undefined,
          };
          return acc;
        }, {} as any) || {},
      };
    });

    return JSON.stringify(openAPI, null, 2);
  }

  // HTML 문서 생성
  generateHTML(docs: APIDocumentation): string {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${docs.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${docs.title}</h1>
  <p>${docs.description}</p>
  <p><strong>Version:</strong> ${docs.version}</p>
  <hr>
  ${docs.endpoints.map(endpoint => `
    <h2>${endpoint.method} ${endpoint.path}</h2>
    <p>${endpoint.description}</p>
    ${endpoint.parameters ? `
      <h3>Parameters</h3>
      <table>
        <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
        ${endpoint.parameters.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.type}</td>
            <td>${p.required ? 'Yes' : 'No'}</td>
            <td>${p.description}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
  `).join('')}
</body>
</html>`;

    return html;
  }
}

export const documentationGenerator = new DocumentationGenerator();

