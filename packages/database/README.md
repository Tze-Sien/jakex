# @repo/database

A shared database package using **Drizzle ORM** with **Supabase PostgreSQL**.

## Setup

### 1. Environment Variables

Create a `.env` file in this package (or at the root of your monorepo) with your Supabase connection string:

```bash
# Copy the example file
cp .env.example .env
```

Then update with your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

You can find this in your Supabase dashboard:
- Go to **Settings** → **Database** → **Connection string**
- Copy the **URI** format
- Replace `[YOUR-PASSWORD]` with your database password

### 2. Install Dependencies

From the root of the monorepo:

```bash
bun install
```

### 3. Generate Migrations

After modifying the schema:

```bash
bun run --filter @repo/database db:generate
```

### 4. Push to Database

Apply schema changes directly (good for development):

```bash
bun run --filter @repo/database db:push
```

Or run migrations (recommended for production):

```bash
bun run --filter @repo/database db:migrate
```

### 5. Drizzle Studio

View and manage your database with Drizzle Studio:

```bash
bun run --filter @repo/database db:studio
```

## Usage in Apps

### 1. Add as a dependency

In your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/database": "*"
  }
}
```

### 2. Import and use

```typescript
import { db, users, eq } from "@repo/database";

// Query all users
const allUsers = await db.select().from(users);

// Query with conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));

// Insert a new user
const newUser = await db
  .insert(users)
  .values({
    email: "user@example.com",
    name: "John Doe",
  })
  .returning();
```

### 3. Using schema types

```typescript
import type { User, NewUser, Post, NewPost } from "@repo/database";

function createUser(data: NewUser): Promise<User> {
  return db.insert(users).values(data).returning().then((r) => r[0]);
}
```

## Package Structure

```
packages/database/
├── src/
│   ├── index.ts      # Main entry - exports everything
│   ├── client.ts     # Database connection setup
│   └── schema.ts     # Drizzle schema definitions
├── drizzle/          # Generated migrations
├── drizzle.config.ts # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── tsup.config.ts    # Build configuration
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `db:generate` | Generate migration files from schema changes |
| `db:migrate` | Run pending migrations |
| `db:push` | Push schema changes directly (dev only) |
| `db:studio` | Open Drizzle Studio |
| `db:pull` | Pull schema from existing database |
| `build` | Build the package |
| `dev` | Build in watch mode |

## Tips for Supabase

1. **Use Connection Pooling**: For serverless environments, use port `6543` with `?pgbouncer=true`
2. **Row Level Security (RLS)**: Drizzle works with Supabase RLS - queries respect the policies
3. **Realtime**: For realtime features, use the Supabase client alongside Drizzle
