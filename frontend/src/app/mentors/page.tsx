'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Mentor, MentorListQuery, UserRole, MatchRequest } from '@/types';
import { getGravatarUrl } from '@/lib/utils';

export default function MentorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<MentorListQuery>({
    name: '',
    techStack: [],
    sortBy: 'createdAt',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState('');
  const [requestModal, setRequestModal] = useState<{ mentorId: string; mentorName: string } | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);

  useEffect(() => {
    // 인증 로딩이 완료된 후에만 검사
    if (authLoading) return;
    
    if (!user || user.role !== UserRole.MENTEE) {
      router.push('/login');
      return;
    }
    fetchMentors();
  }, [user, authLoading, router, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 멘토 목록과 보낸 요청 목록을 동시에 가져오기
      const [mentorsResponse, requestsResponse] = await Promise.all([
        apiClient.getMentors(filters),
        apiClient.getOutgoingRequests()
      ]);
      
      setMentors(mentorsResponse.data);
      setTotalPages(mentorsResponse.totalPages);
      setSentRequests(requestsResponse);
    } catch (error: any) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = fetchData; // 기존 호출 유지를 위한 별칭

  // 특정 멘토에게 이미 요청을 보냈는지 확인
  const hasRequestSent = (mentorId: string) => {
    return sentRequests.some(request => 
      request.mentorId === mentorId && 
      (request.status === 'pending' || request.status === 'accepted')
    );
  };

  // 요청 상태에 따른 버튼 텍스트 및 상태 반환
  const getRequestButtonInfo = (mentorId: string) => {
    const request = sentRequests.find(req => req.mentorId === mentorId);
    
    if (!request) {
      return { text: '매칭 요청', disabled: false, variant: 'primary' as const };
    }
    
    switch (request.status) {
      case 'pending':
        return { text: '요청 대기중', disabled: true, variant: 'outline' as const };
      case 'accepted':
        return { text: '매칭 완료', disabled: true, variant: 'outline' as const };
      case 'rejected':
        return { text: '매칭 요청', disabled: false, variant: 'primary' as const };
      default:
        return { text: '매칭 요청', disabled: false, variant: 'primary' as const };
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  const handleAddTechFilter = () => {
    if (techInput.trim() && !filters.techStack?.includes(techInput.trim())) {
      setFilters({
        ...filters,
        techStack: [...(filters.techStack || []), techInput.trim()],
        page: 1,
      });
      setTechInput('');
    }
  };

  const handleRemoveTechFilter = (tech: string) => {
    setFilters({
      ...filters,
      techStack: filters.techStack?.filter((t) => t !== tech) || [],
      page: 1,
    });
  };

  const handleSendRequest = async () => {
    if (!requestModal) return;

    try {
      setRequestLoading(requestModal.mentorId);
      await apiClient.createMatchRequest({
        mentorId: requestModal.mentorId,
        message: requestMessage,
      });
      setRequestModal(null);
      setRequestMessage('');
      alert('매칭 요청을 보냈습니다!');
      fetchMentors();
    } catch (error: any) {
      alert(error.response?.data?.message || '요청 전송에 실패했습니다.');
    } finally {
      setRequestLoading(null);
    }
  };

  const sortOptions = [
    { value: 'createdAt', label: '최신순' },
    { value: 'name', label: '이름순' },
  ];

  if (!user || user.role !== UserRole.MENTEE) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">멘토 찾기</h1>

        <Card className="mb-6">
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  name="name"
                  placeholder="이름으로 검색"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
                
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="기술 스택 필터"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechFilter();
                      }
                    }}
                  />
                  <Button onClick={handleAddTechFilter}>추가</Button>
                </div>

                <Select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  options={sortOptions}
                />
              </div>

              {filters.techStack && filters.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.techStack.map((tech) => (
                    <Badge key={tech} variant="primary">
                      {tech}
                      <button
                        onClick={() => handleRemoveTechFilter(tech)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">멘토 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardBody>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 ring-2 ring-white shadow-md">
                          <img
                            src={mentor.profileImage || getGravatarUrl(mentor.email, 200)}
                            alt={mentor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{mentor.email}</p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              멘토
                            </span>
                            {mentor.isMatched && (
                              <Badge variant="warning">매칭됨</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {mentor.bio && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1 font-medium">멘토 소개</p>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{mentor.bio}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">기술 스택</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={getRequestButtonInfo(mentor.id).variant}
                      disabled={
                        mentor.isMatched || 
                        getRequestButtonInfo(mentor.id).disabled || 
                        requestLoading === mentor.id
                      }
                      onClick={() => {
                        if (!getRequestButtonInfo(mentor.id).disabled && !mentor.isMatched) {
                          setRequestModal({ mentorId: mentor.id, mentorName: mentor.name });
                        }
                      }}
                    >
                      {requestLoading === mentor.id 
                        ? '요청 중...' 
                        : mentor.isMatched 
                          ? '이미 매칭됨' 
                          : getRequestButtonInfo(mentor.id).text
                      }
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                >
                  이전
                </Button>
                <span className="px-4 py-2">
                  {filters.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}

        {requestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">
                  {requestModal.mentorName}님께 매칭 요청
                </h3>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="멘토에게 전달할 메시지를 작성해주세요 (선택사항)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendRequest}
                    disabled={requestLoading === requestModal.mentorId}
                  >
                    {requestLoading === requestModal.mentorId ? '전송 중...' : '요청 보내기'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRequestModal(null);
                      setRequestMessage('');
                    }}
                  >
                    취소
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}