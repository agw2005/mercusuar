import { selectedDate } from "#view/Ledger/selectedDate.ts";
import { offsetMonthYear } from "#/libs/offsetMonthYear.ts";

const DatePicker = () => {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          selectedDate.value = offsetMonthYear.decrement(
            selectedDate.value,
          );
        }}
      >
        &#8592;
      </button>
      <input
        type="month"
        name="month-picker"
        id="month-picker-element"
        value={selectedDate.value}
        onChange={(e) => {
          selectedDate.value = e.currentTarget.value;
        }}
      />
      <button
        type="button"
        onClick={() => {
          selectedDate.value = offsetMonthYear.increment(
            selectedDate.value,
          );
        }}
      >
        &#8594;
      </button>
    </>
  );
};

export default DatePicker;
