# NexusLearn API

Backend for a mentorship platform where parents manage students, mentors run lessons, and sessions can be summarized using AI.

Built with Node.js, Express, MongoDB, and JWT. Includes a working OpenAI integration for text summarization.

---

## Tech used

- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- express-rate-limit for the LLM endpoint
- OpenAI API (gpt-3.5-turbo)

---

## Project structure

```
src/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── lessonController.js
│   ├── llmController.js
│   ├── sessionController.js
│   └── studentController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── Booking.js
│   ├── Lesson.js
│   ├── Session.js
│   ├── Student.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── lessonRoutes.js
│   ├── llmRoutes.js
│   ├── sessionRoutes.js
│   └── studentRoutes.js
├── services/
│   └── llmService.js
├── utils/
│   ├── jwt.js
│   └── response.js
├── app.js
└── index.js
frontend/
└── index.html
```

---

## Getting started

You need Node.js 18+, a MongoDB database (local or Atlas), and an OpenAI API key.

```bash
git clone <repo-url>
cd nexuslearn-api
npm install
cp .env.example .env
```

Fill in the `.env` file then run:

```bash
npm run dev
```

The server starts at `http://localhost:3000`. The frontend is served from the same port.

---

## Environment variables

Create a `.env` file in the root of the project with these values:

```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexuslearn
JWT_SECRET=pick_a_long_random_string_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
```

`PORT` and `JWT_EXPIRES_IN` are optional. Everything else is required.

---

## API endpoints

All responses follow this shape:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Protected routes need this header:

```
Authorization: Bearer <token>
```

---

### Auth

**POST /auth/signup**

Only parents and mentors can register. Students are created by parents after login.

```json
{
  "name": "Rishabh",
  "email": "rishabh@example.com",
  "password": "mypassword",
  "role": "parent"
}
```

**POST /auth/login**

```json
{
  "email": "rishabh@example.com",
  "password": "mypassword"
}
```

Returns a JWT token in the response. Use it as a Bearer token for all other requests.

**GET /me**

Returns the logged in user's info. Requires auth.

---

### Students

Only accessible by parents.

**POST /students**

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "age": 12
}
```

**GET /students**

Returns all students belonging to the logged in parent.

---

### Lessons

**POST /lessons** — mentor only

```json
{
  "title": "Intro to Python",
  "description": "We cover variables, loops, and functions"
}
```

**GET /lessons** — any authenticated user

**GET /lessons/:id** — any authenticated user

**GET /lessons/:id/sessions** — returns all sessions under a lesson

---

### Bookings

Only accessible by parents.

**POST /bookings**

The student must belong to the parent making the request.

```json
{
  "studentId": "64f3...",
  "lessonId": "64f3..."
}
```

**GET /bookings** — returns all bookings for the parent's students

---

### Sessions

**POST /sessions** — mentor only, must own the lesson

```json
{
  "lessonId": "64f3...",
  "date": "2025-09-10T10:00:00Z",
  "topic": "Variables and data types",
  "summary": "Covered strings, integers, and type casting"
}
```

**POST /sessions/:id/join** — parent only, student must be booked for the lesson

```json
{
  "studentId": "64f3..."
}
```

---

### LLM summarization

**POST /llm/summarize**

Requires auth. Rate limited to 10 requests per minute per IP.

```json
{
  "text": "Your text here, must be at least 50 characters..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "summary": "• Point one\n• Point two\n• Point three",
    "model": "gpt-3.5-turbo"
  }
}
```

Validation:
- Missing or empty text → 400
- Text under 50 characters → 400
- Text over 10,000 characters → 413
- LLM API failure → 502

Example curl:

```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "Artificial intelligence is transforming industries worldwide. Machine learning enables automation of complex tasks. NLP powers chatbots and virtual assistants. Computer vision drives self-driving cars and medical imaging. Researchers and policymakers are working on ethical frameworks to govern responsible AI development."}'
```

---

## Design decisions

Students are not users in the auth system. They live in their own collection and are always linked to a parent. This reflects how the platform actually works — a parent manages their child's learning, the child doesn't have a login.

Role checks happen in middleware using a reusable `authorize()` function so routes stay clean. Each controller only does one thing. The LLM logic is in its own service file so swapping providers later is easy.

Bookings validate that the student actually belongs to the requesting parent. This stops parents from booking other people's students into lessons.

The session join endpoint checks that the student is booked before allowing attendance — no booking means no access.

Error handling is centralized. Mongoose errors like duplicate keys and bad IDs are caught and turned into clean API responses.
