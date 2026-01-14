/**
 * 템플릿 미리보기 렌더러
 * 블록 구조를 HTML로 변환
 */

import { Template, BlockData } from './template-schema';

/**
 * 블록을 HTML로 렌더링
 */
export function renderBlockToHTML(block: BlockData, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  const styleString = objectToStyleString(block.style);
  const styleAttr = styleString ? ` style="${styleString}"` : '';
  const idAttr = ` id="${block.id}"`;

  let html = '';

  switch (block.type) {
    case 'text':
      html = `${indent}<div${idAttr}${styleAttr}>${escapeHtml(getTextContent(block.content))}</div>`;
      break;

    case 'heading':
      const level = block.content?.level || 1;
      const headingText = getTextContent(block.content);
      html = `${indent}<h${level}${idAttr}${styleAttr}>${escapeHtml(headingText)}</h${level}>`;
      break;

    case 'image':
      const src = block.content?.src || block.content?.url || block.content || '';
      const alt = block.content?.alt || 'Image';
      html = `${indent}<img${idAttr} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${styleAttr} />`;
      break;

    case 'button':
      const buttonText = getTextContent(block.content);
      const href = block.content?.href || '#';
      const buttonStyle = block.style?.border || block.style?.borderRadius 
        ? styleAttr 
        : `${styleAttr} style="${styleString}; border: none; cursor: pointer;"`;
      html = `${indent}<a${idAttr} href="${escapeHtml(href)}"${buttonStyle}>${escapeHtml(buttonText)}</a>`;
      break;

    case 'container':
      html = `${indent}<div${idAttr}${styleAttr}>`;
      if (block.children && block.children.length > 0) {
        html += '\n';
        html += block.children.map(child => renderBlockToHTML(child, depth + 1)).join('\n');
        html += `\n${indent}`;
      }
      html += '</div>';
      break;

    case 'card':
      html = `${indent}<div${idAttr}${styleAttr}>`;
      if (block.content?.image) {
        html += `\n${indent}  <img src="${escapeHtml(block.content.image)}" alt="${escapeHtml(block.content.title || 'Card')}" style="width: 100%; height: auto;" />`;
      }
      if (block.content?.title) {
        html += `\n${indent}  <h3>${escapeHtml(block.content.title)}</h3>`;
      }
      if (block.content?.description || block.content?.excerpt) {
        html += `\n${indent}  <p>${escapeHtml(block.content.description || block.content.excerpt || '')}</p>`;
      }
      if (block.children && block.children.length > 0) {
        html += '\n';
        html += block.children.map(child => renderBlockToHTML(child, depth + 1)).join('\n');
      }
      html += `\n${indent}</div>`;
      break;

    case 'hero':
      html = `${indent}<section${idAttr}${styleAttr}>`;
      if (block.content?.backgroundImage) {
        html += `\n${indent}  <div style="position: absolute; inset: 0; background-image: url('${escapeHtml(block.content.backgroundImage)}'); background-size: cover; background-position: center; opacity: 0.3; z-index: -1;"></div>`;
      }
      if (block.children && block.children.length > 0) {
        html += '\n';
        html += block.children.map(child => renderBlockToHTML(child, depth + 1)).join('\n');
      }
      html += `\n${indent}</section>`;
      break;

    case 'navbar':
      html = `${indent}<nav${idAttr}${styleAttr}>`;
      if (block.content?.logo) {
        html += `\n${indent}  <div style="font-weight: bold; font-size: 1.25rem;">${escapeHtml(block.content.logo)}</div>`;
      }
      if (block.content?.links && Array.isArray(block.content.links)) {
        html += `\n${indent}  <div style="display: flex; gap: 1rem;">`;
        block.content.links.forEach((link: any) => {
          html += `\n${indent}    <a href="${escapeHtml(link.href || '#')}" style="text-decoration: none; color: inherit;">${escapeHtml(link.text)}</a>`;
        });
        html += `\n${indent}  </div>`;
      }
      html += `\n${indent}</nav>`;
      break;

    case 'footer':
      html = `${indent}<footer${idAttr}${styleAttr}>`;
      if (block.content?.copyright) {
        html += `\n${indent}  <p>${escapeHtml(block.content.copyright)}</p>`;
      }
      if (block.content?.links && Array.isArray(block.content.links)) {
        html += `\n${indent}  <div style="display: flex; gap: 1rem; justify-content: center;">`;
        block.content.links.forEach((link: any) => {
          html += `\n${indent}    <a href="${escapeHtml(link.href || '#')}" style="text-decoration: none; color: inherit;">${escapeHtml(link.text)}</a>`;
        });
        html += `\n${indent}  </div>`;
      }
      html += `\n${indent}</footer>`;
      break;

    case 'list':
      html = `${indent}<ul${idAttr}${styleAttr}>`;
      if (block.content?.items && Array.isArray(block.content.items)) {
        block.content.items.forEach((item: any) => {
          const itemText = typeof item === 'string' ? item : (item.title || item.text || '');
          html += `\n${indent}  <li>${escapeHtml(itemText)}</li>`;
        });
      }
      html += `\n${indent}</ul>`;
      break;

    case 'sidebar':
      html = `${indent}<aside${idAttr}${styleAttr}>`;
      if (block.children && block.children.length > 0) {
        html += '\n';
        html += block.children.map(child => renderBlockToHTML(child, depth + 1)).join('\n');
      }
      html += `\n${indent}</aside>`;
      break;

    default:
      html = `${indent}<div${idAttr}${styleAttr}>${escapeHtml(JSON.stringify(block.content))}</div>`;
  }

  return html;
}

/**
 * 템플릿을 완전한 HTML 문서로 렌더링
 */
export function renderTemplateToHTML(template: Template): string {
  const blocksHTML = template.blocks
    .map(block => renderBlockToHTML(block, 1))
    .join('\n');

  const globalStyles = template.styles?.global || {};
  const cssVariables = template.styles?.variables || {};

  let cssVariablesString = '';
  if (Object.keys(cssVariables).length > 0) {
    cssVariablesString = `\n    :root {\n`;
    Object.entries(cssVariables).forEach(([key, value]) => {
      cssVariablesString += `      ${key}: ${value};\n`;
    });
    cssVariablesString += `    }\n`;
  }

  const globalStyleString = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${globalStyles.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
      color: ${globalStyles.color || '#1a202c'};
      background-color: ${globalStyles.backgroundColor || '#ffffff'};
      line-height: 1.6;
    }
    ${cssVariablesString}
  `;

  const headScripts = template.scripts?.head || '';
  const bodyScripts = template.scripts?.body || '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.metadata.description || 'Template Preview'}</title>
    <style>${globalStyleString}</style>
    ${headScripts}
</head>
<body>
${blocksHTML}
${bodyScripts}
</body>
</html>`;
}

/**
 * 스타일 객체를 CSS 문자열로 변환
 */
function objectToStyleString(style: any): string {
  if (!style || typeof style !== 'object') return '';

  const stylePairs: string[] = [];

  Object.entries(style).forEach(([key, value]) => {
    // responsive는 제외
    if (key === 'responsive') return;

    if (value !== undefined && value !== null && value !== '') {
      const cssKey = camelToKebab(key);
      stylePairs.push(`${cssKey}: ${value}`);
    }
  });

  return stylePairs.join('; ');
}

/**
 * camelCase를 kebab-case로 변환
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text: any): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 블록 콘텐츠에서 텍스트 추출
 */
function getTextContent(content: any): string {
  if (typeof content === 'string') return content;
  if (content?.text) return content.text;
  if (content?.title) return content.title;
  if (content?.value) return String(content.value);
  return '';
}

/**
 * 반응형 스타일 적용 (미디어 쿼리)
 */
export function addResponsiveStyles(template: Template): string {
  let responsiveCSS = '';

  const processBlock = (block: BlockData) => {
    if (block.style?.responsive) {
      const { mobile, tablet, desktop } = block.style.responsive;
      
      if (mobile) {
        responsiveCSS += `\n    @media (max-width: 768px) {\n`;
        responsiveCSS += `      #${block.id} {\n`;
        Object.entries(mobile).forEach(([key, value]) => {
          responsiveCSS += `        ${camelToKebab(key)}: ${value};\n`;
        });
        responsiveCSS += `      }\n`;
        responsiveCSS += `    }\n`;
      }

      if (tablet) {
        responsiveCSS += `\n    @media (min-width: 769px) and (max-width: 1024px) {\n`;
        responsiveCSS += `      #${block.id} {\n`;
        Object.entries(tablet).forEach(([key, value]) => {
          responsiveCSS += `        ${camelToKebab(key)}: ${value};\n`;
        });
        responsiveCSS += `      }\n`;
        responsiveCSS += `    }\n`;
      }

      if (desktop) {
        responsiveCSS += `\n    @media (min-width: 1025px) {\n`;
        responsiveCSS += `      #${block.id} {\n`;
        Object.entries(desktop).forEach(([key, value]) => {
          responsiveCSS += `        ${camelToKebab(key)}: ${value};\n`;
        });
        responsiveCSS += `      }\n`;
        responsiveCSS += `    }\n`;
      }
    }

    if (block.children) {
      block.children.forEach(processBlock);
    }
  };

  template.blocks.forEach(processBlock);

  return responsiveCSS;
}
