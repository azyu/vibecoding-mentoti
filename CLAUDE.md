# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 **멘토-멘티 매칭 앱**입니다. 멘토는 자신의 기술 스택과 소개를 등록하고, 멘티는 원하는 멘토에게 매칭 요청을 보낼 수 있는 웹 애플리케이션입니다.

### 기술 요구사항
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- 백엔드 Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI 문서: http://localhost:8080/openapi.json

- Next.JS (Tailwind CSS)
- NestJS
- PostgreSQL (supabase)
- vercel

## 아키텍처

### API 설계
- OpenAPI 우선 설계 원칙을 따름
- JWT 인증 (Bearer 토큰)
- RESTful API 구조

### 주요 기능
1. **인증 시스템**: 회원가입/로그인 (JWT 토큰 기반)
2. **사용자 프로필**: 멘토(기술 스택 포함), 멘티 프로필 관리
3. **멘토 검색**: 기술 스택 필터링, 정렬 기능
4. **매칭 시스템**: 요청 보내기, 수락/거절, 상태 관리

### JWT 클레임 요구사항
- RFC 7519 표준 클레임: `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`
- 커스텀 클레임: `name`, `email`, `role` (mentor/mentee)
- 토큰 유효기간: 1시간

### 프로필 이미지 규격
- 형식: `.jpg` 또는 `.png`
- 크기: 512x512 ~ 1028x1028 픽셀 (정사각형)
- 최대 파일 크기: 5MB
- Base64 인코딩으로 API 전송
- 기본 이미지: 플레이스홀더 이미지 사용

### 보안 요구사항
- SQL 인젝션 방지
- XSS 공격 방지
- OWASP Top 10 취약점 대응

## API 명세서

상세한 API 명세는 `spec/mentor-mentee-api-spec.md` 파일을 참조하세요.

### 주요 엔드포인트
- `POST /api/signup`: 회원가입
- `POST /api/login`: 로그인
- `GET /api/me`: 내 정보 조회
- `PUT /api/profile`: 프로필 수정
- `GET /api/mentors`: 멘토 목록 조회 (멘티용)
- `POST /api/match-requests`: 매칭 요청 (멘티용)
- `GET /api/match-requests/incoming`: 받은 요청 목록 (멘토용)
- `GET /api/match-requests/outgoing`: 보낸 요청 목록 (멘티용)
- `PUT /api/match-requests/:id/accept`: 요청 수락 (멘토용)
- `PUT /api/match-requests/:id/reject`: 요청 거절 (멘토용)
- `DELETE /api/match-requests/:id`: 요청 취소 (멘티용)

## 개발 시 주의사항

1. **매칭 제약사항**
   - 멘토는 동시에 한 명의 멘티와만 매칭 가능
   - 멘티는 한 멘토에게 한 번만 요청 가능
   - 대기중인 요청이 있을 때 다른 멘토에게 중복 요청 불가

2. **데이터베이스**
   - 멘토와 멘티는 같은 사용자 테이블 사용
   - 프로필 이미지도 데이터베이스에 저장
   - 최초 실행 시 자동 초기화 필요

3. **인증**
   - 모든 보호된 엔드포인트에 `Authorization: Bearer <token>` 헤더 필수
   - JWT 토큰 검증 및 사용자 권한 확인
