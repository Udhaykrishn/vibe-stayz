import { createClient, type Client, type InValue, type ResultSet } from '@libsql/client';

export type DatabaseValue = string | number | null;

export class PreparedStatement {
  constructor(
    private readonly client: Client,
    readonly sql: string,
    readonly args: DatabaseValue[] = [],
  ) {}

  bind(...args: DatabaseValue[]) {
    return new PreparedStatement(this.client, this.sql, args);
  }

  private execute(): Promise<ResultSet> {
    return this.client.execute({ sql: this.sql, args: this.args as InValue[] });
  }

  async first<T>() {
    const result = await this.execute();
    return (result.rows[0] as T | undefined) ?? null;
  }

  async all<T>() {
    const result = await this.execute();
    return { results: result.rows as unknown as T[] };
  }

  run() {
    return this.execute();
  }
}

export class Database {
  constructor(private readonly client: Client) {}

  prepare(sql: string) {
    return new PreparedStatement(this.client, sql);
  }

  batch(statements: PreparedStatement[]) {
    return this.client.batch(
      statements.map(({ sql, args }) => ({ sql, args: args as InValue[] })),
      'write',
    );
  }
}

let database: Database | undefined;

export function getDatabase() {
  if (database) return database;
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured.');
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  });
  database = new Database(client);
  return database;
}
