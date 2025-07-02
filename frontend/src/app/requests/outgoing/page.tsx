'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MatchRequest, MatchRequestStatus, UserRole } from '@/types';

export default function OutgoingRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 인증 로딩이 완료된 후에만 검사
    if (authLoading) return;
    
    if (!user || user.role !== UserRole.MENTEE) {
      router.push('/login');
      return;
    }
    fetchRequests();
  }, [user, authLoading, router]);

  // 인증 로딩 중일 때
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOutgoingRequests();
      setRequests(data);
    } catch (error: any) {
      setError('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('정말 매칭 요청을 취소하시겠습니까?')) return;

    try {
      setActionLoading(requestId);
      await apiClient.cancelRequest(requestId);
      alert('매칭 요청을 취소했습니다.');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || '요청 취소에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: MatchRequestStatus) => {
    switch (status) {
      case MatchRequestStatus.PENDING:
        return <Badge variant="warning">대기중</Badge>;
      case MatchRequestStatus.ACCEPTED:
        return <Badge variant="success">수락됨</Badge>;
      case MatchRequestStatus.REJECTED:
        return <Badge variant="danger">거절됨</Badge>;
    }
  };

  if (!user || user.role !== UserRole.MENTEE) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">보낸 매칭 요청</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">요청 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">보낸 요청이 없습니다.</p>
            <Button className="mt-4" onClick={() => router.push('/mentors')}>
              멘토 찾으러 가기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        {request.mentorProfileImage ? (
                          <img
                            src={request.mentorProfileImage}
                            alt={request.mentorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{request.mentorName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.message && (
                          <p className="text-gray-600 mb-2">{request.message}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        {request.status === MatchRequestStatus.ACCEPTED && (
                          <p className="text-sm text-green-600 mt-2">
                            매칭이 성공했습니다! 멘토와 연락해보세요.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {request.status === MatchRequestStatus.PENDING && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === request.id}
                        onClick={() => handleCancel(request.id)}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}