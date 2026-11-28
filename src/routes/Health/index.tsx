import GenericForm from "#/components/GenericForm.tsx";
import { placeholder } from "#/libs/placeholder.ts";
import Layout from "#/components/Layout.tsx";
import handleSubmit from "./handleSubmit.ts";

const Health = () => {
  return (
    <Layout name={`Health`}>
      <section>
        <h2>Weights</h2>
        <GenericForm
          options={{ formName: `weight`, onSubmit: handleSubmit }}
        >
          <label htmlFor="weight_date_element">
            <input
              type="date"
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
      <section>
        <h2>Progress</h2>
        <GenericForm
          options={{
            formName: `progress`,
            onSubmit: handleSubmit,
          }}
        >
          <label htmlFor="progress_date_element">
            Date
            <input
              required
              type="date"
              name="progress_date"
              id="progress_date_element"
            />
          </label>
          <label htmlFor="progress_age_element">
            Age
            <input
              required
              type="number"
              min={0}
              name="progress_age"
              id="progress_age_element"
            />
          </label>
          <label htmlFor="progress_height_element">
            Height
            <input
              required
              type="number"
              step="any"
              min={0}
              name="progress_height"
              id="progress_height_element"
            />
          </label>
          <label htmlFor="progress_weight_element">
            Weight
            <input
              required
              type="number"
              step="any"
              min={0}
              name="progress_weight"
              id="progress_weight_element"
            />
          </label>
          <label htmlFor="progress_neck_element">
            Neck
            <input
              required
              type="number"
              step="any"
              min={0}
              name="progress_neck"
              id="progress_neck_element"
            />
          </label>
          <label htmlFor="progress_waist_element">
            Waist
            <input
              required
              type="number"
              step="any"
              min={0}
              name="progress_waist"
              id="progress_waist_element"
            />
          </label>
          <label htmlFor="progress_body_fat_element">
            Body Fat (%)
            <input
              required
              type="number"
              step="any"
              min={0}
              name="progress_body_fat"
              id="progress_body_fat_element"
            />
          </label>
        </GenericForm>
      </section>
      <section>
        <h2>Exercises</h2>
        <GenericForm
          options={{
            formName: `exercise`,
            onSubmit: handleSubmit,
          }}
        >
          <label htmlFor="exercise_name_element">
            Name
            <input
              required
              type="text"
              name="exercise_name"
              id="exercise_name_element"
            />
          </label>
        </GenericForm>
      </section>
      <section>
        <h2>Entries</h2>
        <GenericForm
          options={{
            formName: `entry`,
            onSubmit: handleSubmit,
          }}
        >
          <label htmlFor="entry_date_element">
            Date
            <input
              required
              type="datetime-local"
              name="entry_date"
              id="entry_date_element"
            />
          </label>
          <label htmlFor="entry_exercise_element">
            Exercise
            <select
              name="entry_exercise"
              id="entry_exercise_element"
            >
              {placeholder.exercises.map((exercise, i) => (
                <option key={i} value={i}>
                  {exercise}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="entry_kilogram_element">
            Kilogram
            <input
              required
              type="number"
              step="any"
              min={0}
              defaultValue={0}
              name="entry_kilogram"
              id="entry_kilogram_element"
            />
          </label>
          <label htmlFor="entry_pound_element">
            Pound
            <input
              required
              type="number"
              step="any"
              min={0}
              defaultValue={0}
              name="entry_pound"
              id="entry_pound_element"
            />
          </label>
          <label htmlFor="entry_bar_element">
            Bar
            <input
              required
              type="number"
              step="any"
              min={0}
              defaultValue={0}
              name="entry_bar"
              id="entry_bar_element"
            />
          </label>
          <label htmlFor="entry_seconds_element">
            Seconds
            <input
              required
              type="number"
              step="any"
              min={0}
              defaultValue={0}
              name="entry_seconds"
              id="entry_seconds_element"
            />
          </label>
          <label htmlFor="entry_rpe_element">
            RPE
            <input
              required
              type="number"
              step={0.1}
              min={0.0}
              defaultValue={0}
              name="entry_rpe"
              id="entry_rpe_element"
            />
          </label>
        </GenericForm>
      </section>
    </Layout>
  );
};

export default Health;
