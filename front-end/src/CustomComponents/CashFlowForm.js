// CashFlowForm.js (React Component)
import { useState } from 'react';
import axios from 'axios';

export default function CashFlowForm() {
  const [formData, setFormData] = useState({
    date: '',
    mid: '',
    amount: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/cashflow', formData);
      setStatus(res.data.msg);
    } catch (err) {
      setStatus(err.response?.data?.msg || 'Error submitting cash flow.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Insert Cash Flow</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="mid"
          value={formData.mid}
          onChange={handleChange}
          placeholder="Machine ID"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
}
