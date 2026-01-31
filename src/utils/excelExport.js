import * as XLSX from 'xlsx';

/**
 * 勤怠データをExcelファイルとして出力する
 * @param {Object} user - ユーザー情報
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {Object} attendanceData - 勤怠データ
 * @param {Array} dates - 日付配列
 */
export const exportToExcel = (user, year, month, attendanceData, dates) => {
  // ワークブック作成
  const wb = XLSX.utils.book_new();
  
  // ヘッダー行
  const header = [
    ['出勤簿'],
    [],
    [`${year}年`, '', '', `${month}月16日`, '', '', '～', '', `${month === 12 ? 1 : month + 1}月15日`],
    [],
    ['社員ID', '', user.id, '', '', '', '氏名', '', user.name, '', '', '所属', '', user.department],
    [],
    ['出勤日数', '', '', '', '', '指定休日数', '', '', '', '', '振休取得日数', '', '', '', '', '有給取得日数'],
    [],
    ['総就業時間', '', '', '', '', '早出残業時間'],
    [],
    ['日', '', '曜日', '', '区分', '', '', '', '出社', '', '', '退社', '', '', '振替日'],
  ];
  
  // 勤怠データ行
  const dataRows = dates.map(d => {
    const dateKey = d.date.toISOString().split('T')[0];
    const dayData = attendanceData[user.id]?.[dateKey] || {};
    
    return [
      `${d.date.getMonth() + 1}/${d.date.getDate()}`,
      '',
      d.dayOfWeek,
      '',
      dayData.kubun || '',
      '',
      '',
      '',
      dayData.startTime || '',
      '',
      '',
      dayData.endTime || '',
      '',
      '',
      dayData.furikae || ''
    ];
  });
  
  // すべての行を結合
  const wsData = [...header, ...dataRows];
  
  // ワークシート作成
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // 列幅設定
  ws['!cols'] = [
    { wch: 8 },  // A
    { wch: 4 },  // B
    { wch: 6 },  // C
    { wch: 4 },  // D
    { wch: 10 }, // E - 区分
    { wch: 4 },  // F
    { wch: 4 },  // G
    { wch: 4 },  // H
    { wch: 8 },  // I - 出社
    { wch: 4 },  // J
    { wch: 4 },  // K
    { wch: 8 },  // L - 退社
    { wch: 4 },  // M
    { wch: 4 },  // N
    { wch: 10 }, // O - 振替日
  ];
  
  // ワークブックに追加
  XLSX.utils.book_append_sheet(wb, ws, '出勤簿');
  
  // ファイル名生成
  const nextMonth = month === 12 ? 1 : month + 1;
  const fileName = `出勤簿_${user.id}_${user.name}_${year}年${month}月.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
};

/**
 * 御社のExcelテンプレートに合わせたフォーマットで出力する（将来実装）
 * 実際のテンプレートファイルを読み込んで、データを埋め込む形式
 */
export const exportToExcelWithTemplate = async (templateFile, user, year, month, attendanceData, dates) => {
  // テンプレートファイルを読み込む
  const data = await templateFile.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  
  // 原本シートをコピーして使用
  const ws = wb.Sheets['原本'];
  
  if (!ws) {
    alert('テンプレートに「原本」シートが見つかりません');
    return;
  }
  
  // データを埋め込む
  // A1: 年
  ws['A1'] = { t: 'n', v: year };
  // D1: 月
  ws['D1'] = { t: 'n', v: month };
  // A3: 社員ID
  ws['A3'] = { t: 's', v: user.id };
  // G3: 氏名
  ws['G3'] = { t: 's', v: user.name };
  
  // 各日のデータを埋め込む（行13から開始）
  dates.forEach((d, idx) => {
    const row = 13 + idx;
    const dateKey = d.date.toISOString().split('T')[0];
    const dayData = attendanceData[user.id]?.[dateKey] || {};
    
    // E列: 区分
    if (dayData.kubun) {
      ws[`E${row}`] = { t: 's', v: dayData.kubun };
    }
    
    // I列: 出社時刻
    if (dayData.startTime) {
      const [h, m] = dayData.startTime.split(':').map(Number);
      ws[`I${row}`] = { t: 'n', v: (h * 60 + m) / (24 * 60), z: 'h:mm' };
    }
    
    // L列: 退社時刻
    if (dayData.endTime) {
      const [h, m] = dayData.endTime.split(':').map(Number);
      ws[`L${row}`] = { t: 'n', v: (h * 60 + m) / (24 * 60), z: 'h:mm' };
    }
    
    // AG列: 振替日
    if (dayData.furikae) {
      ws[`AG${row}`] = { t: 's', v: dayData.furikae };
    }
  });
  
  // ファイル名生成
  const fileName = `出勤簿_${user.id}_${user.name}_${year}年${month}月.xlsx`;
  
  // ダウンロード
  XLSX.writeFile(wb, fileName);
};
