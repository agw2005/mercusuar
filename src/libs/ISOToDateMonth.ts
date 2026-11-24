export const formatIsoToDayMonth = (
    isoString: string,
    timeZone = "UTC",
): string => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid ISO date string: "${isoString}"`);
    }

    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone,
    }).format(date);
};
