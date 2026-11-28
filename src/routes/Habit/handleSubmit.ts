import { invoke } from "@tauri-apps/api/core";

const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const formType = form.dataset.formType;

  switch (formType) {
    case "habit":
      {
        const name = String(formData.get("habit_name") ?? "").trim();
        const positive = Boolean(
          Number(formData.get("habit_positive")),
        );
        const stackable = Boolean(
          Number(formData.get("habit_stackable")),
        );
        const rawMetric = String(formData.get("habit_metric") ?? "")
          .trim();
        const rawQuantity = Number(formData.get("habit_quantity"));
        const output = Number(formData.get("habit_output"));

        const metric = !stackable ? null : rawMetric;
        const quantity = !stackable ? null : rawQuantity;

        console.log({
          form: formType,
          data: {
            name,
            positive,
            stackable,
            metric,
            quantity,
            output,
          },
        });
      }
      break;
    case "tracker":
      {
        const habit = Number(formData.get("tracker_habit"));
        const rawQuantity = Number(formData.get("tracker_quantity"));
        const rawDescription = String(
          formData.get("tracker_description"),
        );

        const quantity = rawQuantity === 0 ? null : rawQuantity;
        const description = rawDescription === "" ? null : rawDescription;

        console.log({
          form: formType,
          data: {
            habit,
            quantity,
            description,
          },
        });
      }
      break;
    default:
      console.error("No form of that name exists.");
  }

  invoke("habit_ping");
  form.reset();
};

export default handleSubmit;
