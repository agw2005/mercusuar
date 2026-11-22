import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { ComponentChildren, GenericEventHandler } from "preact";
import { snakeToSpaces } from "#/libs/snakeToSpaces.ts";
import { capitalizedCase } from "../libs/capitalizedCase";

interface GenericFormProps {
    options: {
        formName: string;
        submitText?: string | null;
        onReset?: GenericEventHandler<HTMLFormElement>;
    };
    children: ComponentChildren;
}

const GenericForm = ({
    options: { formName, submitText = null, onReset },
    children,
}: GenericFormProps) => {
    return (
        <form
            data-form-type={formName}
            onSubmit={handleSubmit}
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
