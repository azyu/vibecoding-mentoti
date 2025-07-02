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
      <div className="min-h-[calc(100vh-theme(spacing.32))]">
        {/* Hero Section */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">mentoti</h1>
                <p className="text-xl text-gray-600 mb-8">
                  전문가 멘토와 열정적인 멘티를 연결하여<br />
                  함께 성장하는 기회를 만들어갑니다.
                </p>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                <img 
                  src="/images/hero-illustration.svg" 
                  alt="멘토와 멘티 매칭 일러스트" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>

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
            <div className="space-y-12">
              {/* Features with Icons */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">주요 기능</h2>
                <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
                  <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <img 
                      src="/images/search-icon.svg" 
                      alt="멘토 검색" 
                      className="w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-200"
                    />
                    <h3 className="text-lg font-semibold mb-2">멘토 검색</h3>
                    <p className="text-gray-600 text-sm">기술 스택으로 필터링하여 원하는 멘토를 찾아보세요</p>
                  </div>
                  <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <img 
                      src="/images/matching-icon.svg" 
                      alt="매칭 시스템" 
                      className="w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-200"
                    />
                    <h3 className="text-lg font-semibold mb-2">스마트 매칭</h3>
                    <p className="text-gray-600 text-sm">mentoti는 AI 기반으로 최적의 멘토-멘티 매칭을 제공합니다</p>
                  </div>
                  <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <img 
                      src="/images/chat-icon.svg" 
                      alt="1:1 멘토링" 
                      className="w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-200"
                    />
                    <h3 className="text-lg font-semibold mb-2">1:1 멘토링</h3>
                    <p className="text-gray-600 text-sm">개인 맞춤형 멘토링으로 집중적인 성장을 경험하세요</p>
                  </div>
                  <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <img 
                      src="/images/growth-icon.svg" 
                      alt="성장 추적" 
                      className="w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-200"
                    />
                    <h3 className="text-lg font-semibold mb-2">성장 추적</h3>
                    <p className="text-gray-600 text-sm">멘토링 과정과 성장 지표를 체계적으로 관리합니다</p>
                  </div>
                </div>
              </div>

              {/* Detailed Features */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 feature-card-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600 text-xl">🎓</span>
                    </div>
                    <h3 className="text-xl font-semibold">멘티를 위한 기능</h3>
                  </div>
                  <ul className="text-left text-gray-600 space-y-3">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      전문 분야별 멘토 검색
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      기술 스택으로 필터링
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      간편한 매칭 요청
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      요청 상태 실시간 확인
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 feature-card-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-xl">👨‍💼</span>
                    </div>
                    <h3 className="text-xl font-semibold">멘토를 위한 기능</h3>
                  </div>
                  <ul className="text-left text-gray-600 space-y-3">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      전문 분야 프로필 등록
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      매칭 요청 관리
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      1:1 멘토링 시스템
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      멘티 선택권 보장
                    </li>
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
      </div>
    </Layout>
  );
}