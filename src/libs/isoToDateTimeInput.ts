export const isoToDateTimeInput = (date: Date) => {
    return date
        .toISOString()
        .slice(0, 16);
};
