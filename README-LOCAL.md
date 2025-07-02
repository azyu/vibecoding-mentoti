# 로컬 개발 환경 가이드

## 빠른 시작

### 1. 자동 실행 (추천)
```bash
./start-local.sh
```

### 2. 수동 실행

#### 1) 데이터베이스 시작
```bash
# Docker Compose 사용
docker-compose up -d

# 또는 로컬 PostgreSQL 사용
createdb mentor_mentee_db
```

#### 2) 환경 변수 설정
```bash
cd backend
cp .env.example .env
# .env 파일을 열어 필요시 수정
```

#### 3) 의존성 설치
```bash
npm run install:all
```

#### 4) 개발 서버 실행
```bash
npm run dev
```

## 접속 URL

- **프론트엔드**: http://localhost:3030
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui
- **OpenAPI 문서**: http://localhost:8080/openapi.json

## 테스트 계정

### 1. 멘토 계정 생성
1. http://localhost:3030/signup 접속
2. 다음 정보로 가입:
   - 이메일: mentor@test.com
   - 비밀번호: password123
   - 이름: 김멘토
   - 역할: 멘토
   - 기술 스택: JavaScript, React, Node.js

### 2. 멘티 계정 생성
1. http://localhost:3030/signup 접속
2. 다음 정보로 가입:
   - 이메일: mentee@test.com
   - 비밀번호: password123
   - 이름: 이멘티
   - 역할: 멘티

## 주요 기능 테스트

### 멘티로 테스트
1. 멘티 계정으로 로그인
2. "멘토 찾기" 메뉴 클릭
3. 기술 스택으로 필터링
4. 멘토에게 매칭 요청 보내기
5. "보낸 요청" 메뉴에서 상태 확인

### 멘토로 테스트
1. 멘토 계정으로 로그인
2. "받은 요청" 메뉴 클릭
3. 매칭 요청 수락/거절

### 프로필 관리
1. "프로필" 메뉴 클릭
2. 프로필 수정 버튼 클릭
3. 정보 수정 및 프로필 이미지 업로드

## API 테스트 (Swagger UI)

1. http://localhost:8080/swagger-ui 접속
2. `/api/signup` 엔드포인트로 회원가입
3. `/api/login` 엔드포인트로 로그인하여 토큰 획득
4. "Authorize" 버튼 클릭 후 토큰 입력
5. 다른 API 엔드포인트 테스트

## 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 3030 포트 확인 및 종료
lsof -ti:3030 | xargs kill -9

# 8080 포트 확인 및 종료
lsof -ti:8080 | xargs kill -9

# 5432 포트 확인 및 종료
lsof -ti:5432 | xargs kill -9
```

### 데이터베이스 연결 실패
```bash
# Docker 컨테이너 상태 확인
docker ps

# 컨테이너 로그 확인
docker logs mentor-mentee-db

# 컨테이너 재시작
docker-compose restart
```

### 의존성 문제
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

## 개발 도구

### 데이터베이스 GUI 도구
- [TablePlus](https://tableplus.com/) (추천)
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)

### API 테스트 도구
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- 내장 Swagger UI 사용

### 로그 확인
```bash
# 백엔드 로그만 보기
cd backend && npm run start:dev

# 프론트엔드 로그만 보기
cd frontend && npm run dev

# Docker 데이터베이스 로그
docker logs -f mentor-mentee-db
```