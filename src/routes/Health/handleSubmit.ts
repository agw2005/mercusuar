import { invoke } from "@tauri-apps/api/core";

const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const formType = form.dataset.formType;

  switch (formType) {
    case "weight":
      {
        const rawDate = String(formData.get("weight_date"));
        const value = String(formData.get("weight_value"));

        const date = new Date(rawDate).toISOString();

        console.log({
          form: formType,
          data: {
            date,
            value,
          },
        });
      }
      break;
    case "sleep":
      {
        const rawStart = String(formData.get("sleep_start"));
        const rawEnd = String(formData.get("sleep_end"));

        const start = new Date(rawStart).toISOString();
        const end = new Date(rawEnd).toISOString();

        console.log({
          form: formType,
          data: {
            start,
            end,
          },
        });
      }
      break;
    case "target":
      {
        const weight = Number(formData.get("target_weight"));
        const bodyFat = Number(formData.get("target_body_fat"));

        const date = new Date().toISOString();

        console.log({
          form: formType,
          data: {
            weight,
            bodyFat,
            date,
          },
        });
      }
      break;
    case "progress":
      {
        const rawDate = String(formData.get("progress_date"));
        const age = Number(formData.get("progress_age"));
        const height = Number(formData.get("progress_height"));
        const weight = Number(formData.get("progress_weight"));
        const neck = Number(formData.get("progress_neck"));
        const waist = Number(formData.get("progress_waist"));
        const bodyFat = Number(formData.get("progress_body_fat"));

        const date = new Date(rawDate).toISOString();

        console.log({
          form: formType,
          data: {
            date,
            age,
            height,
            weight,
            neck,
            waist,
            bodyFat,
          },
        });
      }
      break;
    case "exercise":
      {
        const name = String(formData.get("exercise_name"));

        console.log({
          form: formType,
          data: {
            active: true,
            name,
            archive: false,
          },
        });
      }
      break;
    case "entry":
      {
        const fundTypeId = Number(formData.get("investment_fund_type"));
        const name = String(formData.get("investment_name"));
        const unit = String(formData.get("investment_unit"));
        const quantity = Number(formData.get("investment_quantity"));
        const ask = Number(formData.get("investment_ask"));
        const bid = Number(formData.get("investment_ask"));
        const status = true;
        const lastUpdated = new Date().toISOString();

        console.log({
          form: formType,
          data: {
            fundTypeId,
            name,
            unit,
            quantity,
            ask,
            bid,
            status,
            lastUpdated,
          },
        });
      }
      break;
    default:
      console.error("No form of that name exists.");
  }

  invoke("health_ping");
  form.reset();
};

export default handleSubmit;
