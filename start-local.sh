#!/bin/bash

echo "🚀 멘토-멘티 매칭 앱 로컬 환경 시작"

# 환경 변수 확인
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env 파일이 없습니다. .env.example을 복사합니다..."
    cp backend/.env.example backend/.env
fi

# Docker Compose로 데이터베이스 시작
echo "🐘 PostgreSQL 데이터베이스 시작..."
docker-compose up -d

# 데이터베이스가 준비될 때까지 대기
echo "⏳ 데이터베이스 준비 중..."
sleep 5

# 의존성 설치
echo "📦 의존성 설치 중..."
npm run install:all

# 개발 서버 시작
echo "🎯 개발 서버 시작..."
echo "📍 프론트엔드: http://localhost:3030"
echo "📍 백엔드 API: http://localhost:8080/api"
echo "📍 Swagger UI: http://localhost:8080/swagger-ui"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

npm run dev