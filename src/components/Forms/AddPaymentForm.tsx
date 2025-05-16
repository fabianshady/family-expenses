import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import type { Payment, Person } from '../../types';

export default function AddPaymentForm() {
  const { register, handleSubmit } = useForm();
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      const snap = await getDocs(collection(db, 'people'));
      setPeople(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    };
    fetchPeople();
  }, []);

  const onSubmit = async (data: any) => {
    const payment: Omit<Payment, 'id'> = {
      amount: Number(data.amount),
      date: data.date,
      from: data.from,
      to: data.to,
    };

    try {
      await addDoc(collection(db, 'payments'), payment);
      alert('Pago guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar el pago');
    }
  };

  return (
    <div className="bg-light p-6 rounded-xl shadow-md border border-secondary/20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-primary font-semibold mb-1">Monto</label>
          <input type="number" step="0.01" {...register('amount')} className="w-full border border-secondary focus:border-primary focus:ring-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Fecha</label>
          <input type="date" {...register('date')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Persona que paga</label>
          <select {...register('from')} className="w-full border border-secondary p-2 rounded">
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Persona que recibe</label>
          <select {...register('to')} className="w-full border border-secondary p-2 rounded">
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-primary text-light px-4 py-2 rounded hover:bg-gold transition font-semibold shadow">
          Guardar pago
        </button>
      </form>
    </div>
  );
}
