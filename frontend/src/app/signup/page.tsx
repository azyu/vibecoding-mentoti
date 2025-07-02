'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { UserRole } from '@/types';

export default function SignupPage() {
  const { signup, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: UserRole.MENTEE,
    bio: '',
    techStack: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
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
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signup(formData);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: UserRole.MENTEE, label: '멘티' },
    { value: UserRole.MENTOR, label: '멘토' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              로그인하기
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                name="email"
                label="이메일"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="user@example.com"
              />

              <Input
                type="password"
                name="password"
                label="비밀번호 (8자 이상)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="••••••••"
              />

              <Input
                type="text"
                name="name"
                label="이름"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="홍길동"
              />

              <Select
                name="role"
                label="역할"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
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
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="간단한 자기소개를 작성해주세요"
                />
              </div>

              {formData.role === UserRole.MENTOR && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    기술 스택 (멘토 필수)
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
                    {formData.techStack.map((tech) => (
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading || (formData.role === UserRole.MENTOR && formData.techStack.length === 0)}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}