import React, { type JSX } from 'react';

/**
 * Represents a single audit log entry for a grade change.
 */
export interface LogEntry {
    action: string;
    timestamp: string | number | Date;
    user: string;
}

interface GradingLogProps {
    logEntries: LogEntry[];
}

export default function GradingLog({ logEntries }: GradingLogProps): JSX.Element {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Grade Change Log</h3>
            
            {logEntries.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No recent activity found.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {logEntries.map((entry, index) => (
                        <li key={`${entry.timestamp}-${index}`} className="py-3">
                            <p className="text-sm font-medium text-gray-900">
                                {entry.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(entry.timestamp).toLocaleString()} • 
                                <span className="ml-1 font-semibold text-gray-600">
                                    {entry.user}
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}