import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserRole } from '../src/entities/user.entity';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let mentorToken: string;
  let menteeToken: string;
  let mentorId: string;
  let menteeId: string;
  let matchRequestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
    
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('인증 및 사용자 관리', () => {
    describe('POST /api/signup', () => {
      it('멘토 회원가입이 성공해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/signup')
          .send({
            email: 'mentor@example.com',
            password: 'password123',
            name: '김멘토',
            role: UserRole.MENTOR,
            bio: '경험이 풍부한 개발자입니다.',
            techStack: ['JavaScript', 'React', 'Node.js'],
          })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('mentor@example.com');
            expect(response.body.user.role).toBe(UserRole.MENTOR);
            mentorToken = response.body.token;
            mentorId = response.body.user.id;
          });
      });

      it('멘티 회원가입이 성공해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/signup')
          .send({
            email: 'mentee@example.com',
            password: 'password123',
            name: '이멘티',
            role: UserRole.MENTEE,
            bio: '열정적인 프로그래밍 입문자입니다.',
          })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.role).toBe(UserRole.MENTEE);
            menteeToken = response.body.token;
            menteeId = response.body.user.id;
          });
      });

      it('중복된 이메일로 회원가입 시 실패해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/signup')
          .send({
            email: 'mentor@example.com',
            password: 'password123',
            name: '다른멘토',
            role: UserRole.MENTOR,
            techStack: ['Python'],
          })
          .expect(409);
      });

      it('멘토 회원가입 시 기술 스택이 없으면 실패해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/signup')
          .send({
            email: 'mentor2@example.com',
            password: 'password123',
            name: '박멘토',
            role: UserRole.MENTOR,
          })
          .expect(400);
      });
    });

    describe('POST /api/login', () => {
      it('유효한 자격증명으로 로그인이 성공해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/login')
          .send({
            email: 'mentor@example.com',
            password: 'password123',
          })
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('mentor@example.com');
          });
      });

      it('잘못된 비밀번호로 로그인 시 실패해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/login')
          .send({
            email: 'mentor@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('GET /api/me', () => {
      it('인증된 사용자의 정보를 조회할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .get('/api/me')
          .set('Authorization', `Bearer ${mentorToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body.email).toBe('mentor@example.com');
            expect(response.body.techStack).toEqual(['JavaScript', 'React', 'Node.js']);
          });
      });

      it('인증 토큰 없이 접근 시 실패해야 함', () => {
        return request(app.getHttpServer())
          .get('/api/me')
          .expect(401);
      });
    });

    describe('PUT /api/profile', () => {
      it('프로필을 수정할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .put('/api/profile')
          .set('Authorization', `Bearer ${mentorToken}`)
          .send({
            name: '김멘토(수정)',
            bio: '수정된 자기소개입니다.',
            techStack: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
          })
          .expect(200)
          .then((response) => {
            expect(response.body.name).toBe('김멘토(수정)');
            expect(response.body.techStack).toContain('TypeScript');
          });
      });
    });
  });

  describe('멘토 검색', () => {
    describe('GET /api/mentors', () => {
      it('멘티가 멘토 목록을 조회할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .get('/api/mentors')
          .set('Authorization', `Bearer ${menteeToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0]).toHaveProperty('techStack');
            expect(response.body.page).toBe(1);
          });
      });

      it('기술 스택으로 필터링할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .get('/api/mentors?techStack=JavaScript')
          .set('Authorization', `Bearer ${menteeToken}`)
          .expect(200)
          .then((response) => {
            const mentors = response.body.data;
            expect(mentors.every((m: any) => m.techStack.includes('JavaScript'))).toBe(true);
          });
      });

      it('멘토가 접근 시 실패해야 함', () => {
        return request(app.getHttpServer())
          .get('/api/mentors')
          .set('Authorization', `Bearer ${mentorToken}`)
          .expect(403);
      });
    });
  });

  describe('매칭 요청 관리', () => {
    describe('POST /api/match-requests', () => {
      it('멘티가 매칭 요청을 보낼 수 있어야 함', () => {
        return request(app.getHttpServer())
          .post('/api/match-requests')
          .set('Authorization', `Bearer ${menteeToken}`)
          .send({
            mentorId: mentorId,
            message: '멘토링 받고 싶습니다!',
          })
          .expect(201)
          .then((response) => {
            expect(response.body.status).toBe('pending');
            expect(response.body.mentorId).toBe(mentorId);
            matchRequestId = response.body.id;
          });
      });

      it('중복 요청 시 실패해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/match-requests')
          .set('Authorization', `Bearer ${menteeToken}`)
          .send({
            mentorId: mentorId,
            message: '다시 요청합니다.',
          })
          .expect(409);
      });

      it('멘토가 매칭 요청을 보내려고 하면 실패해야 함', () => {
        return request(app.getHttpServer())
          .post('/api/match-requests')
          .set('Authorization', `Bearer ${mentorToken}`)
          .send({
            mentorId: menteeId,
            message: '잘못된 요청',
          })
          .expect(403);
      });
    });

    describe('GET /api/match-requests/incoming', () => {
      it('멘토가 받은 요청을 조회할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .get('/api/match-requests/incoming')
          .set('Authorization', `Bearer ${mentorToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].menteeId).toBe(menteeId);
          });
      });
    });

    describe('GET /api/match-requests/outgoing', () => {
      it('멘티가 보낸 요청을 조회할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .get('/api/match-requests/outgoing')
          .set('Authorization', `Bearer ${menteeToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].mentorId).toBe(mentorId);
          });
      });
    });

    describe('PUT /api/match-requests/:id/accept', () => {
      it('멘토가 요청을 수락할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .put(`/api/match-requests/${matchRequestId}/accept`)
          .set('Authorization', `Bearer ${mentorToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body.status).toBe('accepted');
          });
      });
    });

    describe('DELETE /api/match-requests/:id', () => {
      let newRequestId: string;

      beforeAll(async () => {
        // 취소 테스트를 위한 새 요청 생성
        const newMentee = await request(app.getHttpServer())
          .post('/api/signup')
          .send({
            email: 'mentee2@example.com',
            password: 'password123',
            name: '새멘티',
            role: UserRole.MENTEE,
          });

        const response = await request(app.getHttpServer())
          .post('/api/match-requests')
          .set('Authorization', `Bearer ${newMentee.body.token}`)
          .send({
            mentorId: mentorId,
            message: '취소할 요청',
          });

        newRequestId = response.body.id;
      });

      it('멘티가 대기 중인 요청을 취소할 수 있어야 함', () => {
        return request(app.getHttpServer())
          .delete(`/api/match-requests/${newRequestId}`)
          .set('Authorization', `Bearer ${menteeToken}`)
          .expect(204);
      });
    });
  });
});