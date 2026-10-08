# Assessment

## Project set-up

**Requirements**

- Node.js 22.22 or newer (`nvm use` picks the version from `.nvmrc`)
- pnpm 12: run `corepack enable` once and the right version is used automatically
- MongoDB: a local installation, a Docker container (`docker run -d -p 27017:27017 mongo`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

**Getting started**

1. Copy `.env.example` to `.env` and set `MONGODB_URI` if you don't use a local MongoDB
2. Install dependencies: `pnpm i`
3. Start the application and the API: `pnpm dev`
   - React app: http://localhost:4200
   - GraphQL API and Apollo Sandbox: http://localhost:3000/graphql

You can also start them separately with `pnpm dev:app` and `pnpm dev:api`.

- Run the API tests: `npx nx test graphql-api`

## Exercise

**Objective:**

- Design a MongoDB schema and write queries that demonstrate your understanding of NoSQL data modeling and efficient query architecture.
- Demonstrate your proficiency in building backend services using NestJS with TypeScript.
- Showcase your expertise in building front-end applications using React.

**Scenario:**

You are tasked with creating a simple blog application that has the following features:

- Users can create posts.
- Each post can have multiple comments.
- Users can like posts and comments.

**Tasks:**

1. MongoDB Schema Design:

   - Design a MongoDB schema for the blog application using the scenario above. Create the necessary collections and fields. Consider relationships and indexing strategies to ensure efficient queries.
   - Provide a brief explanation of your design choices and how they support the application's functionality and performance.

2. Mongoose Query Architecture:

   - Write a mutation to add a new post to the application
   - Write a mutation to add a new comment to a specific post.
   - Write a mutation to like a specific post or comment.
   - Write a query to fetch all posts including the number of likes each post has, the posts comments and the number of likes each comment has.
   - Write a query to find the most liked post in the application.

3. React Components:

   - Update the `<Article />` component to display a button to like a post.
   - Update the `<Article />` component to display the number of likes a post has.
   - Update the `<Article />` component to display an input to add a comment to a post.
   - Update the `<Article />` component to display the comments of a post.
   - Update the `<Article />` component to display a button to like a comment.
   - Update the `<Article />` component to display the number of likes each comment has.
   - Ensure components are optimized for performance (use React hooks and memoization where appropriate).

4. AI Integration (see [Working with the LLM](#working-with-the-llm)):

   - **Comment moderation:** before a new comment is stored, use the `LlmService` to check whether it is appropriate. Decide, and explain, what happens to a comment that is flagged, and what happens when the check itself fails.
   - **Discussion summary:** add a "Summarize discussion" button to the `<Article />` component that shows a summary of the post's comments, streamed into the UI as it is generated.
   - Treat the LLM like any other unreliable dependency: it is slow, it sometimes fails, and it does not always do what it is told. Build these features the way you would for production.

**Evaluation Criteria**:

- Schema design quality, efficiency of queries, and clarity of explanations.
- Component design, state management, performance optimizations, and styling.
- User interface and experience
- Code quality & technical best practices
- Usage of Typescript
- Robustness of the AI integration: error handling, output validation, user experience while waiting, and awareness of security and cost
- Communication about your approach

**Deliverables:**

- Code on GitHub
  - MongoDB schema files in the NestJS-project
  - Explanation of schema design choices (short write-up in comments)
  - MongoDB queries as specified above, available for use in the `ArticlesService` in the NestJS-project.
  - React components as specified above, implemented in the React-project.
  - The AI features as specified above, in both projects.
- GitHub commit history
  - A commit history that reflects the development process, showcasing thoughtful progress, and adherence to best coding practices.
- Timesheet
  - A documented timesheet or log of hours spent on various aspects of the project, providing insight into the development effort and time management.
- Live demo
  - A live demonstration of the application's functionality

> **About AI tools:** you may use AI (coding assistants, chat tools, agents) wherever it helps you. What matters most to us is your thought process: be ready to explain every part of your solution, why you chose it and what the alternatives were. Code you can't explain counts against you, however well it works.

## Working with the LLM

You don't need an AI account or API key. The API comes with an `LlmService` (`apps/graphql-api/src/llm`) that you can inject anywhere:

```ts
constructor(private readonly llm: LlmService) {}

const { text, usage } = await this.llm.complete({ system, prompt, json: true })

for await (const chunk of this.llm.stream({ system, prompt })) {
  // ...
}
```

By default it uses a **mock model** that runs locally and behaves like a real model would in production: it takes a few seconds to answer, streams its output, occasionally fails and doesn't always stick to the requested format. Its answers are rule-based and not very clever; that's fine, as this exercise is about the integration, not the model.

You can configure it in `.env` (see `.env.example`):

| Variable         | Default | Description                                                                            |
| ---------------- | ------- | -------------------------------------------------------------------------------------- |
| `LLM_PROVIDER`   | `mock`  | `mock`, or `ollama` to use a real model running on your machine                        |
| `LLM_MOCK_CHAOS` | `0.1`   | Probability (0–1) that a call misbehaves. Use `0` while you get started                |
| `LLM_MOCK_SEED`  | random  | Same seed = same sequence of delays and failures                                       |
| `LLM_MOCK_FORCE` | —       | Make every call fail one way: `timeout`, `rate-limit`, `malformed-json` or `interrupt` |

**Moderation.** The mock flags insults, profanity, spam and threats (in English, Dutch and French). These are guaranteed to be flagged:

- `You idiot` (insult)
- `Click here for free money` (spam)
- `I will hurt you` (threat)

Comments without such language come back unflagged. The mock is less thorough than a real model, so don't use it to judge the quality of the moderation itself.

**Optional: a real model.** Install [Ollama](https://ollama.com), run `ollama pull llama3.2` and set `LLM_PROVIDER=ollama`. Your code shouldn't need to change.
