import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import type { Expense, Person, Category } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

export default function PublicPanel() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    personId: '',
    categoryId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      const [expSnap, peopleSnap, catSnap] = await Promise.all([
        getDocs(collection(db, 'expenses')),
        getDocs(collection(db, 'people')),
        getDocs(collection(db, 'categories'))
      ]);

      const expensesData = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
      expensesData.sort((a, b) => b.date.localeCompare(a.date));
      setExpenses(expensesData);
      setPeople(peopleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Person[]);
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);
    };
    fetchData();
  }, []);

  const filteredExpenses = expenses.filter(exp => {
    const matchPerson =
      !filters.personId ||
      exp.paidBy === filters.personId ||
      exp.involved.includes(filters.personId);

    const matchCategory = !filters.categoryId || exp.categoryId === filters.categoryId;
    const matchStart = !filters.startDate || exp.date >= filters.startDate;
    const matchEnd = !filters.endDate || exp.date <= filters.endDate;
    return matchPerson && matchCategory && matchStart && matchEnd;
  });

  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || id;
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalByCategory = categories.map(c => ({
    category: c.name,
    color: c.color,
    total: filteredExpenses
      .filter(exp => exp.categoryId === c.id)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(c => c.total > 0);

  const totalByDate = filteredExpenses.reduce((acc, exp) => {
    const label = exp.date;
    const entry = acc.find(e => e.date === label);
    if (entry) {
      entry.total += exp.amount;
    } else {
      acc.push({ date: label, total: exp.amount });
    }
    return acc;
  }, [] as { date: string; total: number }[]).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#e6edf5] font-sans">
      <div className="p-6 bg-white/90 backdrop-blur-md shadow-md rounded-b-xl mb-4">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Gastos Familiares</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Persona</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, personId: '' }))}
                className={`text-sm px-3 py-1 rounded-lg border transition ${filters.personId === ''
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                  }`}
              >
                Todas
              </button>
              {people.map(p => (
                <button
                  key={p.id}
                  onClick={() => setFilters(prev => ({ ...prev, personId: p.id }))}
                  className={`text-sm px-3 py-1 rounded-lg border transition ${filters.personId === p.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                    }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Categoría</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, categoryId: '' }))}
                className={`text-sm px-3 py-1 rounded-lg border transition ${filters.categoryId === ''
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                  }`}
              >
                Todas
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilters(prev => ({ ...prev, categoryId: c.id }))}
                  className={`text-sm px-3 py-1 rounded-lg border transition ${filters.categoryId === c.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2 items-end mt-2 md:mt-0">
            <label className="block w-full text-sm font-medium text-primary">Rango de fechas</label>
            {[
              { label: 'Hoy', days: 0 },
              { label: '1 semana', days: 7 },
              { label: '1 mes', days: 30 },
              { label: '3 meses', days: 90 },
              { label: '6 meses', days: 180 },
              { label: 'Histórico', days: null }
            ].map(({ label, days }) => {
              const today = new Date();
              const todayStr = today.toISOString().split('T')[0];
              const fromStr = days !== null
                ? new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : '';

              const isActive =
                filters.startDate === fromStr &&
                filters.endDate === (days !== null ? todayStr : '');

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      startDate: fromStr,
                      endDate: days !== null ? todayStr : ''
                    }));
                  }}
                  className={`text-sm px-3 py-1 rounded-lg border transition ${isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                >
                  {label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setFilters({ personId: '', categoryId: '', startDate: '', endDate: '' })}
              className="ml-auto text-sm px-3 py-1 rounded-lg bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 transition"
            >
              Limpiar filtros
            </button>
          </div>

        </div>
      </div>

      <main className="p-6 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Resumen de Deudas</h2>
          <div className="overflow-x-auto bg-white/80 p-4 rounded-xl shadow border border-secondary/10">
            <table className="min-w-full text-sm">
              <thead className="text-left text-primary font-semibold border-b">
                <tr>
                  <th className="py-2">Deudor</th>
                  <th className="py-2">Acreedor</th>
                  <th className="py-2">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {(() => {
                  const balances: Record<string, number> = {};
                  people.forEach(p => { balances[p.id] = 0 });

                  // 🔄 Usa todos los gastos (sin aplicar filtros de fecha)
                  expenses.forEach(exp => {
                    exp.involved.forEach(pid => {
                      balances[pid] -= exp.split[pid] || 0;
                    });
                    balances[exp.paidBy] += exp.amount;
                  });

                  const creditors = Object.entries(balances).filter(([, bal]) => bal > 0).sort((a, b) => b[1] - a[1]);
                  const debtors = Object.entries(balances).filter(([, bal]) => bal < 0).sort((a, b) => a[1] - b[1]);

                  const settlements: { from: string; to: string; amount: number }[] = [];

                  let i = 0, j = 0;
                  while (i < debtors.length && j < creditors.length) {
                    const [debtorId, debtorAmt] = debtors[i];
                    const [creditorId, creditorAmt] = creditors[j];
                    const amount = Math.min(-debtorAmt, creditorAmt);

                    settlements.push({ from: debtorId, to: creditorId, amount });

                    balances[debtorId] += amount;
                    balances[creditorId] -= amount;

                    if (balances[debtorId] === 0) i++;
                    if (balances[creditorId] === 0) j++;
                  }

                  return settlements.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-primary">{getPersonName(s.from)}</td>
                      <td className="py-2">{getPersonName(s.to)}</td>
                      <td className="py-2 font-medium text-green-600">${s.amount.toFixed(2)}</td>
                    </tr>
                  ));
                })()}
              </tbody>

            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Gastos Registrados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-secondary text-white text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Título</th>
                  <th className="px-4 py-2 text-left">Categoría</th>
                  <th className="px-4 py-2 text-left">Pagado por</th>
                  <th className="px-4 py-2 text-left">Monto</th>
                  <th className="px-4 py-2 text-left">Involucrados</th>
                  <th className="px-4 py-2 text-left">Reparto</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-secondary/10">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 whitespace-nowrap text-primary font-medium">{exp.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{exp.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{getCategoryName(exp.categoryId)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{getPersonName(exp.paidBy)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">${exp.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{exp.involved.map(id => getPersonName(id)).join(', ')}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {Object.entries(exp.split).map(([id, amount]) => (
                        <div key={id}>{getPersonName(id)}: ${amount.toFixed(2)}</div>
                      ))}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-sm text-gray-500 py-4">
                      No hay gastos con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h1 className="text-2xl font-bold text-primary mb-4">Resumen</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-secondary/10 hover:scale-[1.01] transition">
              <h3 className="text-sm font-semibold text-gray-500">Gastos totales</h3>
              <p className="text-2xl font-bold text-primary mt-1">${totalAmount.toFixed(2)}</p>
            </div>
            {totalByCategory.map(c => (
              <div key={c.category} className="bg-white p-5 rounded-2xl shadow-lg border border-secondary/10 hover:scale-[1.01] transition">
                <h3 className="text-sm font-semibold text-gray-500">{c.category}</h3>
                <p className="text-lg font-bold mt-1 text-primary">${c.total.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {totalByCategory.length > 0 && (
            <div className="bg-white mt-6 p-6 rounded-xl shadow border border-secondary/10">
              <h3 className="text-md font-semibold text-primary mb-4">Distribución por categoría</h3>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={totalByCategory}
                      dataKey="total"
                      nameKey="category"
                      outerRadius={100}
                      label
                    >
                      {totalByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {totalByDate.length > 0 && (
            <div className="bg-white mt-6 p-6 rounded-xl shadow border border-secondary/10">
              <h3 className="text-md font-semibold text-primary mb-4">Gastos en el tiempo</h3>
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <LineChart data={totalByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="total" stroke="#D6A41D" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </main>

    </div>
  );
}
