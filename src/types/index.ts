export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Person = {
  id: string;
  name: string;
  phone: string;
};

export type Expense = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  categoryId: string;
  paidBy: string;
  involved: string[];
  split: Record<string, number>; // personId -> amount
  splitMode: 'equal' | 'ratio' | 'manual';
  ratios?: Record<string, number>; // used if splitMode is 'ratio'
};

export type Payment = {
  id: string;
  amount: number;
  date: string;
  from: string;
  to: string;
};