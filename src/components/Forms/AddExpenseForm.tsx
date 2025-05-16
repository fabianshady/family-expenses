import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Expense, Person, Category } from '../../types';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

export default function AddExpenseForm() {
  const { register, handleSubmit } = useForm();
  const [splitMode, setSplitMode] = useState<'equal' | 'ratio' | 'manual'>('equal');
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const peopleSnap = await getDocs(collection(db, 'people'));
      const categorySnap = await getDocs(collection(db, 'categories'));
      setPeople(peopleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
      setCategories(categorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    const involved = people.filter(p => data[`involved_${p.id}`]);
    let split: Record<string, number> = {};

    if (splitMode === 'equal') {
      const part = Number(data.amount) / involved.length;
      involved.forEach(p => split[p.id] = parseFloat(part.toFixed(2)));
    } else if (splitMode === 'ratio') {
      const totalParts = involved.reduce((sum, p) => sum + Number(data[`ratio_${p.id}`] || 1), 0);
      involved.forEach(p => {
        const ratio = Number(data[`ratio_${p.id}`] || 1);
        split[p.id] = parseFloat(((Number(data.amount) * ratio) / totalParts).toFixed(2));
      });
    } else {
      involved.forEach(p => {
        split[p.id] = parseFloat(data[`manual_${p.id}`] || 0);
      });
    }

    const baseExpense: Omit<Expense, 'id'> = {
      title: data.title,
      description: data.description,
      amount: Number(data.amount),
      date: data.date,
      categoryId: data.categoryId || '',
      paidBy: data.paidBy,
      involved: involved.map(p => p.id),
      split,
      splitMode
    };

    if (splitMode === 'ratio') {
      baseExpense.ratios = involved.reduce((obj, p) => {
        obj[p.id] = Number(data[`ratio_${p.id}`] || 1);
        return obj;
      }, {} as Record<string, number>);
    }

    try {
      await addDoc(collection(db, 'expenses'), baseExpense);
      alert('Gasto guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar el gasto');
    }
  };

  return (
    <div className="bg-light p-6 rounded-xl shadow-md border border-secondary/20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-primary font-semibold mb-1">Título</label>
          <input {...register('title')} className="w-full border border-secondary focus:border-primary focus:ring-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Descripción</label>
          <textarea {...register('description')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Monto</label>
          <input type="number" step="0.01" {...register('amount')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Fecha</label>
          <input type="date" {...register('date')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Categoría</label>
          <select {...register('categoryId')} className="w-full border border-secondary p-2 rounded">
            <option value="">Selecciona una categoría</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Persona que pagó</label>
          <select {...register('paidBy')} className="w-full border border-secondary p-2 rounded">
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Personas involucradas</label>
          {people.map(p => (
            <label key={p.id} className="block text-sm text-primary">
              <input type="checkbox" {...register(`involved_${p.id}`)} className="mr-2" /> {p.name}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Modo de reparto</label>
          <select value={splitMode} onChange={(e) => setSplitMode(e.target.value as any)} className="w-full border border-secondary p-2 rounded">
            <option value="equal">Partes iguales</option>
            <option value="ratio">Por partes</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {splitMode === 'ratio' && (
          <div>
            <label className="block text-primary font-semibold mb-1">Partes por persona</label>
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2 mb-2">
                <span className="w-24 text-sm text-primary">{p.name}</span>
                <input type="number" min="1" {...register(`ratio_${p.id}`)} className="border border-secondary p-2 rounded w-24" />
              </div>
            ))}
          </div>
        )}

        {splitMode === 'manual' && (
          <div>
            <label className="block text-primary font-semibold mb-1">Monto por persona</label>
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2 mb-2">
                <span className="w-24 text-sm text-primary">{p.name}</span>
                <input type="number" step="0.01" {...register(`manual_${p.id}`)} className="border border-secondary p-2 rounded w-24" />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-light px-4 py-2 rounded hover:bg-gold transition font-semibold shadow"
        >
          Guardar gasto
        </button>
      </form>
    </div>
  );
}
