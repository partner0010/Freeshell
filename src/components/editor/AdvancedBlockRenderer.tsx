'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type {
  TeamBlockContent,
  TimelineBlockContent,
  SocialBlockContent,
  NewsletterBlockContent,
  LogosBlockContent,
  CountdownBlockContent,
  ProcessBlockContent,
  AccordionBlockContent,
  BannerBlockContent,
  ComparisonBlockContent,
  MapBlockContent,
  TeamMember,
  TimelineItem,
  SocialLink,
  LogoItem,
  ProcessStep,
  AccordionItem,
  ComparisonItem,
} from '@/types/block-content';

// 팀 소개 블록
export function TeamBlock({ content }: { content: TeamBlockContent }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
        {content.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {content.members?.map((member, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-card text-center group"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {member.name?.[0]}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-primary-500 text-sm mb-2">{member.role}</p>
            <p className="text-gray-500 text-sm">{member.bio}</p>
            {member.social && (
              <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {Object.entries(member.social).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Icons.Link size={16} />
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 타임라인 블록
export function TimelineBlock({ content }: { content: TimelineBlockContent }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
        {content.title}
      </h2>
      <div className="relative">
        {/* 중앙 라인 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 -translate-x-1/2" />
        
        {content.events?.map((event, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative flex items-center gap-8 mb-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <div className="bg-white rounded-xl p-6 shadow-card inline-block">
                <span className="text-primary-500 font-bold text-lg">{event.year}</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">{event.title}</h3>
                <p className="text-gray-500 mt-2">{event.description}</p>
              </div>
            </div>
            
            {/* 중앙 포인트 */}
            <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow z-10" />
            
            <div className="flex-1" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 소셜 미디어 블록
export function SocialBlock({ content }: { content: SocialBlockContent }) {
  const platformIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    instagram: Icons.Instagram,
    twitter: Icons.Twitter,
    youtube: Icons.Youtube,
    facebook: Icons.Facebook,
    linkedin: Icons.Linkedin,
    github: Icons.Github,
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
        {content.title}
      </h2>
      <p className="text-gray-600 mb-8">{content.subtitle}</p>
      <div className="flex justify-center gap-4 flex-wrap">
        {content.links?.map((link, i: number) => {
          const Icon = platformIcons[link.platform] || Icons.Link;
          return (
            <motion.a
              key={i}
              href={link.url}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl shadow-card hover:shadow-soft transition-shadow min-w-[120px]"
            >
              <Icon size={32} className="text-primary-500" />
              {link.followers && (
                <span className="text-lg font-bold text-gray-900">{link.followers}</span>
              )}
              <span className="text-xs text-gray-500 capitalize">{link.platform}</span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

// 뉴스레터 블록
export function NewsletterBlock({ content }: { content: NewsletterBlockContent }) {
  const [email, setEmail] = useState('');

  return (
    <div className="max-w-2xl mx-auto text-center text-white">
      <h2 className="text-3xl font-display font-bold mb-4">{content.title}</h2>
      <p className="text-white/80 mb-8">{content.subtitle}</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={content.placeholder}
          className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button className="px-8 py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-white/90 transition-colors">
          {content.buttonText}
        </button>
      </div>
      <p className="text-sm text-white/60 mt-4">{content.privacyText}</p>
    </div>
  );
}

// 로고 클라우드 블록
export function LogosBlock({ content }: { content: LogosBlockContent }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-center text-gray-500 text-sm font-medium mb-8">{content.title}</h2>
      <div className="flex items-center justify-center gap-12 flex-wrap opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
        {content.logos?.map((logo: LogoItem, i: number) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1 }}
            className="text-2xl font-bold text-gray-400"
          >
            {logo.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 카운트다운 블록
export function CountdownBlock({ content }: { content: CountdownBlockContent }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(content.targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [content.targetDate]);

  const timeUnits = [
    { label: '일', value: timeLeft.days },
    { label: '시간', value: timeLeft.hours },
    { label: '분', value: timeLeft.minutes },
    { label: '초', value: timeLeft.seconds },
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">{content.title}</h2>
      <div className="flex justify-center gap-4">
        {timeUnits.map((unit, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-card min-w-[100px]">
            <div className="text-4xl font-bold text-primary-600">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 mt-1">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 프로세스/단계 블록
export function ProcessBlock({ content }: { content: ProcessBlockContent }) {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
        {content.title}
      </h2>
      <div className="grid md:grid-cols-4 gap-8">
        {content.steps?.map((step: ProcessStep, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative text-center"
          >
            {/* 연결선 */}
            {i < content.steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200" />
            )}
            
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full text-white text-2xl font-bold mb-4 z-10">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-500 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 아코디언 블록
export function AccordionBlock({ content }: { content: AccordionBlockContent }): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-8">
        {content.title}
      </h2>
      <div className="space-y-3">
        {content.items?.map((item, i: number) => {
          const accordionItem = 'question' in item 
            ? { title: item.question, content: item.answer } 
            : item as AccordionItem;
          return (
          <motion.div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-card"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">{accordionItem.title}</span>
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icons.ChevronDown className="text-gray-400" size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pb-4 text-gray-600">
                    {accordionItem.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 배너 블록
export function BannerBlock({ content }: { content: BannerBlockContent }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center gap-4 text-center">
      <span>{content.message}</span>
      {content.linkText && (
        <a href={content.linkUrl} className="underline font-medium hover:no-underline">
          {content.linkText}
        </a>
      )}
      {content.dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}

// 비교표 블록
export function ComparisonBlock({ content }: { content: ComparisonBlockContent }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-8">
        {content.title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4"></th>
              {content.plans?.map((plan: string, i: number) => (
                <th key={i} className="p-4 text-center">
                  <span className="text-lg font-semibold text-gray-900">{plan}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.features?.map((feature, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="p-4 font-medium text-gray-700">{feature.name}</td>
                <td className="p-4 text-center text-gray-600">{feature.basic}</td>
                <td className="p-4 text-center text-gray-600 bg-primary-50">{feature.pro}</td>
                <td className="p-4 text-center text-gray-600">{feature.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 지도 블록 (플레이스홀더)
export function MapBlock({ content }: { content: MapBlockContent }) {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-8">
        {content.title}
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Icons.Map size={48} className="mx-auto mb-2" />
            <p>지도가 표시될 영역</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.MapPin size={18} className="text-primary-500" />
              주소
            </h3>
            <p className="text-gray-600">{content.address}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.Phone size={18} className="text-primary-500" />
              전화
            </h3>
            <p className="text-gray-600">{content.contactInfo?.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.Mail size={18} className="text-primary-500" />
              이메일
            </h3>
            <p className="text-gray-600">{content.contactInfo?.email}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.Clock size={18} className="text-primary-500" />
              운영 시간
            </h3>
            <p className="text-gray-600">{content.contactInfo?.hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

