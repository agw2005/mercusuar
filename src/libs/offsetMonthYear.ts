export const offsetMonthYear = {
    increment: (s: string) => {
        const split = s.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    },
    decrement: (s: string) => { // 2027-01
        const split = s.split("-");
        const year = Number(split[0]); // 2027
        const month = Number(split[1]); // 1
        const nextYear = month === 1 ? year - 1 : year; // 2027
        const nextMonth = month === 1 ? 12 : month - 1; // 12
        return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    },
};
