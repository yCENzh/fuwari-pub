/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

/**
 * 格式化日期为 MM-DD 格式（用于归档面板等）
 */
export function formatDateToMMDD(date: Date): string {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}
