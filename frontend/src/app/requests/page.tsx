'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export default function RequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      // 멘토인 경우 받은 요청으로, 멘티인 경우 보낸 요청으로 리다이렉션
      if (user.role === UserRole.MENTOR) {
        router.replace('/requests/incoming');
      } else {
        router.replace('/requests/outgoing');
      }
    } else if (!authLoading && !user) {
      // 로그인되지 않은 경우 로그인 페이지로
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 로딩 중입니다...</p>
      </div>
    </div>
  );
}