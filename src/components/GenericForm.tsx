import { ComponentChildren, GenericEventHandler } from "preact";
import { snakeToSpaces } from "#/libs/snakeToSpaces.ts";
import { capitalizedCase } from "#/libs/capitalizedCase.ts";

interface GenericFormProps {
  options: {
    formName: string;
    submitText?: string | null;
    onReset?: GenericEventHandler<HTMLFormElement>;
    onSubmit: (e: SubmitEvent) => Promise<void>;
  };
  children: ComponentChildren;
}

const GenericForm = ({
  options: { formName, submitText = null, onReset, onSubmit },
  children,
}: GenericFormProps) => {
  return (
    <form
      data-form-type={formName}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {children}
      <button type="submit" name={`new_${formName}`}>
        {submitText ??
          `Add ${capitalizedCase(snakeToSpaces(formName))}`}
      </button>
    </form>
  );
};

export default GenericForm;
