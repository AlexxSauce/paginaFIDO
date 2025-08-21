import React from 'react';

export default function DateRangePicker({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1">
          Fecha Inicio:
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1">
          Fecha Fin:
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
