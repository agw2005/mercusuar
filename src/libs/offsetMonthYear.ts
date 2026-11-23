export const offsetMonthYear = {
    increment: (s: string) => {
        const split = s.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        return `${nextYear}-${String(nextMonth).padStart(2, "0")}`
    },
    decrement: (s: string) => {
        const split = s.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        const nextMonth = month === 1 ? 12 : month - 1;
        const nextYear = month === 12 ? year - 1 : year;
        return `${nextYear}-${String(nextMonth).padStart(2, "0")}`
    }
}