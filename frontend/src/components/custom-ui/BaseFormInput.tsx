import { Field, FieldError, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export type BaseFormInputField = {
  state: {
    value: string;
    meta: {
      isTouched: boolean;
      isValid: boolean;
      errors: Array<{ message?: string } | undefined>;
    };
  };
  handleChange: (value: string) => void;
};

type BaseFormInputProps = {
  field: BaseFormInputField;
  name: string;
  title?: string;
  icon?: React.ReactNode;
  type?: React.ComponentProps<"input">["type"];
};

const BaseFormInput = ({
  field,
  name,
  title,
  icon,
  type = "text",
}: BaseFormInputProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      {title != null && title !== "" && (
        <FieldLabel htmlFor={name}>{title}</FieldLabel>
      )}
      <InputGroup>
        {icon != null && (
          <InputGroupAddon align="inline-start">{icon}</InputGroupAddon>
        )}
        <InputGroupInput
          id={name}
          type={type}
          name={name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </InputGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

export default BaseFormInput;
