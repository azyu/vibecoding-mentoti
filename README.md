# 멘토-멘티 매칭 앱

멘토는 자신의 기술 스택과 소개를 등록하고, 멘티는 원하는 멘토에게 매칭 요청을 보낼 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **프론트엔드**: Next.js, TypeScript, Tailwind CSS
- **백엔드**: NestJS, TypeScript, TypeORM
- **데이터베이스**: PostgreSQL (Supabase)
- **인증**: JWT
- **배포**: Vercel

## 개발 환경 설정

### Node.js 버전

이 저장소의 개발 및 빌드 기준 버전은 Node.js `26.13.0`입니다. 저장소 루트의 `.nvmrc`를 지원하는 버전 관리자에서 사용하거나, Node.js 26.13.0 이상을 설치하세요. npm workspaces를 사용하므로 저장소 루트에서 설치/명령을 실행합니다.

### 1. 의존성 설치

```bash
npm ci
```

### 2. 환경 변수 설정

백엔드 폴더에서 `.env` 파일을 생성하고 다음과 같이 설정:

```bash
cp backend/.env.example backend/.env
```

### 3. 개발 서버 실행

```bash
npm run dev
```

- 프론트엔드: http://localhost:3030
- 백엔드 API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui

## 주요 기능

1. **인증 시스템**: 회원가입/로그인 (JWT 토큰 기반)
2. **사용자 프로필**: 멘토(기술 스택 포함), 멘티 프로필 관리
3. **멘토 검색**: 기술 스택 필터링, 정렬 기능
4. **매칭 시스템**: 요청 보내기, 수락/거절, 상태 관리

## API 문서

- OpenAPI 문서: http://localhost:8080/openapi.json
- 상세 API 명세: [spec/mentor-mentee-api-spec.md](./spec/mentor-mentee-api-spec.md)

## 개발 스크립트

- `npm run dev` - 프론트엔드와 백엔드 동시 실행
- `npm run build` - 전체 프로젝트 빌드
- `npm run lint` - 전체 프로젝트 린팅
- `npm run test` - 전체 프로젝트 테스트

## 프로젝트 구조

```
mentor-mentee-app/
├── frontend/          # Next.js 프론트엔드
├── backend/           # NestJS 백엔드
├── spec/             # API 명세서
└── package.json      # 루트 패키지 설정
```