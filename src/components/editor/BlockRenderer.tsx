'use client';

import React from 'react';
import { Block, HeroContent, HeaderContent, TextContent, FeaturesContent, 
         TestimonialsContent, PricingContent, ContactContent, FooterContent,
         CTAContent, StatsContent, ImageContent } from '@/types';
import * as Icons from 'lucide-react';
import {
  TeamBlock,
  TimelineBlock,
  SocialBlock,
  NewsletterBlock,
  LogosBlock,
  CountdownBlock,
  ProcessBlock,
  AccordionBlock,
  BannerBlock,
  ComparisonBlock,
  MapBlock,
} from './AdvancedBlockRenderer';

interface BlockRendererProps {
  block: Block;
  isPreview?: boolean;
}

export function BlockRenderer({ block, isPreview }: BlockRendererProps) {
  const renderBlock = () => {
    switch (block.type) {
      case 'header':
        return <HeaderBlock content={block.content as HeaderContent} />;
      case 'hero':
        return <HeroBlock content={block.content as HeroContent} />;
      case 'text':
        return <TextBlock content={block.content as TextContent} />;
      case 'features':
        return <FeaturesBlock content={block.content as FeaturesContent} />;
      case 'testimonials':
        return <TestimonialsBlock content={block.content as TestimonialsContent} />;
      case 'pricing':
        return <PricingBlock content={block.content as PricingContent} />;
      case 'contact':
        return <ContactBlock content={block.content as ContactContent} />;
      case 'footer':
        return <FooterBlock content={block.content as FooterContent} />;
      case 'cta':
        return <CTABlock content={block.content as CTAContent} />;
      case 'stats':
        return <StatsBlock content={block.content as StatsContent} />;
      case 'image':
        return <ImageBlock content={block.content as ImageContent} />;
      case 'divider':
        return <DividerBlock />;
      case 'spacer':
        return <SpacerBlock content={block.content as { height: string }} />;
      // 고급 블록들
      case 'team':
        return <TeamBlock content={block.content as any} />;
      case 'timeline':
        return <TimelineBlock content={block.content as any} />;
      case 'social':
        return <SocialBlock content={block.content as any} />;
      case 'newsletter':
        return <NewsletterBlock content={block.content as any} />;
      case 'logos':
        return <LogosBlock content={block.content as any} />;
      case 'countdown':
        return <CountdownBlock content={block.content as any} />;
      case 'process':
        return <ProcessBlock content={block.content as any} />;
      case 'accordion':
        return <AccordionBlock content={block.content as any} />;
      case 'banner':
        return <BannerBlock content={block.content as any} />;
      case 'comparison':
        return <ComparisonBlock content={block.content as any} />;
      case 'map':
        return <MapBlock content={block.content as any} />;
      default:
        return <div className="p-4 text-gray-400">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div className={`${block.styles.backgroundColor || ''} ${block.styles.padding || ''}`}>
      {renderBlock()}
    </div>
  );
}

// 헤더 블록
function HeaderBlock({ content }: { content: HeaderContent }) {
  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="text-2xl font-display font-bold text-primary-600">
        {content.logo}
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {content.menuItems.map((item, i) => (
          <a
            key={i}
            href={item.link}
            className="text-gray-600 hover:text-primary-500 transition-colors font-medium"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <button className="btn-primary text-sm py-2">
        시작하기
      </button>
    </header>
  );
}

// 히어로 블록
function HeroBlock({ content }: { content: HeroContent }) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
        {content.title}
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        {content.subtitle}
      </p>
      {content.buttonText && (
        <button className="btn-primary text-lg px-8 py-4">
          {content.buttonText}
        </button>
      )}
    </div>
  );
}

// 텍스트 블록
function TextBlock({ content }: { content: TextContent }) {
  const variants = {
    paragraph: 'text-gray-700 leading-relaxed',
    heading1: 'text-4xl font-display font-bold text-gray-900',
    heading2: 'text-3xl font-display font-semibold text-gray-900',
    heading3: 'text-2xl font-display font-medium text-gray-900',
    quote: 'text-xl italic text-gray-600 border-l-4 border-primary-400 pl-6',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={variants[content.variant] || variants.paragraph}>
        {content.content}
      </div>
    </div>
  );
}

// 기능 블록
function FeaturesBlock({ content }: { content: FeaturesContent }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
        {content.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {content.items.map((item, i) => {
          const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string; size?: number }>;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-pastel-lavender to-pastel-sky rounded-xl flex items-center justify-center mb-6">
                {IconComponent ? <IconComponent className="text-primary-600" size={28} /> : null}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 후기 블록
function TestimonialsBlock({ content }: { content: TestimonialsContent }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {content.items.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-8 shadow-card"
          >
            <Icons.Quote className="text-primary-300 mb-4" size={32} />
            <p className="text-gray-700 mb-6 text-lg">{item.quote}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {item.author[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.author}</p>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 가격 블록
function PricingBlock({ content }: { content: PricingContent }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
        {content.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {content.plans.map((plan, i) => (
          <div
            key={i}
            className={`
              rounded-2xl p-8 transition-all duration-300
              ${plan.highlighted
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-105 shadow-glow'
                : 'bg-white shadow-card hover:shadow-soft'
              }
            `}
          >
            <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? '' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className={plan.highlighted ? 'text-white/80' : 'text-gray-500'}>
                {plan.period}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-center gap-3">
                  <Icons.Check size={18} className={plan.highlighted ? 'text-white' : 'text-primary-500'} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`
                w-full py-3 rounded-xl font-medium transition-all
                ${plan.highlighted
                  ? 'bg-white text-primary-600 hover:bg-gray-100'
                  : 'btn-primary'
                }
              `}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 연락처 블록
function ContactBlock({ content }: { content: ContactContent }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-4">
        {content.title}
      </h2>
      <p className="text-center text-gray-600 mb-8">{content.description}</p>
      <form className="space-y-6">
        {content.fields.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                className="input-field min-h-[120px] resize-none"
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="input-field"
                required={field.required}
              />
            )}
          </div>
        ))}
        <button type="submit" className="btn-primary w-full">
          {content.submitText}
        </button>
      </form>
    </div>
  );
}

// 푸터 블록
function FooterBlock({ content }: { content: FooterContent }) {
  return (
    <footer className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="text-2xl font-display font-bold text-white mb-4">
            {content.logo}
          </div>
          <p className="text-gray-400">{content.description}</p>
        </div>
        {content.links.map((group, i) => (
          <div key={i}>
            <h4 className="font-semibold text-white mb-4">{group.title}</h4>
            <ul className="space-y-2">
              {group.items.map((item, ii) => (
                <li key={ii}>
                  <a href={item.link} className="text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
        {content.copyright}
      </div>
    </footer>
  );
}

// CTA 블록
function CTABlock({ content }: { content: CTAContent }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
        {content.title}
      </h2>
      <p className="text-gray-600 mb-8 text-lg">{content.description}</p>
      <a href={content.buttonLink} className="btn-primary inline-block">
        {content.buttonText}
      </a>
    </div>
  );
}

// 통계 블록
function StatsBlock({ content }: { content: StatsContent }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {content.items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">{item.value}</div>
            <div className="text-white/80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 이미지 블록
function ImageBlock({ content }: { content: ImageContent }) {
  return (
    <div className="max-w-4xl mx-auto">
      <img
        src={content.src}
        alt={content.alt}
        className="w-full rounded-2xl shadow-soft"
      />
      {content.caption && (
        <p className="text-center text-gray-500 mt-4 text-sm">{content.caption}</p>
      )}
    </div>
  );
}

// 구분선 블록
function DividerBlock() {
  return (
    <div className="max-w-4xl mx-auto">
      <hr className="border-t-2 border-primary-100" />
    </div>
  );
}

// 여백 블록
function SpacerBlock({ content }: { content: { height: string } }) {
  const heights = {
    small: 'h-8',
    medium: 'h-16',
    large: 'h-24',
  };
  return <div className={heights[content.height as keyof typeof heights] || heights.medium} />;
}

