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
                <Card key={mentor.id}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          {mentor.profileImage ? (
                            <img
                              src={mentor.profileImage}
                              alt={mentor.name}
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
                        <div>
                          <h3 className="text-lg font-semibold">{mentor.name}</h3>
                          {mentor.isMatched && (
                            <Badge variant="warning">매칭됨</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>
                    )}

                    <div className="mb-4">
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