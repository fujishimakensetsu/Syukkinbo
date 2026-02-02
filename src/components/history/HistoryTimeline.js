import React from 'react';

const ACTION_LABELS = {
  create: { text: '作成', color: 'bg-green-500' },
  update: { text: '更新', color: 'bg-blue-500' },
  delete: { text: '削除', color: 'bg-red-500' }
};

const FIELD_LABELS = {
  kubun: '区分',
  startTime: '出勤時刻',
  endTime: '退勤時刻',
  furikaeDate: '振替日',
  memo: 'メモ'
};

function formatDate(date) {
  if (!date) return '-';
  if (date instanceof Date) {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date;
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '(なし)';
  }
  return value;
}

export default function HistoryTimeline({ history, showUserName = false }) {
  return (
    <div className="space-y-4">
      {history.map((item, index) => {
        const actionInfo = ACTION_LABELS[item.action] || { text: item.action, color: 'bg-gray-500' };

        return (
          <div
            key={item.id || index}
            className="relative pl-8 pb-4 border-l-2 border-gray-700 last:border-l-transparent"
          >
            {/* タイムラインドット */}
            <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${actionInfo.color}`} />

            {/* カード */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              {/* ヘッダー */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${actionInfo.color}`}>
                  {actionInfo.text}
                </span>
                <span className="text-white font-medium">{item.date}</span>
                {showUserName && (
                  <span className="text-gray-400 text-sm">
                    (User: {item.userId?.substring(0, 8)}...)
                  </span>
                )}
                <span className="text-gray-500 text-sm ml-auto">
                  {formatDate(item.changedAt)}
                </span>
              </div>

              {/* 内容 */}
              {item.action === 'create' && (
                <div className="text-gray-300">
                  <p className="mb-2">新規作成</p>
                  <div className="bg-gray-900/50 rounded p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>区分: <span className="text-white">{formatValue(item.snapshot?.kubun)}</span></div>
                      <div>出勤: <span className="text-white">{formatValue(item.snapshot?.startTime)}</span></div>
                      <div>退勤: <span className="text-white">{formatValue(item.snapshot?.endTime)}</span></div>
                      {item.snapshot?.memo && (
                        <div className="col-span-2">メモ: <span className="text-white">{item.snapshot.memo}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {item.action === 'update' && (
                <div className="text-gray-300">
                  <p className="mb-2">変更内容:</p>
                  <div className="space-y-2">
                    {item.changedFields?.map((field, i) => (
                      <div key={i} className="bg-gray-900/50 rounded p-3 text-sm">
                        <span className="text-gray-400">{FIELD_LABELS[field] || field}:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-400 line-through">
                            {formatValue(item.previousValues?.[field])}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-green-400">
                            {formatValue(item.snapshot?.[field])}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.action === 'delete' && (
                <div className="text-gray-300">
                  <p className="mb-2">削除されたデータ:</p>
                  <div className="bg-gray-900/50 rounded p-3 text-sm text-red-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>区分: <span>{formatValue(item.snapshot?.kubun)}</span></div>
                      <div>出勤: <span>{formatValue(item.snapshot?.startTime)}</span></div>
                      <div>退勤: <span>{formatValue(item.snapshot?.endTime)}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 変更者 */}
              {item.changedBy && item.changedBy !== item.userId && (
                <div className="mt-2 text-xs text-gray-500">
                  変更者: {item.changedBy?.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
