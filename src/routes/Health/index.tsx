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
            </main>
        </>
    );
};

export default Health;
