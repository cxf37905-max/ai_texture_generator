'use client';

import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocaleLink, useLocaleRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const LoginForm = dynamic(() =>
  import('@/components/auth/login-form').then((module) => module.LoginForm)
);
const RegisterForm = dynamic(() =>
  import('@/components/auth/register-form').then(
    (module) => module.RegisterForm
  )
);

interface LoginWrapperProps {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
  callbackUrl?: string;
  initialView?: 'login' | 'register';
}

export const LoginWrapper = ({
  children,
  mode = 'redirect',
  asChild,
  callbackUrl,
  initialView = 'login',
}: LoginWrapperProps) => {
  const router = useLocaleRouter();
  const t = useTranslations('AuthPage.common');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authView, setAuthView] = useState(initialView);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    // append callbackUrl as a query parameter if provided
    const loginPath = callbackUrl
      ? `${Routes.Login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : `${Routes.Login}`;
    router.push(loginPath);
  };

  // Keep the trigger markup stable during hydration. Once mounted, enhance it
  // with dialog or redirect behavior.
  if (!mounted) {
    return <>{children}</>;
  }

  if (mode === 'modal') {
    return (
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setAuthView(initialView);
        }}
      >
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent
          className={cn(
            'sm:max-w-[400px] p-0',
            authView === 'register' &&
              'max-h-[calc(100dvh-2rem)] overflow-y-auto gap-0'
          )}
        >
          <DialogHeader className="hidden">
            <DialogTitle />
          </DialogHeader>
          {isModalOpen &&
            (authView === 'login' ? (
              <LoginForm
                callbackUrl={callbackUrl}
                className="border-none"
                onSwitchToRegister={() => setAuthView('register')}
              />
            ) : (
              <>
                <RegisterForm
                  callbackUrl={callbackUrl}
                  className="border-none"
                  onSwitchToLogin={() => setAuthView('login')}
                />
                <div className="px-6 pb-5 text-balance text-center text-xs text-muted-foreground">
                  {t('byClickingContinue')}
                  <LocaleLink
                    href={Routes.TermsOfService}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {t('termsOfService')}
                  </LocaleLink>{' '}
                  {t('and')}{' '}
                  <LocaleLink
                    href={Routes.PrivacyPolicy}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {t('privacyPolicy')}
                  </LocaleLink>
                </div>
              </>
            ))}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <span onClick={handleLogin} className="cursor-pointer">
      {children}
    </span>
  );
};
