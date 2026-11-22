import GenericForm from "#/components/GenericForm.tsx";
import { useSignal } from "@preact/signals";
import { placeholder } from "#/libs/placeholder.ts";

const Habit = () => {
    const newHabitPositive = useSignal(true);
    const newHabitStackable = useSignal(true);
    const newTrackerHabitStackable = useSignal(false);

    return (
        <>
            <header>
                <h1>Habit</h1>
                <a href="/">Home</a>
                <a href="/ledger">Ledger</a>
            </header>
            <main>
                <section>
                    <h2>Habits</h2>
                    <GenericForm options={{ formName: "habit" }}>
                        <label htmlFor="habit_name_element">
                            Name
                            <input
                                type="text"
                                name="habit_name"
                                id="habit_name_element"
                            />
                        </label>
                        <input
                            type="hidden"
                            name="habit_positive"
                            id="habit_positive_element"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                newHabitPositive.value = !newHabitPositive
                                    .value;
                            }}
                        >
                            {newHabitPositive.value
                                ? `Good Habit`
                                : `Bad Habit`}
                        </button>
                        <input
                            type="hidden"
                            name="habit_stackable"
                            id="habit_stackable_element"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                newHabitStackable.value = !newHabitStackable
                                    .value;
                            }}
                        >
                            {newHabitStackable.value
                                ? `Stackable`
                                : `Not stackable`}
                        </button>
                        <label htmlFor="habit_metric_element">
                            Metric
                            <input
                                type="text"
                                name="habit_metric"
                                id="habit_metric_element"
                            />
                        </label>
                        <label htmlFor="habit_quantity_element">
                            Quantity
                            <input
                                type="number"
                                step="any"
                                name="habit_quantity"
                                id="habit_quantity_element"
                            />
                        </label>
                        <label htmlFor="habit_output_element">
                            Output
                            <input
                                type="number"
                                step="any"
                                name="habit_output"
                                id="habit_output_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Trackers</h2>
                    <GenericForm options={{ formName: "tracker" }}>
                        <label htmlFor="tracker_habit_element">
                            Habit
                            <select
                                name="tracker_habit"
                                id="tracker_habit_element"
                                onChange={(e) => {
                                    const habitIndex = Number(
                                        e.currentTarget.value,
                                    );
                                    newTrackerHabitStackable.value =
                                        placeholder.habits[habitIndex]
                                            .stackable;
                                }}
                            >
                                {placeholder.habits.map((habit, i) => {
                                    return (
                                        <option key={i} value={i}>
                                            {habit.stackable
                                                ? `(${habit.quantity} ${habit.metric}) `
                                                : ``}
                                            {habit.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                        {newTrackerHabitStackable.value && (
                            <label htmlFor="tracker_quantity_element">
                                Quantity
                                <input
                                    type="number"
                                    step="any"
                                    name="tracker_quantity"
                                    id="tracker_quantity_element"
                                />
                            </label>
                        )}
                        <label htmlFor="tracker_description_element">
                            Description
                            <textarea
                                name="tracker_description"
                                id="tracker_description_element"
                            />
                        </label>
                    </GenericForm>
                </section>
            </main>
        </>
    );
};

export default Habit;
