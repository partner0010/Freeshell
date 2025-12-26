'use client';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { LanguageScript } from '@/components/i18n/LanguageScript';
import { ToastProvider } from '@/components/ui/Toast';
import { ConnectionIndicator } from '@/components/performance/ConnectionIndicator';
import { GlobalLoadingIndicator } from '@/components/ui/GlobalLoadingIndicator';
import { UserSettingsProvider } from '@/components/settings/UserSettingsProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <UserSettingsProvider>
          <ToastProvider>
            <LanguageScript />
            <ConnectionIndicator />
            <GlobalLoadingIndicator />
            {children}
          </ToastProvider>
        </UserSettingsProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}

