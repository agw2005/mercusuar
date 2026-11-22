import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "./handleSubmit";

const Health = () => {
    return (
        <>
            <header>
                <h1>Health</h1>
                <a href="/">Home</a>
                <a href="/ledger">Ledger</a>
                <a href="/habit">Habit</a>
            </header>
            <main>
                <section>
                    <h2>Weights</h2>
                    <GenericForm
                        options={{ formName: `weight`, onSubmit: handleSubmit }}
                    >
                        <label htmlFor="weight_date_element">
                            <input
                                type="datetime-local"
                                name="weight_date"
                                id="weight_date_element"
                            />
                        </label>
                        <label htmlFor="weight_value_element">
                            <input
                                type="number"
                                step="any"
                                name="weight_value"
                                id="weight_value_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Sleeps</h2>
                    <GenericForm
                        options={{ formName: `sleep`, onSubmit: handleSubmit }}
                    >
                        <label htmlFor="sleep_start_element">
                            <span title="Day before">Sleep</span>
                            <input
                                required
                                type="datetime-local"
                                name="sleep_start"
                                id="sleep_start_element"
                            />
                        </label>
                        <label htmlFor="sleep_end_element">
                            <span title="Today">Wake</span>
                            <input
                                required
                                type="datetime-local"
                                name="sleep_end"
                                id="sleep_end_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Targets</h2>
                    <GenericForm
                        options={{ formName: `target`, onSubmit: handleSubmit }}
                    >
                        <label htmlFor="target_weight_element">
                            Weight
                            <input
                                required
                                type="number"
                                step="any"
                                min={0}
                                name="target_weight"
                                id="target_weight_element"
                            />
                        </label>
                        <label htmlFor="target_body_fat_element">
                            Body Fat (%)
                            <input
                                required
                                type="number"
                                step="any"
                                min={0}
                                name="target_body_fat"
                                id="target_body_fat_element"
                            />
                        </label>
                    </GenericForm>
                </section>
            </main>
        </>
    );
};

export default Health;
