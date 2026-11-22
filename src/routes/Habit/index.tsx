import GenericForm from "#/components/GenericForm.tsx";
import { useSignal } from "@preact/signals";

const Habit = () => {
    const newHabitPositive = useSignal(true);
    const newHabitStackable = useSignal(true);
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
            </main>
        </>
    );
};

export default Habit;
