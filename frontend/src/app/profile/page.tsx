'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserRole, UpdateProfileData } from '@/types';
import { getGravatarUrl } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    bio: '',
    techStack: [],
  });
  const [techInput, setTechInput] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 인증 로딩이 완료된 후에만 검사
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    setFormData({
      name: user.name,
      bio: user.bio || '',
      techStack: user.techStack || [],
    });
    setProfileImage(user.profileImage || '');
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTech = () => {
    if (techInput.trim() && formData.techStack && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack?.filter((t) => t !== tech) || [],
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
      setFormData({
        ...formData,
        profileImage: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updatedUser = await apiClient.updateProfile(formData);
      updateUser(updatedUser);
      setEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.message || '프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>내 프로필</CardTitle>
              {!editing && (
                <Button onClick={() => setEditing(true)}>프로필 수정</Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {!editing ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={profileImage || getGravatarUrl(user.email, 200)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <Badge variant={user.role === UserRole.MENTOR ? 'primary' : 'secondary'}>
                      {user.role === UserRole.MENTOR ? '멘토' : '멘티'}
                    </Badge>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">자기소개</h3>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                )}

                {user.role === UserRole.MENTOR && user.techStack && user.techStack.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.techStack.map((tech) => (
                        <Badge key={tech} variant="primary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    프로필 이미지
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={profileImage || getGravatarUrl(user.email, 200)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">.jpg 또는 .png 형식, 최대 5MB</p>
                    </div>
                  </div>
                </div>

                <Input
                  type="text"
                  name="name"
                  label="이름"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    자기소개
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="간단한 자기소개를 작성해주세요"
                  />
                </div>

                {user.role === UserRole.MENTOR && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      기술 스택
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTech();
                          }
                        }}
                        placeholder="예: JavaScript"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddTech}
                      >
                        추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack?.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name,
                        bio: user.bio || '',
                        techStack: user.techStack || [],
                      });
                      setProfileImage(user.profileImage || '');
                      setError('');
                    }}
                  >
                    취소
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}