import { Session, User } from '@supabase/supabase-js';

// In-memory / LocalStorage mini-database to mock Supabase for demo purposes
class MockDatabase {
  private storage: { [table: string]: any[] } = {};

  constructor() {
    this.loadFromStorage();
    this.ensureDemoData();
  }

  private ensureDemoData() {
    if (!this.storage['gyms']) this.storage['gyms'] = [];
    if (!this.storage['gyms'].find(g => g.id === 'demo-gym-id')) {
      this.storage['gyms'].push({
        id: 'demo-gym-id',
        name: 'Mera Gym Fitness Center',
        email: 'kingclub2141@gmail.com',
        phone: '6390008506',
        address: 'Varanasi, Kamachha',
        created_at: new Date().toISOString()
      });
    }

    if (!this.storage['users']) this.storage['users'] = [];
    if (!this.storage['users'].find(u => u.email === 'kingclub2141@gmail.com')) {
      this.storage['users'].push({
        id: 'demo-user-id',
        name: 'razaul',
        email: 'kingclub2141@gmail.com',
        phone: '6390008506',
        role: 'admin',
        gym_id: 'demo-gym-id',
        created_at: new Date().toISOString()
      });
    }

    if (!this.storage['plans']) this.storage['plans'] = [];
    if (this.storage['plans'].length === 0) {
      this.storage['plans'].push(
        { id: 'p1', gym_id: 'demo-gym-id', plan_name: 'Monthly Basic', plan_type: 'Gym', amount: 1000, duration_value: 1, duration_type: 'month', is_active: true },
        { id: 'p2', gym_id: 'demo-gym-id', plan_name: 'Quarterly Pro', plan_type: 'Gym + Cardio', amount: 2500, duration_value: 3, duration_type: 'month', is_active: true },
        { id: 'p3', gym_id: 'demo-gym-id', plan_name: 'Annual Elite', plan_type: 'Full Access', amount: 8000, duration_value: 1, duration_type: 'year', is_active: true }
      );
    }

    if (!this.storage['members']) this.storage['members'] = [];
    if (this.storage['members'].length === 0) {
      this.storage['members'].push(
        { id: 'm1', gym_id: 'demo-gym-id', member_id: 'M-1001', name: 'John Doe', phone: '9876543210', status: 'Active', joining_date: '2024-01-01' },
        { id: 'm2', gym_id: 'demo-gym-id', member_id: 'M-1002', name: 'Jane Smith', phone: '9876543211', status: 'Active', joining_date: '2024-02-15' }
      );
    }

    if (!this.storage['payments']) this.storage['payments'] = [];
    if (this.storage['payments'].length === 0) {
      this.storage['payments'].push({
        id: 'pay1', gym_id: 'demo-gym-id', receipt_number: 'REC-001', amount: 1000, payment_date: new Date().toISOString(), payment_mode: 'Cash', member_id: 'm1'
      });
    }

    if (!this.storage['expenses']) this.storage['expenses'] = [];
    if (this.storage['expenses'].length === 0) {
      this.storage['expenses'].push({
        id: 'exp1', gym_id: 'demo-gym-id', category: 'Rent', amount: 20000, expense_date: new Date().toISOString(), description: 'Monthly Rent', created_by: 'demo-user-id'
      });
    }

    this.saveToStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('zimme_demo_db');
      if (saved) {
        this.storage = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load demo DB', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('zimme_demo_db', JSON.stringify(this.storage));
    } catch (e) {
      console.error('Failed to save demo DB', e);
    }
  }

  async select(table: string, options: any = {}) {
    if (!this.storage[table]) this.storage[table] = [];
    let data = [...this.storage[table]];

    // Basic filtering
    if (options.filters && options.filters.length > 0) {
      data = data.filter(item => {
        return options.filters.every((filter: any) => {
          if (filter.type === 'eq') return item[filter.column] === filter.value;
          if (filter.type === 'neq') return item[filter.column] !== filter.value;
          if (filter.type === 'gt') return item[filter.column] > filter.value;
          if (filter.type === 'gte') return item[filter.column] >= filter.value;
          if (filter.type === 'lt') return item[filter.column] < filter.value;
          if (filter.type === 'lte') return item[filter.column] <= filter.value;
          if (filter.type === 'in') return Array.isArray(filter.value) && filter.value.includes(item[filter.column]);
          if (filter.type === 'ilike') return String(item[filter.column] || '').toLowerCase().includes(String(filter.value || '').toLowerCase().replace(/%/g, ''));
          return true;
        });
      });
    }

    // Minimal OR support for common patterns
    if (options.orFilter) {
      data = data.filter(item => {
        const conditions = options.orFilter.split(',');
        return conditions.some((cond: string) => {
          const [column, op, value] = cond.split('.');
          const val = value?.replace(/%/g, '');
          if (op === 'eq') return item[column] === val;
          if (op === 'ilike') return String(item[column] || '').toLowerCase().includes(String(val || '').toLowerCase());
          return false;
        });
      });
    }

    if (options.order) {
      const { column, ascending } = options.order;
      data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (options.range) {
      data = data.slice(options.range.from, options.range.to + 1);
    }

    // Minimal join simulation (return original object, we'll manually handle some common ones in AuthContext if needed or here)
    // For now, let's just make it return the data as is. 
    // In real apps, we'd need to mock related tables.
    
    return { data, error: null, count: this.storage[table].length };
  }

  async insert(table: string, values: any | any[]) {
    if (!this.storage[table]) this.storage[table] = [];
    const newItems = Array.isArray(values) ? values : [values];
    const itemsWithIds = newItems.map(item => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...item
    }));
    this.storage[table].push(...itemsWithIds);
    this.saveToStorage();
    return { data: itemsWithIds, error: null };
  }

  async upsert(table: string, values: any | any[]) {
    if (!this.storage[table]) this.storage[table] = [];
    const items = Array.isArray(values) ? values : [values];
    const affected: any[] = [];
    
    items.forEach(item => {
      const existingIndex = this.storage[table].findIndex(i => i.id === item.id || (item.email && i.email === item.email));
      if (existingIndex >= 0) {
        this.storage[table][existingIndex] = { ...this.storage[table][existingIndex], ...item };
        affected.push(this.storage[table][existingIndex]);
      } else {
        const newItem = {
          id: item.id || Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...item
        };
        this.storage[table].push(newItem);
        affected.push(newItem);
      }
    });
    
    this.saveToStorage();
    return { data: affected, error: null };
  }

  async update(table: string, values: any, column: string, value: any) {
    if (!this.storage[table]) return { data: null, error: 'Table not found' };
    let affected: any[] = [];
    this.storage[table] = this.storage[table].map(item => {
      if (item[column] === value) {
        const updated = { ...item, ...values };
        affected.push(updated);
        return updated;
      }
      return item;
    });
    this.saveToStorage();
    return { data: affected, error: null };
  }

  async delete(table: string, column: string, value: any) {
    if (!this.storage[table]) return { data: null, error: 'Table not found' };
    this.storage[table] = this.storage[table].filter(item => item[column] !== value);
    this.saveToStorage();
    return { data: null, error: null };
  }
}

const db = new MockDatabase();

class MockAuth {
  private listeners: ((event: string, session: Session | null) => void)[] = [];

  private broadcast(event: string, session: Session | null) {
    this.listeners.forEach(cb => cb(event, session));
  }

  async getSession() {
    const session = JSON.parse(localStorage.getItem('zimme_session') || 'null');
    return { data: { session }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    const session = JSON.parse(localStorage.getItem('zimme_session') || 'null');
    setTimeout(() => callback('INITIAL_SESSION', session), 0);
    return { data: { subscription: { unsubscribe: () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    } } } };
  }

  async signInWithPassword({ email }: { email: string }) {
    const user: User = { 
      id: 'demo-user-id', 
      email, 
      app_metadata: {}, 
      user_metadata: {}, 
      aud: 'authenticated', 
      created_at: new Date().toISOString() 
    };
    const session: Session = { 
      access_token: 'demo-token', 
      refresh_token: 'demo-token', 
      expires_in: 3600, 
      token_type: 'bearer', 
      user 
    };
    localStorage.setItem('zimme_session', JSON.stringify(session));
    this.broadcast('SIGNED_IN', session);
    return { data: { session, user }, error: null };
  }

  async signUp({ email }: { email: string }) {
    return this.signInWithPassword({ email });
  }

  async createUser({ email }: { email: string }) {
    // Admin operation: Create user without changing current session
    return { data: { user: { id: Math.random().toString(36).substr(2, 9), email } as User }, error: null };
  }

  async signOut() {
    localStorage.removeItem('zimme_session');
    this.broadcast('SIGNED_OUT', null);
    return { error: null };
  }
}

const mockAuth = new MockAuth();

export const mockSupabase = {
  auth: mockAuth,
  from: (table: string) => {
    const filters: any[] = [];
    let orderClause: any = null;
    let rangeClause: any = null;

    const builder: any = {
      select: (columns: string, options: any = {}) => builder,
      eq: (column: string, value: any) => { filters.push({ type: 'eq', column, value }); return builder; },
      neq: (column: string, value: any) => { filters.push({ type: 'neq', column, value }); return builder; },
      gt: (column: string, value: any) => { filters.push({ type: 'gt', column, value }); return builder; },
      gte: (column: string, value: any) => { filters.push({ type: 'gte', column, value }); return builder; },
      lt: (column: string, value: any) => { filters.push({ type: 'lt', column, value }); return builder; },
      lte: (column: string, value: any) => { filters.push({ type: 'lte', column, value }); return builder; },
      ilike: (column: string, value: any) => { filters.push({ type: 'ilike', column, value }); return builder; },
      like: (column: string, value: any) => { filters.push({ type: 'ilike', column, value }); return builder; },
      in: (column: string, values: any[]) => { filters.push({ type: 'in', column, value: values }); return builder; },
      contains: (column: string, value: any) => builder,
      or: (condition: string) => { (builder as any).orFilter = condition; return builder; },
      order: (column: string, options: any = {}) => { orderClause = { column, ...options }; return builder; },
      limit: (n: number) => { rangeClause = { from: 0, to: n - 1 }; return builder; },
      range: (from: number, to: number) => { rangeClause = { from, to }; return builder; },
      single: async () => {
        const { data } = await db.select(table, { filters, orFilter: (builder as any).orFilter, order: orderClause, range: { from: 0, to: 0 } });
        return { data: data[0] || null, error: null };
      },
      maybeSingle: async () => {
        const { data } = await db.select(table, { filters, orFilter: (builder as any).orFilter, order: orderClause, range: { from: 0, to: 0 } });
        return { data: data[0] || null, error: null };
      },
      insert: (values: any) => {
        const promise = db.insert(table, values);
        const chainedBuilder: any = {
          select: () => chainedBuilder,
          single: () => promise.then(res => ({ data: res.data[0], error: res.error })),
          then: (resolve: any) => promise.then(resolve)
        };
        return chainedBuilder;
      },
      upsert: (values: any) => {
        const promise = db.upsert(table, values);
        const chainedBuilder: any = {
          select: () => chainedBuilder,
          single: () => promise.then(res => ({ data: res.data[0], error: res.error })),
          then: (resolve: any) => promise.then(resolve)
        };
        return chainedBuilder;
      },
      update: (values: any) => ({
        eq: async (column: string, value: any) => db.update(table, values, column, value),
        match: async (query: any) => {
          const col = Object.keys(query)[0];
          return db.update(table, values, col, query[col]);
        }
      }),
      delete: () => ({
        eq: async (column: string, value: any) => db.delete(table, column, value)
      }),
      then: (resolve: any) => {
        db.select(table, { filters, orFilter: (builder as any).orFilter, order: orderClause, range: rangeClause }).then(resolve);
      }
    };
    return builder;
  }
};
