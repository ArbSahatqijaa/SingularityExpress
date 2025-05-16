import React from 'react';

export default function DataTable({ title, columns, data, renderActions, onCreate }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {onCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-150 shadow-sm"
          >
            + Create New
          </button>
        )}
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4">{col.header}</th>
                ))}
                {renderActions && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-100">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-center space-x-2">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No data available</p>
      )}
    </div>
  );
}
