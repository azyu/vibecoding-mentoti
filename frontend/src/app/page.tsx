'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-theme(spacing.32))] flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            멘토-멘티 매칭 플랫폼
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            전문가 멘토와 열정적인 멘티를 연결하여<br />
            함께 성장하는 기회를 만들어갑니다.
          </p>

          {loading ? (
            <div className="text-gray-500">로딩 중...</div>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                안녕하세요, {user.name}님! ({user.role === UserRole.MENTOR ? '멘토' : '멘티'})
              </p>
              <div className="flex gap-4 justify-center">
                {user.role === UserRole.MENTEE ? (
                  <>
                    <Link href="/mentors">
                      <Button size="lg">멘토 찾기</Button>
                    </Link>
                    <Link href="/requests/outgoing">
                      <Button size="lg" variant="outline">보낸 요청</Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/requests/incoming">
                    <Button size="lg">받은 요청 확인</Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button size="lg" variant="secondary">프로필 관리</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3">멘티를 위한 기능</h3>
                  <ul className="text-left text-gray-600 space-y-2">
                    <li>✓ 전문 분야별 멘토 검색</li>
                    <li>✓ 기술 스택으로 필터링</li>
                    <li>✓ 간편한 매칭 요청</li>
                    <li>✓ 요청 상태 실시간 확인</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3">멘토를 위한 기능</h3>
                  <ul className="text-left text-gray-600 space-y-2">
                    <li>✓ 전문 분야 프로필 등록</li>
                    <li>✓ 매칭 요청 관리</li>
                    <li>✓ 1:1 멘토링 시스템</li>
                    <li>✓ 멘티 선택권 보장</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">지금 시작하기</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">로그인</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}