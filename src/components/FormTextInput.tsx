import { View, TextInput, StyleProp, TextStyle } from "react-native";
import { Controller, Control, FieldValues } from "react-hook-form";

interface FormTextProps {
  control: Control<FieldValues>;
  name: string;
  label: string;
  secureTextEntry?: boolean;
  textInputStyle: StyleProp<TextStyle>;
}
export default function FormTextInput({
  control,
  name,
  label,
  secureTextEntry,
  textInputStyle,
}: FormTextProps) {
  return (
    <View>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextInput
            {...field}
            placeholder={label}
            secureTextEntry={secureTextEntry}
            style={textInputStyle}
          />
        )}
      />
    </View>
  );
}